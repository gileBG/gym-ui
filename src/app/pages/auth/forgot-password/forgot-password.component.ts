import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Card, Button, InputText, Message, FloatLabel],
  template: `
    <div class="auth-page flex align-items-center justify-content-center">
      <div class="auth-card-wrapper">
        <p-card styleClass="auth-card">
          <ng-template pTemplate="header">
            <div class="auth-header text-center py-4">
              <i class="pi pi-bolt" style="font-size: 3rem; color: var(--gym-gold)"></i>
              <h1 class="auth-title mt-2">POWERGYM</h1>
              <p class="auth-subtitle">Zaboravljena lozinka</p>
            </div>
          </ng-template>

          <div class="px-2">
            <div *ngIf="!submitted" class="flex flex-column gap-4">
              <p class="info-text">Unesite email adresu koju ste koristili prilikom registracije. Poslaćemo vam link za resetovanje lozinke.</p>

              <p-floatLabel>
                <input pInputText id="email" type="email" [(ngModel)]="email" class="w-full" autocomplete="email" placeholder=" " />
                <label for="email">Email adresa</label>
              </p-floatLabel>

              <div *ngIf="errorMsg">
                <p-message severity="error" [text]="errorMsg" />
              </div>

              <p-button
                label="Pošalji link"
                icon="pi pi-send"
                styleClass="w-full btn-gym-primary"
                [loading]="loading"
                [disabled]="!email || loading"
                (onClick)="onSubmit()"
              />
            </div>

            <div *ngIf="submitted" class="text-center py-3">
              <i class="pi pi-check-circle text-5xl mb-3" style="color: #2ecc71"></i>
              <h3 style="color: #fff; margin: 0 0 0.5rem 0;">Link je poslat!</h3>
              <p class="info-text">Ako nalog sa tom email adresom postoji, link za resetovanje lozinke je poslat. Proverite vaše prijemno sanduče.</p>
              <p class="info-text" style="font-size: 0.8rem; margin-top: 0.5rem;">(U razvojnom režimu, link je ispisan u konzoli backend-a)</p>
            </div>

            <div class="text-center mt-3">
              <a routerLink="/login" class="font-bold" style="color: var(--gym-gold); text-decoration: none;">← Nazad na prijavu</a>
            </div>
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
export class ForgotPasswordComponent {
  private http = inject(HttpClient);
  private baseUrl = '/api/auth/zaboravljena-lozinka';

  email = '';
  loading = false;
  submitted = false;
  errorMsg = '';

  onSubmit(): void {
    if (!this.email?.trim()) return;

    this.loading = true;
    this.errorMsg = '';

    this.http.post<{ message: string }>(this.baseUrl, { email: this.email.trim() }).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Došlo je do greške. Pokušajte ponovo.';
      }
    });
  }
}
