import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Password } from 'primeng/password';
import { Message } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Card, Button, Password, Message, FloatLabel],
  template: `
    <div class="auth-page flex align-items-center justify-content-center">
      <div class="auth-card-wrapper">
        <p-card styleClass="auth-card">
          <ng-template pTemplate="header">
            <div class="auth-header text-center py-4">
              <i class="pi pi-bolt" style="font-size: 3rem; color: var(--gym-gold)"></i>
              <h1 class="auth-title mt-2">POWERGYM</h1>
              <p class="auth-subtitle">Nova lozinka</p>
            </div>
          </ng-template>

          <div *ngIf="!token" class="text-center py-3">
            <p-message severity="error" text="Neispravan link za resetovanje lozinke." />
            <div class="mt-3">
              <a routerLink="/login" class="font-bold" style="color: var(--gym-gold); text-decoration: none;">← Nazad na prijavu</a>
            </div>
          </div>

          <div *ngIf="token && !success" class="px-2">
            <div class="flex flex-column gap-4">
              <p class="info-text">Unesite novu lozinku za vaš nalog.</p>

              <p-floatLabel>
                <p-password
                  id="lozinka"
                  [(ngModel)]="lozinka"
                  [feedback]="true"
                  [toggleMask]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  placeholder=" "
                />
                <label for="lozinka">Nova lozinka</label>
              </p-floatLabel>

              <p-floatLabel>
                <p-password
                  id="potvrda"
                  [(ngModel)]="potvrda"
                  [feedback]="false"
                  [toggleMask]="true"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  placeholder=" "
                />
                <label for="potvrda">Potvrdi lozinku</label>
              </p-floatLabel>

              <div *ngIf="errorMsg">
                <p-message severity="error" [text]="errorMsg" />
              </div>

              <p-button
                label="Resetuj lozinku"
                icon="pi pi-check"
                styleClass="w-full btn-gym-primary"
                [loading]="loading"
                [disabled]="!lozinka || lozinka.length < 6 || lozinka !== potvrda || loading"
                (onClick)="onSubmit()"
              />
            </div>
          </div>

          <div *ngIf="success" class="text-center py-3">
            <i class="pi pi-check-circle text-5xl mb-3" style="color: #2ecc71"></i>
            <h3 style="color: #fff; margin: 0 0 0.5rem 0;">Lozinka resetovana!</h3>
            <p class="info-text">Vaša lozinka je uspešno promenjena. Možete se prijaviti sa novom lozinkom.</p>
            <a routerLink="/login">
              <p-button label="Prijavi se" icon="pi pi-sign-in" styleClass="btn-gym-primary mt-3" />
            </a>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-card-wrapper { width: 100%; max-width: 420px; padding: 1rem; }
    .auth-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: #fff; letter-spacing: 4px; margin: 0; }
    .auth-subtitle { color: var(--gym-text-muted); font-size: 0.9rem; }
    .info-text { color: var(--gym-text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private baseUrl = '/api/auth/reset-lozinke';

  token: string | null = null;
  lozinka = '';
  potvrda = '';
  loading = false;
  success = false;
  errorMsg = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit(): void {
    if (!this.token || this.lozinka.length < 6 || this.lozinka !== this.potvrda) return;

    this.loading = true;
    this.errorMsg = '';

    this.http.post<{ message: string }>(this.baseUrl, {
      token: this.token,
      lozinka: this.lozinka
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Došlo je do greške. Pokušajte ponovo.';
      }
    });
  }
}
