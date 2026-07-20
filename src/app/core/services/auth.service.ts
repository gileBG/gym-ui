import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/auth.model';

const TOKEN_KEY = 'gym_token';
const USER_KEY = 'gym_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth';

  private _currentUser = signal<AuthResponse | null>(this.loadUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.rola as UserRole | undefined);
  readonly userId = computed(() => this._currentUser()?.id);

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    const identifier = String(request.email ?? request.username ?? request.korisnickoIme ?? '').trim();
    const password = String(request.lozinka ?? request.password ?? '');
    const isEmailLike = identifier.includes('@');

    const payloads: LoginRequest[] = isEmailLike
      ? [
          { email: identifier, lozinka: password },
          { email: identifier, lozinka: password, rola: 'VEZBAC' as any },
          { username: identifier, lozinka: password },
          { username: identifier, lozinka: password, rola: 'VEZBAC' as any },
          { email: identifier, password },
          { korisnickoIme: identifier, lozinka: password },
          { korisnickoIme: identifier, lozinka: password, rola: 'VEZBAC' as any }
        ]
      : [
          { username: identifier, lozinka: password },
          { username: identifier, lozinka: password, rola: 'VEZBAC' as any },
          { korisnickoIme: identifier, lozinka: password },
          { korisnickoIme: identifier, lozinka: password, rola: 'VEZBAC' as any },
          { email: identifier, lozinka: password },
          { username: identifier, password }
        ];

    return this.tryLoginPayload(payloads, 0).pipe(
      tap(response => this.saveUser(response))
    );
  }

  private tryLoginPayload(payloads: LoginRequest[], index: number): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payloads[index]).pipe(
      catchError((err) => {
        const hasNext = index < payloads.length - 1;
        if (err?.status === 400 && hasNext) {
          return this.tryLoginPayload(payloads, index + 1);
        }

        return throwError(() => err);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    const payload: RegisterRequest = {
      ...request,
      rola: 'VEZBAC'
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  createUser(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.userRole();
    return role ? roles.includes(role) : false;
  }

  uploadAvatar(file: File): Observable<{ id: number; rola: string; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ id: number; rola: string; avatarUrl: string }>('/api/profil/avatar', formData).pipe(
      tap((response) => this.updateAvatarUrl(response.avatarUrl))
    );
  }

  updateAvatarUrl(avatarUrl: string | null): void {
    const current = this._currentUser();
    if (!current) {
      return;
    }

    const updated: AuthResponse = { ...current, avatarUrl };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this._currentUser.set(updated);
  }

  private saveUser(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    this._currentUser.set(response);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
