import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { ClanarineService } from '../../core/services/clanarine.service';
import { Clanarina } from '../../core/models/clanarina.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Program } from '../../core/models/program.model';
import { ProgramUplata } from '../../core/models/program-uplata.model';
import { ProgramiService } from '../../core/services/programi.service';
import { ProgramUplateService } from '../../core/services/program-uplate.service';
import { ScanService } from '../../core/services/scan.service';
import { ScanLog } from '../../core/models/scan-log.model';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

interface ExpiringItem {
  tip: 'clanarina' | 'program';
  naziv: string;
  tipLabel: string;
  datumIsteka: string;
  daysUntil: number;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, Card, Tag, TableModule, Button, TranslateModule, FormsModule, DialogModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-4xl mx-auto">

        <h1 class="page-title mb-4">{{ 'PROFILE.TITLE' | translate }}</h1>

        <div class="grid">
          <!-- Profil korisnika (slika + podaci) - ceo red na vrhu -->
          <div class="col-12">
            <p-card styleClass="profil-card">
              <div class="flex align-items-center gap-4 flex-wrap">
                <div class="profil-avatar flex-shrink-0">
                  <img *ngIf="avatarUrl(); else defaultAvatar" [src]="avatarUrl()!" alt="Avatar" class="profil-avatar-img" />
                  <ng-template #defaultAvatar>
                    <i class="pi pi-user text-4xl" style="color: #000"></i>
                  </ng-template>
                </div>
                <div class="flex-grow-1">
                  <h2 class="profil-name mb-1">{{ username() }}</h2>
                  <p-tag [value]="role()" [severity]="getRoleSeverity(role())" class="mb-2" />
                  <div class="profil-info mt-2">
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
                  </div>
                </div>
                <div class="flex flex-column gap-2 align-items-start">
                  <input type="file" accept="image/jpeg,image/png,image/webp" (change)="onAvatarSelected($event)" />
                  <p-button
                    [label]="'PROFILE.UPLOAD_AVATAR' | translate"
                    icon="pi pi-upload"
                    styleClass="btn-gym-primary"
                    size="small"
                    [disabled]="!selectedAvatarFile || uploadingAvatar"
                    [loading]="uploadingAvatar"
                    (onClick)="uploadAvatar()"
                  />
                </div>
              </div>
            </p-card>
          </div>

          <!-- Stat kartice -->
          <div class="col-12">
            <div class="stat-cards-row">
              <div class="stat-card">
                <div class="stat-icon"><i class="pi pi-id-card"></i></div>
                <div class="stat-body">
                  <span class="stat-value">{{ clanarine.length }}</span>
                  <span class="stat-label">Članarine</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon"><i class="pi pi-book"></i></div>
                <div class="stat-body">
                  <span class="stat-value">{{ programUplate.length }}</span>
                  <span class="stat-label">Programi</span>
                </div>
              </div>
              <div class="stat-card" [class.stat-warning]="expiringItems.length > 0">
                <div class="stat-icon"><i class="pi pi-clock"></i></div>
                <div class="stat-body">
                  <span class="stat-value">{{ expiringItems.length }}</span>
                  <span class="stat-label">Uskoro ističe</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Uskoro ističe -->
          <div class="col-12">
            <div class="expiring-section" [class.has-items]="expiringItems.length > 0">
              <div class="expiring-header">
                <i class="pi pi-clock text-xl"></i>
                <h3 class="expiring-title">{{ 'DASHBOARD.EXPIRING_TITLE' | translate }}</h3>
              </div>
              <div class="expiring-list" *ngIf="expiringItems.length > 0">
                <div class="expiring-item" *ngFor="let item of expiringItems" [class.danger]="item.daysUntil <= 1">
                  <div class="expiring-icon">
                    <i [class]="item.tip === 'clanarina' ? 'pi pi-id-card' : 'pi pi-book'"></i>
                  </div>
                  <div class="expiring-info">
                    <span class="expiring-name">{{ item.naziv }}</span>
                    <span class="expiring-type">{{ item.tipLabel }}</span>
                  </div>
                  <div class="expiring-date">
                    <span class="expiring-label">{{ item.datumIsteka | date:'dd.MM.yyyy.' }}</span>
                    <span class="expiring-countdown" [class.text-danger]="item.daysUntil <= 1">
                      <ng-container *ngIf="item.daysUntil === 0">{{ 'DASHBOARD.EXPIRING_TODAY' | translate }}</ng-container>
                      <ng-container *ngIf="item.daysUntil === 1">{{ 'DASHBOARD.EXPIRING_TOMORROW' | translate }}</ng-container>
                      <ng-container *ngIf="item.daysUntil >= 2">{{ 'DASHBOARD.EXPIRING_DAYS' | translate:{days: item.daysUntil} }}</ng-container>
                    </span>
                  </div>
                </div>
              </div>
              <div class="expiring-empty" *ngIf="!loadingClanarine && !loadingProgramUplate && expiringItems.length === 0">
                <i class="pi pi-check-circle text-green"></i>
                <span>{{ 'DASHBOARD.NO_EXPIRING' | translate }}</span>
              </div>
              <div class="expiring-loading" *ngIf="loadingClanarine || loadingProgramUplate">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Učitavanje...</span>
              </div>
            </div>
          </div>

