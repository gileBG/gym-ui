import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Card } from 'primeng/card';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { Korisnik } from '../../../core/models/korisnik.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-korisnici-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, Button, Tag, InputText, IconField, InputIcon, Card, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">

        <div class="flex align-items-center justify-content-between mb-4">
          <div>
            <h1 class="page-title">{{ 'USERS.TITLE' | translate }}</h1>
            <p class="page-sub">{{ 'USERS.SUBTITLE' | translate }}</p>
          </div>
        </div>

        <p-card styleClass="korisnici-card mb-4">
          <ng-template pTemplate="header">
            <div class="card-head px-4 pt-4 pb-2">
              <h2 class="card-title">{{ 'USERS.ADD_TITLE' | translate }}</h2>
              <p class="card-sub">{{ 'USERS.ADD_SUBTITLE' | translate }}</p>
            </div>
          </ng-template>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-4 pb-4">
            <div class="grid">
              <div class="col-12 md:col-6">
                <input pInputText type="text" formControlName="ime" [placeholder]="'COMMON.FIRST_NAME' | translate" class="w-full" />
              </div>
              <div class="col-12 md:col-6">
                <input pInputText type="text" formControlName="prezime" [placeholder]="'COMMON.LAST_NAME' | translate" class="w-full" />
              </div>
              <div class="col-12 md:col-4">
                <input pInputText type="email" formControlName="email" [placeholder]="'COMMON.EMAIL' | translate" class="w-full" />
              </div>
              <div class="col-12 md:col-4">
                <input pInputText type="password" formControlName="lozinka" [placeholder]="'COMMON.PASSWORD' | translate" class="w-full" />
              </div>
              <div class="col-12 md:col-4 flex align-items-end">
                <p-button
                  type="submit"
                  [label]="'USERS.ADD_BUTTON' | translate"
                  icon="pi pi-user-plus"
                  [loading]="creating"
                  [disabled]="form.invalid || creating"
                  styleClass="w-full"
                />
              </div>
            </div>
          </form>
        </p-card>

        <p-table
          [value]="korisnici"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [globalFilterFields]="['ime', 'prezime', 'email', 'username']"
          #dt
          styleClass="p-datatable-striped gym-korisnici-table"
          [rowsPerPageOptions]="[5, 10, 25]"
        >
          <ng-template pTemplate="caption">
            <div class="flex justify-content-end">
              <p-iconfield>
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" [placeholder]="'USERS.SEARCH' | translate" (input)="dt.filterGlobal($any($event.target).value, 'contains')" />
              </p-iconfield>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="id">ID <p-sortIcon field="id" /></th>
              <th pSortableColumn="ime">{{ 'COMMON.FIRST_NAME' | translate }} <p-sortIcon field="ime" /></th>
              <th pSortableColumn="prezime">{{ 'COMMON.LAST_NAME' | translate }} <p-sortIcon field="prezime" /></th>
              <th pSortableColumn="username">{{ 'USERS.USERNAME_COL' | translate }} <p-sortIcon field="username" /></th>
              <th pSortableColumn="email">{{ 'COMMON.EMAIL' | translate }} <p-sortIcon field="email" /></th>
              <th>{{ 'USERS.ROLE' | translate }}</th>
              <th>{{ 'USERS.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-k>
            <tr>
              <td>{{ k.id }}</td>
              <td>{{ k.ime }}</td>
              <td>{{ k.prezime }}</td>
              <td>{{ k.username }}</td>
              <td>{{ k.email }}</td>
              <td>
                <p-tag [value]="k.rola" [severity]="getRoleSeverity(k.rola)" />
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    size="small"
                    [outlined]="true"
                    (onClick)="viewKorisnik(k.id)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    [outlined]="true"
                    (onClick)="confirmDelete(k)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center p-4">
                <i class="pi pi-users text-4xl mb-3" style="color: var(--gym-text-muted); display: block;"></i>
                <span style="color: var(--gym-text-muted)">{{ 'USERS.EMPTY' | translate }}</span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .page-sub { color: var(--gym-text-muted); margin: 0; }
    .korisnici-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-border) !important; }
    .korisnici-card:hover { border-color: var(--gym-gold) !important; }
    .card-head { border-bottom: 1px solid var(--gym-border); }
    .card-title { font-size: 1.1rem; margin: 0; color: var(--gym-gold); letter-spacing: 1px; }
    .card-sub { margin: 0.2rem 0 0; color: var(--gym-text-muted); font-size: 0.9rem; }

    :host ::ng-deep .gym-korisnici-table .p-datatable-header,
    :host ::ng-deep .gym-korisnici-table .p-datatable-table-container,
    :host ::ng-deep .gym-korisnici-table .p-datatable-thead > tr > th,
    :host ::ng-deep .gym-korisnici-table .p-datatable-tbody > tr > td,
    :host ::ng-deep .gym-korisnici-table .p-paginator {
      background: var(--gym-card-bg) !important;
      color: var(--gym-text-primary) !important;
      border-color: var(--gym-border) !important;
    }

    :host ::ng-deep .gym-korisnici-table .p-datatable-thead > tr > th {
      color: var(--gym-gold) !important;
      border-bottom: 1px solid var(--gym-border) !important;
    }

    :host ::ng-deep .gym-korisnici-table .p-datatable-tbody > tr:hover {
      background: #222 !important;
    }

    :host ::ng-deep .gym-korisnici-table .p-paginator .p-paginator-page,
    :host ::ng-deep .gym-korisnici-table .p-paginator .p-paginator-next,
    :host ::ng-deep .gym-korisnici-table .p-paginator .p-paginator-prev,
    :host ::ng-deep .gym-korisnici-table .p-paginator .p-paginator-first,
    :host ::ng-deep .gym-korisnici-table .p-paginator .p-paginator-last,
    :host ::ng-deep .gym-korisnici-table .p-paginator .p-paginator-rpp-dropdown {
      color: var(--gym-text-primary) !important;
    }
  `]
})
export class KorisniciListaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private korisniciService = inject(KorisniciService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  korisnici: Korisnik[] = [];
  loading = true;
  creating = false;

  form = this.fb.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    lozinka: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.loadKorisnici();
  }

  loadKorisnici(): void {
    this.loading = true;
    this.korisniciService.getAllVezbaci().subscribe({
      next: (data) => {
        this.korisnici = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.creating) {
      return;
    }

    const request = this.form.getRawValue() as { ime: string; prezime: string; email: string; lozinka: string };

    this.creating = true;
    this.korisniciService.createVezbac(request).subscribe({
      next: () => {
        this.creating = false;
        this.form.reset();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('USERS.CREATED')
        });
        this.loadKorisnici();
      },
      error: (err) => {
        this.creating = false;
        const detail = err?.error?.message ?? this.translate.instant('USERS.CREATE_FAILED');
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail
        });
      }
    });
  }

  viewKorisnik(id: number): void {
    this.router.navigate(['/korisnici', id]);
  }

  confirmDelete(k: Korisnik): void {
    this.confirmationService.confirm({
      message: this.translate.instant('USERS.DELETE_Q', { name: `${k.ime} ${k.prezime}` }),
      header: this.translate.instant('USERS.DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('COMMON.DELETE'),
      rejectLabel: this.translate.instant('COMMON.CANCEL'),
      accept: () => this.deleteKorisnik(k.id)
    });
  }

  deleteKorisnik(id: number): void {
    this.korisniciService.deleteVezbac(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('USERS.DELETED') });
        this.loadKorisnici();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('USERS.DELETE_FAILED') });
      }
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'ZAPOSLENI': return 'warn';
      case 'VEZBAC': return 'success';
      default: return 'secondary';
    }
  }
}
