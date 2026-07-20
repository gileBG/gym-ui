import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScanLog } from '../models/scan-log.model';

@Injectable({ providedIn: 'root' })
export class ScanService {
  private baseUrl = '/api/scanovi';

  constructor(private http: HttpClient) {}

  getEntryQrUrl(): string {
    return `${this.baseUrl}/qr/ulaz`;
  }

  getExitQrUrl(): string {
    return `${this.baseUrl}/qr/izlaz`;
  }

  getScansForVezbac(vezbacId: number): Observable<ScanLog[]> {
    return this.http.get<ScanLog[]>(`${this.baseUrl}/vezbac/${vezbacId}`);
  }

  getAllScans(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  /** Ručni check-in (admin skenira korisnika bez aplikacije) */
  manualCheckIn(vezbacId: number): Observable<ScanLog> {
    return this.http.post<ScanLog>(this.baseUrl, { vezbacId, tip: 'ULAZ' });
  }

  /** Ručni check-out (admin evidentira odlazak) */
  manualCheckOut(vezbacId: number): Observable<ScanLog> {
    return this.http.post<ScanLog>(this.baseUrl, { vezbacId, tip: 'IZLAZ' });
  }

  /** Proveri trenutni status (da li je korisnik prijavljen u teretani) */
  checkStatus(vezbacId: number): Observable<{ uTeretani: boolean }> {
    return this.http.get<{ uTeretani: boolean }>(`${this.baseUrl}/status/${vezbacId}`);
  }

  /** Dohvati ID-eve svih vežbača koji su trenutno u teretani */
  getActiveVezbacIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/aktivni`);
  }
}
