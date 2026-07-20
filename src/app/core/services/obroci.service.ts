import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StavkaObroka {
  id?: number;
  naziv: string;
  kcal: number;
  kolicina?: string;
}

export interface Obrok {
  id?: number;
  korisnikId?: number;
  korisnikTip?: string;
  datum: string;
  vreme: string;
  tip: string;
  stavke: StavkaObroka[];
  createdAt?: string;
}

export interface SaveObrokRequest {
  datum: string;
  vreme: string;
  tip: string;
  stavke: { naziv: string; kcal: number; kolicina?: string }[];
}

@Injectable({ providedIn: 'root' })
export class ObrociService {
  private http = inject(HttpClient);
  private baseUrl = '/api/obroci';

  getAll(datum?: string): Observable<Obrok[]> {
    const params = datum ? `?datum=${datum}` : '';
    return this.http.get<Obrok[]>(`${this.baseUrl}${params}`);
  }

  getByPeriod(od: string, doo: string): Observable<Obrok[]> {
    return this.http.get<Obrok[]>(`${this.baseUrl}/period?od=${od}&doo=${doo}`);
  }

  create(request: SaveObrokRequest): Observable<Obrok> {
    return this.http.post<Obrok>(this.baseUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
