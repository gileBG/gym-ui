export interface LoginRequest {
  email: string;
  lozinka: string;
}

export interface RegisterRequest {
  ime: string;
  prezime: string;
  email: string;
  lozinka: string;
  rola?: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  ime: string;
  prezime: string;
  rola: string;
}

export type UserRole = 'ADMIN' | 'ZAPOSLENI' | 'VEZBAC' | 'TRENER';
