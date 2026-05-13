import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Clanarina, ClanarinaRequest } from '../models/clanarina.model';
import { Program } from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class ClanarineService {
  private baseUrl = '/api/clanarine';
  private cenovnikUrl = '/api/clanarine-cenovnik';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Clanarina[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((res) => this.extractItems(res) as Clanarina[])
    );
  }

  getByKorisnik(korisnikId: number): Observable<Clanarina[]> {
    return this.http.get<Clanarina[]>(`${this.baseUrl}/zaposleni/${korisnikId}`);
  }

  create(clanarina: ClanarinaRequest): Observable<Clanarina> {
    return this.http.post<Clanarina>(this.baseUrl, clanarina);
  }

  getCenovnikPrograms(): Observable<Program[]> {
    return this.http.get<any>(this.cenovnikUrl).pipe(
      map((res) => this.extractItems(res)
        .map((item: any) => this.mapCenovnikItemToProgram(item))
        .filter((p: Program) => !!p.id && !!p.naziv)
      )
    );
  }

  getCenovnikClanarine(): Observable<Clanarina[]> {
    return this.http.get<any>(this.cenovnikUrl).pipe(
      map((res) => this.extractItems(res)
        .map((item: any) => this.mapCenovnikItemToClanarina(item))
        .filter((c: Clanarina) => !!c.id && !!c.program?.id)
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
    const programNode = item?.program ?? {};
    return {
      id: Number(item?.programId ?? item?.idPrograma ?? programNode?.id ?? item?.id),
      naziv: String(item?.programNaziv ?? programNode?.naziv ?? item?.naziv ?? ''),
      opis: String(item?.programOpis ?? programNode?.opis ?? item?.opis ?? ''),
      cena: Number(item?.programCena ?? item?.cenaPrograma ?? programNode?.cena ?? item?.cena ?? 0),
      trajanjeMeseci: Number(item?.programTrajanjeMeseci ?? programNode?.trajanjeMeseci ?? item?.trajanjeMeseci ?? 1),
      trener: programNode?.trener ?? item?.trener
    };
  }

  private mapCenovnikItemToClanarina(item: any): Clanarina {
    const program = this.mapCenovnikItemToProgram(item);
    const paymentDate = this.normalizeDate(item?.datumUplate);
    const expiryDate = this.normalizeDate(item?.datumIsteka);

    return {
      id: Number(item?.id ?? program.id ?? 0),
      korisnik: {
        id: Number(item?.korisnikId ?? item?.korisnik?.id ?? 0),
        ime: String(item?.korisnikIme ?? item?.korisnik?.ime ?? '-'),
        prezime: String(item?.korisnikPrezime ?? item?.korisnik?.prezime ?? '-'),
        email: String(item?.korisnikEmail ?? item?.korisnik?.email ?? '')
      },
      program: {
        id: program.id,
        naziv: program.naziv,
        cena: program.cena,
        trajanjeMeseci: program.trajanjeMeseci
      },
      datumUplate: paymentDate ?? '',
      datumIsteka: expiryDate ?? '',
      iznos: Number(item?.iznos ?? program.cena ?? 0),
      status: item?.status === 'ISTEKLA' || item?.status === 'OTKAZANA' ? item.status : 'AKTIVNA'
    };
  }

  private normalizeDate(value: unknown): string | null {
    if (!value) return null;
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

}
