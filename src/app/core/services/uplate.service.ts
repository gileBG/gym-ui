import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Uplata, UplataRequest } from '../models/uplata.model';

@Injectable({ providedIn: 'root' })
export class UplateService {
  private baseUrl = '/api/uplate';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Uplata[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.content)) return res.content;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      })
    );
  }

  getById(id: number): Observable<Uplata> {
    return this.http.get<Uplata>(`${this.baseUrl}/${id}`);
  }

  getByKorisnik(korisnikId: number): Observable<Uplata[]> {
    return this.http.get<Uplata[]>(`${this.baseUrl}/korisnik/${korisnikId}`);
  }

  getByClanarina(clanarinaId: number): Observable<Uplata[]> {
    return this.http.get<Uplata[]>(`${this.baseUrl}/clanarina/${clanarinaId}`);
  }

  create(uplata: UplataRequest): Observable<Uplata> {
    return this.http.post<Uplata>(this.baseUrl, uplata);
  }

  update(id: number, uplata: Partial<UplataRequest>): Observable<Uplata> {
    return this.http.put<Uplata>(`${this.baseUrl}/${id}`, uplata);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