          <!-- Moje članarine i programi -->
          <div class="col-12">
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
                    <td>{{ c.clanarina.naziv }}</td>
                    <td>{{ c.datumUplate | date: 'dd.MM.yyyy' }}</td>
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

              <h3 class="mt-4 mb-2" style="color: var(--gym-gold); font-family: 'Bebas Neue', cursive; letter-spacing: 2px;">Moji programi</h3>

              <div *ngIf="isAdmin()" class="flex justify-content-end mb-2">
                <p-button
                  label="Dodaj program"
                  icon="pi pi-plus"
                  styleClass="btn-gym-primary"
                  size="small"
                  [disabled]="!availablePrograms.length"
                  (onClick)="openProgramDialog()"
                />
              </div>

              <div *ngIf="loadingProgramUplate" class="text-center py-3">
                <i class="pi pi-spin pi-spinner" style="color: var(--gym-gold)"></i>
              </div>

              <p-table *ngIf="!loadingProgramUplate" [value]="programUplate" [rows]="5" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Program</th>
                    <th>Od</th>
                    <th>Do</th>
                    <th>Status</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-p>
                  <tr>
                    <td>{{ p.program.naziv }}</td>
                    <td>{{ p.datumUplate | date: 'dd.MM.yyyy' }}</td>
                    <td>{{ p.datumIsteka | date: 'dd.MM.yyyy' }}</td>
                    <td>
                      <p-tag
                        [value]="getProgramStatus(p)"
                        [severity]="getProgramStatus(p) === 'AKTIVNA' ? 'success' : 'danger'"
                      />
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="text-center" style="color: var(--gym-text-muted); padding: 1rem">
                      <i class="pi pi-calendar-plus mb-2 block text-2xl"></i>
                      Trenutno nema uplata za programe.
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>
        </div>

        <p-dialog
          header="Dodavanje programa"
          [(visible)]="programDialogVisible"
          [modal]="true"
          [style]="{ width: '28rem' }"
          [draggable]="false"
          [resizable]="false"
        >
          <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-2">
              <label for="programSelect">Program</label>
              <select id="programSelect" class="p-inputtext p-component" [(ngModel)]="selectedProgramId" (ngModelChange)="onProgramChanged()">
                <option [ngValue]="null">Izaberi program</option>
                <option *ngFor="let p of availablePrograms" [ngValue]="p.id">
                  {{ p.naziv }} - {{ p.cena | number: '1.0-2' }} RSD
                </option>
              </select>
            </div>

