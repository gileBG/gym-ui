export interface Korisnik {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  rola: string;
  avatarUrl?: string | null;
  approved?: boolean;
  rejected?: boolean;
  datumRegistracije?: string;
}
