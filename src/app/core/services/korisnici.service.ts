import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Korisnik } from '../models/korisnik.model';

export interface CreateKorisnikRequest {
  ime: string;
  prezime: string;
  email: string;
  lozinka: string;
  rola?: string;
}

@Injectable({ providedIn: 'root' })
export class KorisniciService {
  private vezbaciUrl = '/api/vezbaci';
  private zaposleniUrl = '/api/zaposleni';
  private rolesUrl = '/api/roles';

  constructor(private http: HttpClient) {}

  getAllVezbaci(): Observable<Korisnik[]> {
    return this.http.get<Korisnik[]>(this.vezbaciUrl);
  }

  getVezbacById(id: number): Observable<Korisnik> {
    return this.http.get<Korisnik>(`${this.vezbaciUrl}/${id}`);
  }

  deleteVezbac(id: number): Observable<void> {
    return this.http.delete<void>(`${this.vezbaciUrl}/${id}`);
  }

  getAllZaposleni(): Observable<Korisnik[]> {
    return this.http.get<Korisnik[]>(this.zaposleniUrl);
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(this.rolesUrl);
  }

  createVezbac(request: CreateKorisnikRequest): Observable<Korisnik> {
    return this.http.post<Korisnik>(this.vezbaciUrl, request);
  }

  createZaposleni(request: CreateKorisnikRequest): Observable<Korisnik> {
    return this.http.post<Korisnik>(this.zaposleniUrl, request);
  }
}