            <div class="flex flex-column gap-2">
              <label for="datumUplate">Datum uplate</label>
              <input id="datumUplate" class="p-inputtext p-component" type="date" [(ngModel)]="programDatumUplate" (change)="onProgramDateChanged()" />
            </div>

            <div class="flex flex-column gap-2">
              <label for="datumIsteka">Datum isteka</label>
              <input id="datumIsteka" class="p-inputtext p-component" type="date" [(ngModel)]="programDatumIsteka" readonly />
            </div>

            <div class="flex flex-column gap-2">
              <label for="iznos">Iznos</label>
              <input id="iznos" class="p-inputtext p-component" type="number" [(ngModel)]="programIznos" readonly />
            </div>
          </div>

          <ng-template pTemplate="footer">
            <p-button label="Otkaži" styleClass="p-button-text" (onClick)="programDialogVisible = false" />
            <p-button
              label="Sačuvaj"
              icon="pi pi-check"
              styleClass="btn-gym-primary"
              [disabled]="!canSubmitProgramPayment()"
              (onClick)="saveProgramPayment()"
            />
          </ng-template>
        </p-dialog>

        <!-- Istorija dolazaka -->
        <div class="col-12 mt-3">
          <p-card header="Istorija dolazaka" styleClass="h-full">
            <div *ngIf="loadingScans" class="text-center py-3">
              <i class="pi pi-spin pi-spinner" style="color: var(--gym-gold)"></i>
            </div>

