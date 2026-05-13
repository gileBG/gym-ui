export interface Clanarina {
  id: number;
  korisnik: { id: number; ime: string; prezime: string; email: string; };
  program: { id: number; naziv: string; cena: number; trajanjeMeseci: number; };
  datumUplate: string;
  datumIsteka: string;
  iznos: number;
  status: 'AKTIVNA' | 'ISTEKLA' | 'OTKAZANA';
}

export interface ClanarinaRequest {
  korisnikId: number;
  programId: number;
  datumUplate: string;
  datumIsteka: string;
  iznos: number;
}
