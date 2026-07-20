import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Clanarina, ClanarinaCenovnikItem, ClanarinaRequest } from '../models/clanarina.model';
import { Program } from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class ClanarineService {
  private baseUrl = '/api/clanarine';
  private cenovnikUrl = '/api/clanarine-cenovnik';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Clanarina[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((res) => this.extractItems(res).map((item: any) => this.mapPaymentItem(item)))
    );
  }

  getByKorisnik(korisnikId: number): Observable<Clanarina[]> {
    return this.http.get<any>(`${this.baseUrl}/vezbac/${korisnikId}`).pipe(
      map((res) => this.extractItems(res).map((item: any) => this.mapPaymentItem(item)))
    );
  }

  create(clanarina: ClanarinaRequest): Observable<Clanarina> {
    return this.http.post<any>(this.baseUrl, clanarina).pipe(
      map((item) => this.mapPaymentItem(item))
    );
  }

  updateClanarina(id: number, clanarina: ClanarinaRequest): Observable<Clanarina> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, clanarina).pipe(
      map((item) => this.mapPaymentItem(item))
    );
  }

  deleteClanarina(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<Clanarina> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/status`, { status }).pipe(
      map((item) => this.mapPaymentItem(item))
    );
  }

  createCenovnik(clanarina: { naziv: string; cena: number; tipClanarine?: string | null }): Observable<any> {
    const payload = {
      naziv: clanarina.naziv,
      cena: clanarina.cena,
      tipClanarine: clanarina.tipClanarine?.trim() || 'STANDARD'
    };

    return this.http.post<any>(this.cenovnikUrl, payload);
  }

  updateCenovnik(id: number, clanarina: { naziv: string; cena: number; tipClanarine?: string | null }): Observable<any> {
    const payload = {
      naziv: clanarina.naziv,
      cena: clanarina.cena,
      tipClanarine: clanarina.tipClanarine?.trim() || 'STANDARD'
    };

    return this.http.put<any>(`${this.cenovnikUrl}/${id}`, payload);
  }

  deleteCenovnik(id: number): Observable<void> {
    return this.http.delete<void>(`${this.cenovnikUrl}/${id}`);
  }

  getCenovnikPrograms(): Observable<Program[]> {
    return this.http.get<any>(this.cenovnikUrl).pipe(
      map((res) => this.extractItems(res)
        .map((item: any) => this.mapCenovnikItemToProgram(item))
        .filter((p: Program) => !!p.id && !!p.naziv)
      )
    );
  }

  getCenovnikClanarine(): Observable<ClanarinaCenovnikItem[]> {
    return this.http.get<any>(this.cenovnikUrl).pipe(
      map((res) => this.extractItems(res)
        .map((item: any) => this.mapCenovnikItem(item))
        .filter((c: ClanarinaCenovnikItem) => !!c.id && !!c.naziv)
      )
    );
  }

  private extractItems(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  private mapCenovnikItemToProgram(item: any): Program {
    const naziv = String(item?.naziv ?? '');
    return {
      id: Number(item?.id ?? 0),
      naziv,
      opis: String(item?.opis ?? ''),
      cena: Number(item?.cena ?? 0),
      trajanjeMeseci: this.estimateDurationMonths(naziv),
      trener: item?.trener
    };
  }

  private mapCenovnikItem(item: any): ClanarinaCenovnikItem {
    const naziv = String(item?.naziv ?? '');
    return {
      id: Number(item?.id ?? 0),
      naziv,
      cena: Number(item?.cena ?? 0),
      tipClanarine: String(item?.tipClanarine ?? 'STANDARD'),
      trajanjeDana: this.estimateDurationDays(naziv)
    };
  }

  private mapPaymentItem(item: any): Clanarina {
    const korisnikNode = item?.vezbac ?? item?.korisnik ?? {};
    const clanarinaNode = item?.clanarina ?? {};

    return {
      id: Number(item?.id ?? 0),
      korisnik: {
        id: Number(korisnikNode?.id ?? 0),
        ime: String(korisnikNode?.ime ?? '-'),
        prezime: String(korisnikNode?.prezime ?? '-'),
        email: String(korisnikNode?.email ?? '')
      },
      clanarina: {
        id: Number(clanarinaNode?.id ?? item?.clanarinaId ?? 0),
        naziv: String(clanarinaNode?.naziv ?? item?.naziv ?? ''),
        cena: Number(clanarinaNode?.cena ?? item?.iznos ?? 0),
        tipClanarine: String(clanarinaNode?.tipClanarine ?? item?.tipClanarine ?? 'STANDARD')
      },
      datumUplate: this.normalizeDate(item?.datumUplate) ?? '',
      datumIsteka: this.normalizeDate(item?.datumIsteka) ?? '',
      iznos: Number(item?.iznos ?? clanarinaNode?.cena ?? 0),
      status: item?.status === 'ISTEKLA' || item?.status === 'OTKAZANA' ? item.status : 'AKTIVNA'
    };
  }

  private estimateDurationDays(naziv: string): number {
    const normalized = naziv.toLowerCase();

    if (normalized.includes('12 mes')) return 365;
    if (normalized.includes('6 mes')) return 183;
    if (normalized.includes('3 mes')) return 92;
    if (normalized.includes('mesec')) return 31;

    const danaMatch = normalized.match(/(\d+)\s*dana?/);
    if (danaMatch) {
      return Number(danaMatch[1]);
    }

    if (normalized.includes('dnevna')) return 1;
    return 31;
  }

  private estimateDurationMonths(naziv: string): number {
    const days = this.estimateDurationDays(naziv);
    return Math.max(1, Math.round(days / 30));
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
