import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MesecnaZaradaStavka {
  tip: string;
  naziv: string;
  iznos: number;
  brojUplata: number;
}

export interface MesecnaZaradaResponse {
  godina: number;
  mesec: number;
  ukupnoClanarine: number;
  ukupnoProgrami: number;
  ukupnoSve: number;
  stavke: MesecnaZaradaStavka[];
}

@Injectable({ providedIn: 'root' })
export class IzvestajiService {
  private baseUrl = '/api/izvestaji';

  constructor(private http: HttpClient) {}

  getZaradaPoMesecu(godina: number, mesec: number): Observable<MesecnaZaradaResponse> {
    return this.http.get<MesecnaZaradaResponse>(`${this.baseUrl}/zarada-po-mesecu`, {
      params: { godina: String(godina), mesec: String(mesec) }
    });
  }
}
