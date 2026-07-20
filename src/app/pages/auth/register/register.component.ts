import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { RecaptchaService } from '../../../core/services/recaptcha.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('lozinka')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Card, InputText, Password, Button, Message, FloatLabel, TranslateModule],
  template: `
    <div class="auth-page flex align-items-center justify-content-center">
      <div class="auth-card-wrapper">
        <p-card styleClass="auth-card">
          <ng-template pTemplate="header">
            <div class="auth-header text-center py-4">
              <i class="pi pi-user-plus" style="font-size: 3rem; color: var(--gym-gold)"></i>
              <h1 class="auth-title mt-2">{{ 'AUTH.REGISTER' | translate }}</h1>
              <p class="auth-subtitle">{{ 'REGISTER.SUBTITLE' | translate }}</p>
            </div>
          </ng-template>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-column gap-3 px-2">
            <!-- Honeypot polje – skriveno od ljudi, vide ga samo botovi -->
            <input formControlName="honeypot" class="honeypot-field" tabindex="-1" autocomplete="off" />

            <div class="grid">
              <div class="col-6">
                <p-floatLabel>
                  <input pInputText id="ime" formControlName="ime" class="w-full" />
                  <label for="ime">{{ 'COMMON.FIRST_NAME' | translate }}</label>
                </p-floatLabel>
              </div>
              <div class="col-6">
                <p-floatLabel>
                  <input pInputText id="prezime" formControlName="prezime" class="w-full" />
                  <label for="prezime">{{ 'COMMON.LAST_NAME' | translate }}</label>
                </p-floatLabel>
              </div>
            </div>

            <p-floatLabel>
              <input pInputText id="email" formControlName="email" type="email" class="w-full" autocomplete="email" />
              <label for="email">{{ 'COMMON.EMAIL' | translate }}</label>
            </p-floatLabel>
            <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              <p-message severity="error" [text]="'REGISTER.EMAIL_INVALID' | translate" />
            </div>

            <p-floatLabel>
              <p-password id="lozinka" formControlName="lozinka" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" />
              <label for="lozinka">{{ 'COMMON.PASSWORD' | translate }}</label>
            </p-floatLabel>

            <p-floatLabel>
              <p-password id="confirmPassword" formControlName="confirmPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" />
              <label for="confirmPassword">{{ 'REGISTER.CONFIRM_PASSWORD' | translate }}</label>
            </p-floatLabel>

            <div *ngIf="form.errors?.['passwordMismatch'] && form.get('confirmPassword')?.touched">
              <p-message severity="error" [text]="'REGISTER.PASSWORD_MISMATCH' | translate" />
            </div>

            <div *ngIf="errorMsg">
              <p-message severity="error" [text]="errorMsg" />
            </div>

            <p-button
              type="submit"
              [label]="'AUTH.REGISTER' | translate"
              icon="pi pi-user-plus"
              styleClass="w-full btn-gym-primary"
              [loading]="loading"
              [disabled]="form.invalid"
            />

            <div class="text-center mt-2">
              <span class="text-muted">{{ 'REGISTER.HAVE_ACCOUNT' | translate }} </span>
              <a routerLink="/login" class="font-bold">{{ 'AUTH.LOGIN' | translate }}</a>
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
      padding: 2rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-card-wrapper { width: 100%; max-width: 480px; padding: 1rem; }
    .auth-title {
      font-family: 'Bebas Neue', cursive;
      font-size: 2rem;
      color: #fff;
      letter-spacing: 4px;
      margin: 0;
    }
    .auth-subtitle { color: var(--gym-text-muted); font-size: 0.9rem; }
    .text-muted { color: var(--gym-text-muted); font-size: 0.9rem; }
    .honeypot-field {
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      opacity: 0 !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private recaptcha = inject(RecaptchaService);

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    lozinka: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    honeypot: ['']
  }, { validators: passwordMatchValidator });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    const { confirmPassword, honeypot, ...request } = this.form.value as any;
    const recaptchaToken = await this.recaptcha.execute();

    const payload = {
      ...request,
      rola: request?.rola || 'VEZBAC',
      honeypot: honeypot || '',
      recaptchaToken: recaptchaToken
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('REGISTER.PENDING_APPROVAL')
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? this.translate.instant('REGISTER.FAILED');
      }
    });
  }
}
