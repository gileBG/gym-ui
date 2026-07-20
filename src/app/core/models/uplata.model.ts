export interface Uplata {
  id: number;
  clanarinaId: number;
  korisnikId: number;
  iznos: number;
  datumUplate: string;
  nacinPlacanja: string;
  status: string;
}

export interface UplataRequest {
  clanarinaId: number;
  korisnikId: number;
  iznos: number;
  datumUplate: string;
  nacinPlacanja: string;
}
