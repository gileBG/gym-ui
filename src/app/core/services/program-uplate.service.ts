import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProgramUplata, ProgramUplataRequest } from '../models/program-uplata.model';

@Injectable({ providedIn: 'root' })
export class ProgramUplateService {
  private baseUrl = '/api/uplate-programi';

  constructor(private http: HttpClient) {}

  getByKorisnik(korisnikId: number): Observable<ProgramUplata[]> {
    return this.http.get<any>(`${this.baseUrl}/korisnik/${korisnikId}`).pipe(
      map((res) => this.extractItems(res).map((item: any) => this.mapItem(item)))
    );
  }

  create(request: ProgramUplataRequest): Observable<ProgramUplata> {
    return this.http.post<any>(this.baseUrl, request).pipe(
      map((item) => this.mapItem(item))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { status });
  }

  private extractItems(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  private mapItem(item: any): ProgramUplata {
    const korisnikNode = item?.vezbac ?? item?.korisnik ?? {};
    const programNode = item?.program ?? {};

    return {
      id: Number(item?.id ?? 0),
      korisnik: {
        id: Number(korisnikNode?.id ?? 0),
        ime: String(korisnikNode?.ime ?? '-'),
        prezime: String(korisnikNode?.prezime ?? '-'),
        email: String(korisnikNode?.email ?? '')
      },
      program: {
        id: Number(programNode?.id ?? item?.programId ?? 0),
        naziv: String(programNode?.naziv ?? ''),
        cena: Number(programNode?.cena ?? item?.iznos ?? 0),
        trajanjeMeseci: Number(programNode?.trajanjeMeseci ?? 1)
      },
      datumUplate: this.normalizeDate(item?.datumUplate) ?? '',
      datumIsteka: this.normalizeDate(item?.datumIsteka) ?? '',
      iznos: Number(item?.iznos ?? programNode?.cena ?? 0),
      status: item?.status === 'ISTEKLA' || item?.status === 'OTKAZANA' ? item.status : 'AKTIVNA'
    };
  }

  private normalizeDate(value: unknown): string | null {
    if (!value) return null;

    // Java LocalDate array format: [year, month, day]
    if (Array.isArray(value) && value.length >= 3) {
      const y = Number(value[0]);
      const m = Number(value[1]);
      const d = Number(value[2]);
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
      return null;
    }

    const str = String(value).trim();
    if (!str) return null;

    // Extract YYYY-MM-DD directly to avoid timezone shift
    const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    }

    // Fallback: parse with Date
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return null;

    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  }
}