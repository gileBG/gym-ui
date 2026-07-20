import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Obavestenje {
  id: number;
  naslov: string;
  sadrzaj: string;
  datumKreiranja: string;
  admin: { id: number; ime: string; prezime: string; email: string };
}

export interface ObavestenjeRequest {
  naslov: string;
  sadrzaj: string;
}

@Injectable({ providedIn: 'root' })
export class ObavestenjaService {
  private baseUrl = '/api/obavestenja';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Obavestenje[]> {
    return this.http.get<Obavestenje[]>(this.baseUrl);
  }

  create(request: ObavestenjeRequest): Observable<Obavestenje> {
    return this.http.post<Obavestenje>(this.baseUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
