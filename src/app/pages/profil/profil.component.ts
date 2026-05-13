import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../core/services/auth.service';
import { ClanarineService } from '../../core/services/clanarine.service';
import { Clanarina } from '../../core/models/clanarina.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, Card, Tag, TableModule, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-4xl mx-auto">

        <h1 class="page-title mb-4">{{ 'PROFILE.TITLE' | translate }}</h1>

        <div class="grid">
          <!-- Informacije -->
          <div class="col-12 md:col-5">
            <p-card styleClass="profil-card">
              <div class="text-center mb-4">
                <div class="profil-avatar mx-auto mb-3">
                  <i class="pi pi-user text-4xl" style="color: #000"></i>
                </div>
                <h2 class="profil-name">{{ username() }}</h2>
                <p-tag [value]="role()" [severity]="getRoleSeverity(role())" class="mt-2" />
              </div>

              <div class="profil-info">
                <div class="info-row">
                  <i class="pi pi-user mr-2" style="color: var(--gym-gold)"></i>
                  <span class="info-label">{{ 'PROFILE.EMAIL' | translate }}</span>
                  <span class="info-value">{{ auth.currentUser()?.email }}</span>
                </div>
                <div class="info-row">
                  <i class="pi pi-id-card mr-2" style="color: var(--gym-gold)"></i>
                  <span class="info-label">{{ 'PROFILE.ID' | translate }}</span>
                  <span class="info-value">{{ userId() }}</span>
                </div>
                <div class="info-row">
                  <i class="pi pi-shield mr-2" style="color: var(--gym-gold)"></i>
                  <span class="info-label">{{ 'PROFILE.ROLE' | translate }}</span>
                  <span class="info-value">{{ role() }}</span>
                </div>
              </div>
            </p-card>
          </div>

          <!-- Moje članarine -->
          <div class="col-12 md:col-7">
            <p-card [header]="'PROFILE.MY_MEMBERSHIPS' | translate" styleClass="h-full">
              <div *ngIf="loadingClanarine" class="text-center py-3">
                <i class="pi pi-spin pi-spinner" style="color: var(--gym-gold)"></i>
              </div>

              <p-table *ngIf="!loadingClanarine" [value]="clanarine" [rows]="5" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'PROFILE.TYPE' | translate }}</th>
                    <th>{{ 'PROFILE.FROM' | translate }}</th>
                    <th>{{ 'PROFILE.TO' | translate }}</th>
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
                  <tr>
                    <td colspan="4" class="text-center" style="color: var(--gym-text-muted); padding: 1rem">
                      <i class="pi pi-credit-card mb-2 block text-2xl"></i>
                      {{ 'PROFILE.NO_ACTIVE' | translate }}
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .max-w-4xl { max-width: 900px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; }
    .profil-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-gold) !important; }
    .profil-avatar {
      width: 90px; height: 90px;
      background: var(--gym-gold);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .profil-name { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: #fff; letter-spacing: 2px; margin-bottom: 0; }
    .profil-info { margin-top: 1rem; }
    .info-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; border-bottom: 1px solid var(--gym-border); }
    .info-label { color: var(--gym-text-muted); font-size: 0.85rem; min-width: 70px; }
    .info-value { color: var(--gym-text-primary); font-weight: 600; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class ProfilComponent implements OnInit {
  protected auth = inject(AuthService);
  private clanarineService = inject(ClanarineService);

  username = computed(() => this.auth.currentUser()?.ime ?? '');
  role = computed(() => this.auth.currentUser()?.rola ?? '');
  userId = computed(() => this.auth.currentUser()?.id);

  clanarine: Clanarina[] = [];
  loadingClanarine = true;

  ngOnInit(): void {
    const id = this.userId();
    if (id) {
      this.clanarineService.getByKorisnik(id).subscribe({
        next: (data) => { this.clanarine = data; this.loadingClanarine = false; },
        error: () => { this.loadingClanarine = false; }
      });
    } else {
      this.loadingClanarine = false;
    }
  }

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
