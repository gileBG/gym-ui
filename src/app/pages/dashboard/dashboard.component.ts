import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { KorisniciService } from '../../core/services/korisnici.service';
import { ClanarineService } from '../../core/services/clanarine.service';
import { ProgramiService } from '../../core/services/programi.service';
import { AuthService } from '../../core/services/auth.service';
import { Korisnik } from '../../core/models/korisnik.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Card, Button, TableModule, Tag, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">

        <!-- Dobrodošlica -->
        <div class="dashboard-welcome flex align-items-center gap-3 mb-5">
          <i class="pi pi-bolt text-4xl" style="color: var(--gym-gold)"></i>
          <div>
            <h1 class="dash-title">Dashboard</h1>
            <p class="dash-sub">{{ 'DASHBOARD.WELCOME' | translate:{ name: username() } }}</p>
          </div>
        </div>

        <!-- Stat kartice -->
        <div class="grid mb-5">
          <div class="col-12 sm:col-6 xl:col-3">
            <p-card styleClass="stat-card">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <p class="stat-label">{{ 'DASHBOARD.TOTAL_MEMBERS' | translate }}</p>
                  <h2 class="stat-value">{{ totalKorisnici }}</h2>
                </div>
                <div class="stat-icon bg-blue"><i class="pi pi-users"></i></div>
              </div>
            </p-card>
          </div>
          <div class="col-12 sm:col-6 xl:col-3">
            <p-card styleClass="stat-card">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <p class="stat-label">{{ 'DASHBOARD.EMPLOYEES' | translate }}</p>
                  <h2 class="stat-value">{{ totalZaposleni }}</h2>
                </div>
                <div class="stat-icon bg-gold"><i class="pi pi-id-card"></i></div>
              </div>
            </p-card>
          </div>
          <div class="col-12 sm:col-6 xl:col-3">
            <p-card styleClass="stat-card">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <p class="stat-label">{{ 'DASHBOARD.ACTIVE_PROGRAMS' | translate }}</p>
                  <h2 class="stat-value">{{ totalProgrami }}</h2>
                </div>
                <div class="stat-icon bg-red"><i class="pi pi-bolt"></i></div>
              </div>
            </p-card>
          </div>
          <div class="col-12 sm:col-6 xl:col-3">
            <p-card styleClass="stat-card">
              <div class="flex justify-content-between align-items-center">
                <div>
                  <p class="stat-label">{{ 'DASHBOARD.MEMBERSHIPS' | translate }}</p>
                  <h2 class="stat-value">{{ totalClanarine }}</h2>
                </div>
                <div class="stat-icon bg-green"><i class="pi pi-credit-card"></i></div>
              </div>
            </p-card>
          </div>
        </div>

        <!-- Brze akcije -->
        <div class="grid mb-5">
          <div class="col-12 md:col-6">
            <p-card [header]="'DASHBOARD.QUICK_ACTIONS' | translate" styleClass="h-full">
              <div class="flex flex-column gap-2">
                <a routerLink="/korisnici">
                  <p-button [label]="'DASHBOARD.MANAGE_USERS' | translate" icon="pi pi-users" styleClass="w-full" [outlined]="true" />
                </a>
                <a routerLink="/programi">
                  <p-button [label]="'DASHBOARD.MANAGE_PROGRAMS' | translate" icon="pi pi-bolt" styleClass="w-full btn-gym-primary" />
                </a>
                <a routerLink="/clanarine">
                  <p-button [label]="'DASHBOARD.VIEW_MEMBERSHIPS' | translate" icon="pi pi-credit-card" styleClass="w-full" [outlined]="true" />
                </a>
              </div>
            </p-card>
          </div>

          <!-- Poslednji korisnici -->
          <div class="col-12 md:col-6">
            <p-card [header]="'DASHBOARD.RECENT_REGISTRATIONS' | translate" styleClass="h-full">
              <p-table [value]="recentKorisnici" [rows]="5" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'DASHBOARD.NAME' | translate }}</th>
                    <th>{{ 'DASHBOARD.EMAIL' | translate }}</th>
                    <th>{{ 'DASHBOARD.ROLE' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-k>
                  <tr>
                    <td>{{ k.ime }} {{ k.prezime }}</td>
                    <td>{{ k.email }}</td>
                    <td>
                      <p-tag [value]="k.rola" [severity]="getRoleSeverity(k.rola)" />
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr><td colspan="3" class="text-center text-muted">{{ 'DASHBOARD.NO_DATA' | translate }}</td></tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .dashboard-welcome { border-bottom: 1px solid var(--gym-border); padding-bottom: 1rem; }
    .dash-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .dash-sub { color: var(--gym-text-muted); margin: 0; }
    .text-gold { color: var(--gym-gold); font-weight: 700; }
    .stat-card { border: 1px solid var(--gym-border) !important; background: var(--gym-card-bg) !important; }
    .stat-label { color: var(--gym-text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
    .stat-value { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: #fff; margin: 0; letter-spacing: 1px; }
    .stat-icon {
      width: 50px; height: 50px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      i { font-size: 1.4rem; color: #fff; }
    }
    .bg-blue { background: #1a6bba; }
    .bg-gold { background: var(--gym-gold); i { color: #000 !important; } }
    .bg-red { background: var(--gym-red); }
    .bg-green { background: #2dc653; }
    .text-muted { color: var(--gym-text-muted); }
  `]
})
export class DashboardComponent implements OnInit {
  private korisniciService = inject(KorisniciService);
  private clanarineService = inject(ClanarineService);
  private programiService = inject(ProgramiService);
  private auth = inject(AuthService);

  username = computed(() => this.auth.currentUser()?.ime ?? '');

  totalKorisnici = 0;
  totalZaposleni = 0;
  totalProgrami = 0;
  totalClanarine = 0;
  recentKorisnici: Korisnik[] = [];

  ngOnInit(): void {
    this.korisniciService.getAllVezbaci().subscribe({
      next: (data) => {
        this.totalKorisnici = data.length;
        this.recentKorisnici = data.slice(-5).reverse();
      },
      error: () => {}
    });

    this.korisniciService.getAllZaposleni().subscribe({
      next: (data) => {
        this.totalZaposleni = data.length;
      },
      error: () => {}
    });

    this.programiService.getAll().subscribe({
      next: (data) => this.totalProgrami = data.length,
      error: () => {}
    });

    this.clanarineService.getAll().subscribe({
      next: (data) => this.totalClanarine = data.length,
      error: () => {}
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
