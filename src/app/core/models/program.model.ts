export interface ProgramTrainer {
  id: number;
  ime?: string;
  prezime?: string;
  email?: string;
  rola?: string;
}

export interface Program {
  id: number;
  naziv: string;
  opis: string;
  cena: number;
  trajanjeMeseci: number;
  trener?: ProgramTrainer;
}
