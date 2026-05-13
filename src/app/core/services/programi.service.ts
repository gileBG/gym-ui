import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Program } from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class ProgramiService {
  private baseUrl = '/api/programi';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Program[]> {
    return this.http.get<Program[]>(this.baseUrl);
  }

  getById(id: number): Observable<Program> {
    return this.http.get<Program>(`${this.baseUrl}/${id}`);
  }

  create(program: Omit<Program, 'id'>): Observable<Program> {
    return this.http.post<Program>(this.baseUrl, program);
  }

  update(id: number, program: Partial<Program>): Observable<Program> {
    return this.http.put<Program>(`${this.baseUrl}/${id}`, program);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