            <p-table
              *ngIf="!loadingScans"
              [value]="visitEntries"
              [rows]="10"
              [paginator]="visitEntries.length > 10"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Datum</th>
                  <th>Ulaz</th>
                  <th>Izlaz</th>
                  <th>Trajanje</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-v>
                <tr>
                  <td>{{ v.datum | date:'dd.MM.yyyy.' }}</td>
                  <td>
                    <span style="color: #2dc653; font-weight: 600;">{{ v.ulazVreme }}</span>
                  </td>
                  <td>
                    <span [style.color]="v.izlazVreme ? '#e53935' : '#f0a500'" style="font-weight: 600;">
                      {{ v.izlazVreme || 'u teretani' }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="v.trajanje; else uTeretaniTag" style="color: var(--gym-text-muted)">
                      {{ v.trajanje }}
                    </span>
                    <ng-template #uTeretaniTag>
                      <span style="color: #f0a500; font-weight: 600;">u teretani</span>
                    </ng-template>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center" style="color: var(--gym-text-muted); padding: 1rem">
                    Nema evidentiranih dolazaka
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-card>
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
      overflow: hidden;
    }
    .profil-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profil-name { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: #fff; letter-spacing: 2px; margin-bottom: 0; }
    .profil-info { margin-top: 1rem; }
    .info-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; border-bottom: 1px solid var(--gym-border); }
    .info-label { color: var(--gym-text-muted); font-size: 0.85rem; min-width: 70px; }
    .info-value { color: var(--gym-text-primary); font-weight: 600; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mt-3 { margin-top: 1rem; }

    /* === STAT KARTICE === */
    .stat-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .stat-card {
      background: var(--gym-card-bg);
      border: 1px solid var(--gym-border);
      border-radius: 12px;
      padding: 1.25rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: border-color 0.2s;
    }
    .stat-card:hover {
      border-color: rgba(240,165,0,0.3);
    }
    .stat-card.stat-warning {
      border-color: rgba(231,76,60,0.4);
      background: linear-gradient(135deg, rgba(231,76,60,0.06), rgba(231,76,60,0.02));
    }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(240,165,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: var(--gym-gold);
      flex-shrink: 0;
    }
    .stat-card.stat-warning .stat-icon {
      background: rgba(231,76,60,0.15);
      color: #e74c3c;
    }
    .stat-body {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .stat-value {
      font-family: 'Bebas Neue', cursive;
      font-size: 2rem;
      color: #fff;
      line-height: 1;
      letter-spacing: 1px;
    }
    .stat-label {
      color: var(--gym-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* === USKORO ISTIČE === */
    .expiring-section {
      border: 1px solid var(--gym-border);
      background: var(--gym-card-bg);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1rem;
    }
    .expiring-header {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--gym-border);
      color: var(--gym-gold);
    }
    .expiring-title {
      color: #fff;
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .expiring-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .expiring-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--gym-border);
      border-radius: 10px;
      transition: all 0.2s ease;
    }
    .expiring-item.danger {
      border-color: rgba(231,76,60,0.35);
      background: rgba(231,76,60,0.06);
    }
    .expiring-item.danger .expiring-countdown {
      color: #e74c3c !important;
    }
    .expiring-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: rgba(240,165,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      color: var(--gym-gold);
      flex-shrink: 0;
    }
    .expiring-item.danger .expiring-icon {
      background: rgba(231,76,60,0.15);
      color: #e74c3c;
    }
    .expiring-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      flex: 1;
      min-width: 0;
    }
    .expiring-name {
      color: #fff;
      font-weight: 700;
      font-size: 0.88rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .expiring-type {
      color: var(--gym-text-muted);
      font-size: 0.73rem;
    }
    .expiring-date {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.1rem;
      flex-shrink: 0;
    }
    .expiring-label {
      color: var(--gym-text-muted);
      font-size: 0.78rem;
      font-weight: 600;
    }
    .expiring-countdown {
      color: var(--gym-gold);
      font-size: 0.73rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .text-danger { color: #e74c3c !important; }
    .text-green { color: #2ecc71 !important; }
    .expiring-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: var(--gym-text-muted);
      font-size: 0.85rem;
      padding: 0.75rem 0;
    }
    .expiring-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: var(--gym-text-muted);
      padding: 0.5rem 0;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .stat-cards-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfilComponent implements OnInit {
  protected auth = inject(AuthService);
  private clanarineService = inject(ClanarineService);
  private programiService = inject(ProgramiService);
  private programUplateService = inject(ProgramUplateService);
  private scanService = inject(ScanService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  private popuniExpiringItems(): void {
    // Wait for both data sources to complete
    if (this.loadingClanarine || this.loadingProgramUplate) return;

    this.expiringItems = [];
    this.loadingExpiring = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const c of this.clanarine) {
      if (c.status !== 'AKTIVNA' || !c.datumIsteka) continue;
      const parsed = this.parseDateSafe(c.datumIsteka);
      if (!parsed) continue;
      const diffDays = Math.floor((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        this.expiringItems.push({
          tip: 'clanarina',
          naziv: c.clanarina?.naziv || 'Članarina',
          tipLabel: this.translate.instant('DASHBOARD.EXPIRING_CLANARINA'),
          datumIsteka: c.datumIsteka,
          daysUntil: diffDays
        });
      }
    }

    for (const p of this.programUplate) {
      if (p.status !== 'AKTIVNA' || !p.datumIsteka) continue;
      const parsed = this.parseDateSafe(p.datumIsteka);
      if (!parsed) continue;
      const diffDays = Math.floor((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        this.expiringItems.push({
          tip: 'program',
          naziv: p.program?.naziv || 'Program',
          tipLabel: this.translate.instant('DASHBOARD.EXPIRING_PROGRAM'),
          datumIsteka: p.datumIsteka,
          daysUntil: diffDays
        });
      }
    }
  }

  private parseDateSafe(value: unknown): Date | null {
    if (!value) return null;
    if (Array.isArray(value) && value.length >= 3) {
      const y = Number(value[0]); const m = Number(value[1]); const d = Number(value[2]);
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        return new Date(y, m - 1, d, 0, 0, 0);
      }
      return null;
    }
    const str = String(value).trim();
    if (!str) return null;
    const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) return new Date(+match[1], +match[2] - 1, +match[3], 0, 0, 0);
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  username = computed(() => this.auth.currentUser()?.ime ?? '');
  role = computed(() => this.auth.currentUser()?.rola ?? '');
  isAdmin = computed(() => this.role() === 'ADMIN');
  userId = computed(() => this.auth.currentUser()?.id);
  avatarUrl = computed(() => this.resolveAvatarUrl(this.auth.currentUser()?.avatarUrl));

  clanarine: Clanarina[] = [];
  programUplate: ProgramUplata[] = [];
  availablePrograms: Program[] = [];
  expiringItems: ExpiringItem[] = [];
  loadingClanarine = true;
  loadingProgramUplate = true;
  loadingExpiring = true;
  selectedAvatarFile: File | null = null;
  uploadingAvatar = false;
  scanHistory: ScanLog[] = [];
  loadingScans = false;

  get visitEntries(): VisitEntry[] {
    return this._groupScansIntoVisits(this.scanHistory);
  }

  programDialogVisible = false;
  selectedProgramId: number | null = null;
  programDatumUplate = '';
  programDatumIsteka = '';
  programIznos = 0;

  ngOnInit(): void {
    const id = this.userId();
    if (id) {
      this.clanarineService.getByKorisnik(id).subscribe({
        next: (data) => {
          this.clanarine = data;
          this.loadingClanarine = false;
          this.popuniExpiringItems();
        },
        error: () => { this.loadingClanarine = false; this.popuniExpiringItems(); }
      });

      this.programUplateService.getByKorisnik(id).subscribe({
        next: (data) => {
          this.programUplate = [...data].sort((a, b) => new Date(b.datumUplate).getTime() - new Date(a.datumUplate).getTime());
          this.loadingProgramUplate = false;
          this.popuniExpiringItems();
        },
        error: () => { this.loadingProgramUplate = false; this.popuniExpiringItems(); }
      });
    } else {
      this.loadingClanarine = false;
      this.loadingProgramUplate = false;
      this.loadingExpiring = false;
    }

    this.programiService.getAll().subscribe({
      next: (programs) => { this.availablePrograms = programs ?? []; },
      error: () => { this.availablePrograms = []; }
    });

    if (id) this._loadScanHistory(id);
  }

  private _loadScanHistory(userId: number): void {
    this.loadingScans = true;
    this.scanService.getScansForVezbac(userId).subscribe({
      next: (data) => {
        this.scanHistory = data;
        this.loadingScans = false;
      },
      error: () => {
        this.loadingScans = false;
      }
    });
  }

  private _groupScansIntoVisits(scans: ScanLog[]): VisitEntry[] {
    const sorted = [...scans].sort((a, b) => a.skeniranoU.localeCompare(b.skeniranoU));
    const visits: VisitEntry[] = [];
    let pendingUlaz: ScanLog | null = null;

    for (const scan of sorted) {
      const vreme = scan.skeniranoU.substring(11, 16);
      if (scan.tip === 'ULAZ') {
        if (pendingUlaz) {
          visits.push({
            datum: pendingUlaz.skeniranoU,
            ulazVreme: pendingUlaz.skeniranoU.substring(11, 16),
            izlazVreme: null,
            trajanje: null
          });
        }
        pendingUlaz = scan;
      } else if (scan.tip === 'IZLAZ' && pendingUlaz) {
        visits.push({
          datum: pendingUlaz.skeniranoU,
          ulazVreme: pendingUlaz.skeniranoU.substring(11, 16),
          izlazVreme: vreme,
          trajanje: this._izracunajTrajanje(pendingUlaz.skeniranoU.substring(11, 16), vreme)
        });
        pendingUlaz = null;
      }
    }

    if (pendingUlaz) {
      visits.push({
        datum: pendingUlaz.skeniranoU,
        ulazVreme: pendingUlaz.skeniranoU.substring(11, 16),
        izlazVreme: null,
        trajanje: null
      });
    }

    return visits.reverse();
  }

  private _izracunajTrajanje(ulaz: string, izlaz: string): string {
    const [uh, um] = ulaz.split(':').map(Number);
    const [ih, im] = izlaz.split(':').map(Number);
    const diff = (ih * 60 + im) - (uh * 60 + um);
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h${m}min` : `${m}min`;
  }

  getStatus(c: Clanarina): string {
    return c.status || (new Date(c.datumIsteka) >= new Date() ? 'AKTIVNA' : 'ISTEKLA');
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'ZAPOSLENI': return 'warn';
      case 'VEZBAC': return 'success';
      default: return 'secondary';
    }
  }

  getProgramStatus(p: ProgramUplata): string {
    return p.status || (new Date(p.datumIsteka) >= new Date() ? 'AKTIVNA' : 'ISTEKLA');
  }

  openProgramDialog(): void {
    const today = new Date();
    this.programDialogVisible = true;
    this.selectedProgramId = null;
    this.programDatumUplate = this.toDateInput(today);
    this.programDatumIsteka = '';
    this.programIznos = 0;
  }

  onProgramChanged(): void {
    const selected = this.availablePrograms.find((p) => p.id === this.selectedProgramId);
    this.programIznos = selected?.cena ?? 0;
    this.updateProgramIstekFromSelection();
  }

  onProgramDateChanged(): void {
    this.updateProgramIstekFromSelection();
  }

  canSubmitProgramPayment(): boolean {
    return !!this.selectedProgramId && !!this.programDatumUplate && !!this.programDatumIsteka && this.programIznos > 0;
  }

  saveProgramPayment(): void {
    const korisnikId = this.userId();
    if (!korisnikId || !this.canSubmitProgramPayment() || !this.selectedProgramId) {
      return;
    }

    this.programUplateService.create({
      korisnikId,
      programId: this.selectedProgramId,
      datumUplate: this.programDatumUplate,
      datumIsteka: this.programDatumIsteka,
      iznos: this.programIznos
    }).subscribe({
      next: (created) => {
        this.programUplate = [created, ...this.programUplate];
        this.programDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Uspeh',
          detail: 'Program je uspešno dodat na profil.'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: this.extractErrorMessage(err) || 'Neuspešno dodavanje programa.'
        });
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedAvatarFile = file;
  }

  uploadAvatar(): void {
    if (!this.selectedAvatarFile || this.uploadingAvatar) {
      return;
    }

    this.uploadingAvatar = true;
    this.auth.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: () => {
        this.uploadingAvatar = false;
        this.selectedAvatarFile = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Uspeh',
          detail: 'Avatar je uspešno ažuriran.'
        });
      },
      error: (err) => {
        this.uploadingAvatar = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: this.extractErrorMessage(err) || 'Neuspešan upload slike.'
        });
      }
    });
  }

  private resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
    if (!avatarUrl) {
      return null;
    }
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    return avatarUrl;
  }

  private updateProgramIstekFromSelection(): void {
    const selected = this.availablePrograms.find((p) => p.id === this.selectedProgramId);
    if (!selected || !this.programDatumUplate) {
      this.programDatumIsteka = '';
      return;
    }

    const start = new Date(this.programDatumUplate);
    if (Number.isNaN(start.getTime())) {
      this.programDatumIsteka = '';
      return;
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + Math.max(1, selected.trajanjeMeseci ?? 1));
    this.programDatumIsteka = this.toDateInput(end);
  }

  private toDateInput(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private extractErrorMessage(err: any): string {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }
    if (typeof err?.error?.message === 'string' && err.error.message.trim()) {
      return err.error.message;
    }
    if (typeof err?.message === 'string' && err.message.trim()) {
      return err.message;
    }
    return '';
  }
}

interface VisitEntry {
  datum: string;
  ulazVreme: string;
  izlazVreme: string | null;
  trajanje: string | null;
}
