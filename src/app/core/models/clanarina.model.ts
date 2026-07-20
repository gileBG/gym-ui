export interface Clanarina {
  id: number;
  korisnik: { id: number; ime: string; prezime: string; email: string; };
  clanarina: { id: number; naziv: string; cena: number; tipClanarine: string; };
  datumUplate: string;
  datumIsteka: string;
  iznos: number;
  status: 'AKTIVNA' | 'ISTEKLA' | 'OTKAZANA';
}

export interface ClanarinaCenovnikItem {
  id: number;
  naziv: string;
  cena: number;
  tipClanarine: string;
  trajanjeDana: number;
}

export interface ClanarinaRequest {
  korisnikId: number;
  clanarinaId: number;
  datumUplate: string;
  datumIsteka: string;
  iznos: number;
}
