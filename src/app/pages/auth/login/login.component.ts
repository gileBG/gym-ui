import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Card, InputText, Password, Button, Message, FloatLabel, TranslateModule],
  template: `
    <div class="auth-page flex align-items-center justify-content-center">
      <div class="auth-bg-overlay"></div>
      <div class="auth-card-wrapper">
        <p-card styleClass="auth-card">
          <ng-template pTemplate="header">
            <div class="auth-header text-center py-4">
              <i class="pi pi-bolt" style="font-size: 3rem; color: var(--gym-gold)"></i>
              <h1 class="auth-title mt-2">POWERGYM</h1>
              <p class="auth-subtitle">{{ 'LOGIN.SUBTITLE' | translate }}</p>
            </div>
          </ng-template>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-column gap-4 px-2">
            <p-floatLabel>
              <input pInputText id="email" formControlName="email" type="email" class="w-full" autocomplete="email" />
              <label for="email">{{ 'COMMON.EMAIL' | translate }}</label>
            </p-floatLabel>
            <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              <p-message severity="error" [text]="'LOGIN.EMAIL_REQUIRED' | translate" />
            </div>

            <p-floatLabel>
              <p-password id="lozinka" formControlName="lozinka" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" />
              <label for="lozinka">{{ 'COMMON.PASSWORD' | translate }}</label>
            </p-floatLabel>
            <div *ngIf="form.get('lozinka')?.invalid && form.get('lozinka')?.touched">
              <p-message severity="error" [text]="'LOGIN.PASSWORD_REQUIRED' | translate" />
            </div>

            <div *ngIf="errorMsg">
              <p-message severity="error" [text]="errorMsg" />
            </div>

            <p-button
              type="submit"
              [label]="'AUTH.LOGIN' | translate"
              icon="pi pi-sign-in"
              styleClass="w-full btn-gym-primary"
              [loading]="loading"
              [disabled]="form.invalid"
            />

            <div class="text-center mt-2">
              <span class="text-muted">{{ 'LOGIN.NO_ACCOUNT' | translate }} </span>
              <a routerLink="/register" class="font-bold">{{ 'AUTH.REGISTER' | translate }}</a>
            </div>
          </form>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-card-wrapper {
      width: 100%;
      max-width: 420px;
      padding: 1rem;
      position: relative;
      z-index: 1;
    }
    .auth-title {
      font-family: 'Bebas Neue', cursive;
      font-size: 2rem;
      color: #fff;
      letter-spacing: 4px;
      margin: 0;
    }
    .auth-subtitle { color: var(--gym-text-muted); font-size: 0.9rem; }
    .text-muted { color: var(--gym-text-muted); font-size: 0.9rem; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    lozinka: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('LOGIN.WELCOME', { name: res.ime })
        });
        const role = res.rola;
        if (role === 'ADMIN' || role === 'ZAPOSLENI') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/profil']);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = this.translate.instant('LOGIN.INVALID_CREDENTIALS');
      }
    });
  }
}
