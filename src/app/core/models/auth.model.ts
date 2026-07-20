export interface LoginRequest {
  email?: string;
  username?: string;
  korisnickoIme?: string;
  lozinka?: string;
  password?: string;
  rola?: string;
}

export interface RegisterRequest {
  ime: string;
  prezime: string;
  email: string;
  lozinka: string;
  rola?: string;
  honeypot?: string;
  recaptchaToken?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  ime: string;
  prezime: string;
  rola: string;
  avatarUrl?: string | null;
}

export type UserRole = 'ADMIN' | 'ZAPOSLENI' | 'VEZBAC' | 'TRENER';
