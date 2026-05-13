import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { KorisniciService } from '../../core/services/korisnici.service';
import { Korisnik } from '../../core/models/korisnik.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-zaposleni',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TableModule, InputText, Card, Button, Select, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">

        <div class="mb-5">
          <h1 class="page-title">{{ 'EMPLOYEES.TITLE' | translate }}</h1>
          <p class="page-sub">{{ 'EMPLOYEES.SUBTITLE' | translate }}</p>
        </div>

        <div class="grid">
          <div class="col-12 lg:col-8">
            <p-card styleClass="zaposleni-card">
              <ng-template pTemplate="header">
                <div class="card-head px-4 pt-4 pb-2">
                  <h2 class="card-title">{{ 'EMPLOYEES.TABLE_TITLE' | translate }}</h2>
                  <p class="card-sub">{{ 'EMPLOYEES.TABLE_SUBTITLE' | translate }}</p>
                </div>
              </ng-template>

              <p-table
                [value]="zaposleni"
                [loading]="loading"
                [paginator]="true"
                [rows]="5"
                [rowsPerPageOptions]="[5, 10, 15]"
                [showCurrentPageReport]="true"
                [currentPageReportTemplate]="'EMPLOYEES.PAGE_REPORT' | translate"
                styleClass="p-datatable-striped gym-zaposleni-table"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'EMPLOYEES.NAME' | translate }}</th>
                    <th>{{ 'EMPLOYEES.SURNAME' | translate }}</th>
                    <th>{{ 'EMPLOYEES.EMAIL' | translate }}</th>
                    <th>{{ 'EMPLOYEES.POSITION' | translate }}</th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-z>
                  <tr>
                    <td>{{ z.ime }}</td>
                    <td>{{ z.prezime }}</td>
                    <td>{{ z.email }}</td>
                    <td>{{ getRoleLabelKey(z.rola) | translate }}</td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="text-center p-4">
                      <i class="pi pi-users text-4xl mb-3" style="color: var(--gym-text-muted); display: block;"></i>
                      <span style="color: var(--gym-text-muted)">{{ 'EMPLOYEES.EMPTY' | translate }}</span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>

          <div class="col-12 lg:col-4">
            <p-card styleClass="zaposleni-card">
              <ng-template pTemplate="header">
                <div class="card-head px-4 pt-4 pb-2">
                  <h2 class="card-title">{{ 'EMPLOYEES.ADD_TITLE' | translate }}</h2>
                  <p class="card-sub">{{ 'EMPLOYEES.ADD_SUBTITLE' | translate }}</p>
                </div>
              </ng-template>

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 pb-4 flex flex-column gap-3">
                <input pInputText type="text" formControlName="ime" [placeholder]="'COMMON.FIRST_NAME' | translate" />
                <input pInputText type="text" formControlName="prezime" [placeholder]="'COMMON.LAST_NAME' | translate" />
                <input pInputText type="email" formControlName="email" [placeholder]="'COMMON.EMAIL' | translate" />
                <input pInputText type="password" formControlName="lozinka" [placeholder]="'COMMON.PASSWORD' | translate" />
                <p-select
                  formControlName="rola"
                  [options]="roleOptions"
                  optionLabel="label"
                  optionValue="value"
                  [placeholder]="'EMPLOYEES.SELECT_POSITION' | translate"
                  styleClass="w-full"
                />

                <p-button
                  type="submit"
                  [label]="'EMPLOYEES.ADD_BUTTON' | translate"
                  icon="pi pi-user-plus"
                  [loading]="creating"
                  [disabled]="form.invalid || creating || rolesLoading || roleOptions.length === 0"
                />
              </form>
            </p-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .page-sub { color: var(--gym-text-muted); margin: 0; }
    .zaposleni-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-border) !important; }
    .zaposleni-card:hover { border-color: var(--gym-gold) !important; }
    .card-head { border-bottom: 1px solid var(--gym-border); }
    .card-title { font-size: 1.1rem; margin: 0; color: var(--gym-gold); letter-spacing: 1px; }
    .card-sub { margin: 0.2rem 0 0; color: var(--gym-text-muted); font-size: 0.9rem; }

    :host ::ng-deep .gym-zaposleni-table .p-datatable-header,
    :host ::ng-deep .gym-zaposleni-table .p-datatable-table-container,
    :host ::ng-deep .gym-zaposleni-table .p-datatable-thead > tr > th,
    :host ::ng-deep .gym-zaposleni-table .p-datatable-tbody > tr > td,
    :host ::ng-deep .gym-zaposleni-table .p-paginator {
      background: var(--gym-card-bg) !important;
      color: var(--gym-text-primary) !important;
      border-color: var(--gym-border) !important;
    }

    :host ::ng-deep .gym-zaposleni-table .p-datatable-thead > tr > th {
      color: var(--gym-gold) !important;
      border-bottom: 1px solid var(--gym-border) !important;
    }

    :host ::ng-deep .gym-zaposleni-table .p-datatable-tbody > tr:hover {
      background: #222 !important;
    }

    :host ::ng-deep .gym-zaposleni-table .p-paginator {
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--gym-border) !important;
      gap: 0.25rem;
    }

    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-page,
    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-next,
    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-prev,
    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-first,
    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-last {
      border: 1px solid var(--gym-border);
      min-width: 2rem;
      height: 2rem;
    }

    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-page.p-highlight {
      background: var(--gym-gold) !important;
      border-color: var(--gym-gold) !important;
      color: #000 !important;
      font-weight: 700;
    }

    :host ::ng-deep .gym-zaposleni-table .p-paginator .p-paginator-current {
      margin-left: auto;
      color: var(--gym-text-muted) !important;
      font-size: 0.9rem;
    }
  `]
})
export class ZaposleniComponent implements OnInit {
  private fb = inject(FormBuilder);
  private korisniciService = inject(KorisniciService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  zaposleni: Korisnik[] = [];
  loading = true;
  creating = false;
  rolesLoading = true;
  roleOptions: { label: string; value: string }[] = [];

  form = this.fb.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    lozinka: ['', [Validators.required, Validators.minLength(6)]],
    rola: [{ value: '', disabled: true }, Validators.required]
  });

  ngOnInit(): void {
    this.korisniciService.getRoles().subscribe({
      next: (roles) => {
        const normalized = roles.filter(r => r !== 'VEZBAC');
        this.roleOptions = normalized.map(role => ({
          label: this.translate.instant(this.getRoleLabelKey(role)),
          value: role
        }));

        if (normalized.length > 0) {
          this.form.controls.rola.enable({ emitEvent: false });
          if (!normalized.includes(this.form.controls.rola.value ?? '')) {
            this.form.patchValue({ rola: normalized[0] });
          }
        } else {
          this.form.controls.rola.disable({ emitEvent: false });
        }

        this.rolesLoading = false;
      },
      error: () => {
        this.roleOptions = [];
        this.form.controls.rola.disable({ emitEvent: false });
        this.rolesLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('EMPLOYEES.ROLES_LOAD_FAILED')
        });
      }
    });
    this.loadZaposleni();
  }

  loadZaposleni(): void {
    this.loading = true;
    this.korisniciService.getAllZaposleni().subscribe({
      next: (data) => {
        this.zaposleni = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const detail = err?.error?.message ?? this.translate.instant('EMPLOYEES.LOAD_FAILED');
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.creating || this.rolesLoading || this.roleOptions.length === 0) {
      return;
    }

    const request = this.form.getRawValue() as { ime: string; prezime: string; email: string; lozinka: string; rola: string };

    this.creating = true;
    this.korisniciService.createZaposleni(request).subscribe({
      next: () => {
        this.creating = false;
        this.form.reset({ rola: this.roleOptions[0]?.value ?? '' });
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('EMPLOYEES.CREATED')
        });
        this.loadZaposleni();
      },
      error: (err) => {
        this.creating = false;
        const detail = err?.error?.message ?? this.translate.instant('EMPLOYEES.CREATE_FAILED');
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail
        });
      }
    });
  }

  getRoleLabelKey(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'ROLES.ADMIN';
      case 'ZAPOSLENI':
        return 'ROLES.EMPLOYEE';
      case 'FRONT_DESK':
        return 'ROLES.FRONT_DESK';
      case 'CISTACICA':
        return 'ROLES.CLEANER';
      case 'MENADZER':
        return 'ROLES.MANAGER';
      case 'VEZBAC':
        return 'ROLES.TRAINEE';
      case 'TRENER':
        return 'ROLES.COACH';
      default:
        return role;
    }
  }
}
