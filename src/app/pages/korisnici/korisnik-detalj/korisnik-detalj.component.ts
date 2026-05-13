import { Component, inject, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { ClanarineService } from '../../../core/services/clanarine.service';
import { Korisnik } from '../../../core/models/korisnik.model';
import { Clanarina } from '../../../core/models/clanarina.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-korisnik-detalj',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag, TableModule, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex align-items-center gap-3 mb-4">
          <p-button icon="pi pi-arrow-left" [outlined]="true" size="small" (onClick)="goBack()" />
          <h1 class="page-title">{{ 'USERS.DETAIL_TITLE' | translate }}</h1>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <i class="pi pi-spin pi-spinner text-4xl" style="color: var(--gym-gold)"></i>
        </div>

        <div *ngIf="!loading && korisnik" class="grid">
          <!-- Info -->
          <div class="col-12 md:col-5">
            <p-card styleClass="korisnik-card">
              <div class="text-center mb-4">
                <div class="avatar-circle mx-auto mb-3">
                  <i class="pi pi-user text-4xl" style="color: #000"></i>
                </div>
                <h2 class="korisnik-name">{{ korisnik.ime }} {{ korisnik.prezime }}</h2>
                <p-tag [value]="korisnik.rola" [severity]="getRoleSeverity(korisnik.rola)" class="mt-2" />
              </div>
              <div class="korisnik-info">
                <div class="info-row">
                  <i class="pi pi-user mr-2" style="color: var(--gym-gold)"></i>
                  <span class="info-label">{{ 'USERS.USERNAME' | translate }}</span>
                  <span class="info-value">{{ korisnik.email }}</span>
                </div>
                <div class="info-row">
                  <i class="pi pi-envelope mr-2" style="color: var(--gym-gold)"></i>
                  <span class="info-label">{{ 'USERS.EMAIL' | translate }}</span>
                  <span class="info-value">{{ korisnik.email }}</span>
                </div>
                <div class="info-row">
                  <i class="pi pi-id-card mr-2" style="color: var(--gym-gold)"></i>
                  <span class="info-label">{{ 'USERS.ID' | translate }}</span>
                  <span class="info-value">{{ korisnik.id }}</span>
                </div>
              </div>
            </p-card>
          </div>

          <!-- Članarine -->
          <div class="col-12 md:col-7">
            <p-card [header]="'USERS.MEMBERSHIP_HISTORY' | translate" styleClass="h-full">
              <p-table [value]="clanarine" [rows]="5" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'USERS.TYPE' | translate }}</th>
                    <th>{{ 'USERS.FROM' | translate }}</th>
                    <th>{{ 'USERS.TO' | translate }}</th>
                    <th>{{ 'COMMON.STATUS' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-c>
                  <tr>
                    <td>{{ c.tip }}</td>
                    <td>{{ c.datumPocetka | date: 'dd.MM.yyyy' }}</td>
                    <td>{{ c.datumIsteka | date: 'dd.MM.yyyy' }}</td>
                    <td>
                      <p-tag
                        [value]="getStatus(c)"
                        [severity]="getStatus(c) === 'AKTIVNA' ? 'success' : 'danger'"
                      />
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr><td colspan="4" class="text-center" style="color: var(--gym-text-muted)">{{ 'USERS.NO_MEMBERSHIPS' | translate }}</td></tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>
        </div>

        <div *ngIf="!loading && !korisnik" class="text-center py-5">
          <p style="color: var(--gym-text-muted)">{{ 'USERS.NOT_FOUND' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-4xl { max-width: 900px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .korisnik-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-gold) !important; }
    .avatar-circle {
      width: 80px; height: 80px;
      background: var(--gym-gold);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .korisnik-name { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; color: #fff; letter-spacing: 2px; }
    .info-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; border-bottom: 1px solid var(--gym-border); }
    .info-label { color: var(--gym-text-muted); font-size: 0.85rem; min-width: 70px; }
    .info-value { color: var(--gym-text-primary); font-weight: 600; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class KorisnikDetaljComponent implements OnInit {
  id = input.required<string>();

  private korisniciService = inject(KorisniciService);
  private clanarineService = inject(ClanarineService);
  private router = inject(Router);

  korisnik: Korisnik | null = null;
  clanarine: Clanarina[] = [];
  loading = true;

  ngOnInit(): void {
    const numId = Number(this.id());
    if (isNaN(numId)) { this.loading = false; return; }

    this.korisniciService.getVezbacById(numId).subscribe({
      next: (k) => {
        this.korisnik = k;
        this.clanarineService.getByKorisnik(numId).subscribe({
          next: (c) => { this.clanarine = c; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  goBack(): void { this.router.navigate(['/korisnici']); }

  getStatus(c: Clanarina): string {
    return new Date(c.datumIsteka) >= new Date() ? 'AKTIVNA' : 'ISTEKLA';
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
