import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { KorisniciService } from '../../core/services/korisnici.service';
import { ClanarineService } from '../../core/services/clanarine.service';
import { ProgramiService } from '../../core/services/programi.service';
import { AuthService } from '../../core/services/auth.service';
import { IzvestajiService, MesecnaZaradaResponse } from '../../core/services/izvestaji.service';
import { Korisnik } from '../../core/models/korisnik.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Card, Button, Dialog, Select, TableModule, Tag, ConfirmDialog, Toast, TranslateModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">

        <!-- Dobrodošlica -->
        <div class="dashboard-welcome flex align-items-center gap-3 mb-5">
          <i class="pi pi-bolt text-4xl" style="color: var(--gym-gold)"></i>
          <div>
            <h1 class="dash-title">{{ 'DASHBOARD.TITLE' | translate }}</h1>
            <p class="dash-sub">{{ 'DASHBOARD.WELCOME' | translate:{ name: username() } }}</p>
          </div>
        </div>

        <!-- Meni kartice -->
        <div class="dashboard-tabs flex gap-2 mb-4 flex-wrap">
          <p-button
            [label]="'DASHBOARD.TAB_STATS' | translate"
            icon="pi pi-chart-bar"
            [outlined]="activeTab !== 'stats'"
            styleClass="tab-btn"
            (onClick)="activeTab = 'stats'"
          />
          <p-button
            [label]="'DASHBOARD.TAB_PENDING' | translate"
            icon="pi pi-clock"
            [outlined]="activeTab !== 'pending'"
            [styleClass]="'tab-btn' + (pendingKorisnici.length > 0 ? ' pulse-tab' : '')"
            (onClick)="activeTab = 'pending'; loadPendingKorisnici()"
            [badge]="pendingKorisnici.length.toString()"
            badgeSeverity="warn"
          />
          <p-button
            [label]="'DASHBOARD.TAB_ACTIONS' | translate"
            icon="pi pi-bolt"
            [outlined]="activeTab !== 'actions'"
            styleClass="tab-btn"
            (onClick)="activeTab = 'actions'"
          />
          <p-button
            [label]="'DASHBOARD.TAB_REPORTS' | translate"
            icon="pi pi-file"
            [outlined]="activeTab !== 'reports'"
            styleClass="tab-btn"
            (onClick)="activeTab = 'reports'"
          />
        </div>

        <!-- === TAB: Statistika === -->
        @if (activeTab === 'stats') {
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
        }

        <!-- === TAB: Zahtevi za registraciju === -->
        @if (activeTab === 'pending') {
          <div class="grid mb-5">
            <div class="col-12">
              <p-card [header]="'DASHBOARD.PENDING_REQUESTS' | translate" styleClass="h-full">
                <p-table [value]="pendingKorisnici" [rows]="10" [loading]="loadingPending" styleClass="p-datatable-sm" dataKey="id">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>{{ 'DASHBOARD.NAME' | translate }}</th>
                      <th>{{ 'DASHBOARD.EMAIL' | translate }}</th>
                      <th>{{ 'DASHBOARD.REGISTERED_AT' | translate }}</th>
                      <th>{{ 'COMMON.ACTIONS' | translate }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-k>
                    <tr>
                      <td>{{ k.ime }} {{ k.prezime }}</td>
                      <td>{{ k.email }}</td>
                      <td>{{ (k.datumRegistracije | date:'dd.MM.yyyy. HH:mm') || '-' }}</td>
                      <td>
                        <div class="flex gap-2">
                          <p-button
                            icon="pi pi-check"
                            [label]="'DASHBOARD.APPROVE' | translate"
                            size="small"
                            severity="success"
                            (onClick)="approveUser(k)"
                          />
                          <p-button
                            icon="pi pi-times"
                            [label]="'DASHBOARD.REJECT' | translate"
                            size="small"
                            severity="danger"
                            [outlined]="true"
                            (onClick)="rejectUser(k)"
                          />
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="emptymessage">
                    <tr>
                      <td colspan="4" class="text-center p-4">
                        <i class="pi pi-check-circle text-3xl mb-2" style="color: var(--gym-text-muted); display: block;"></i>
                        <span style="color: var(--gym-text-muted)">{{ 'DASHBOARD.NO_PENDING' | translate }}</span>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </p-card>
            </div>
          </div>
        }

        <!-- === TAB: Brze akcije === -->
        @if (activeTab === 'actions') {
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
        }

        <!-- === TAB: Izveštaji === -->
        @if (activeTab === 'reports') {
          <div class="grid mb-5">
            <div class="col-12 md:col-6">
              <p-card header="Izveštaji" styleClass="h-full">
                <p-button label="Zarada po mesecima" icon="pi pi-chart-bar" styleClass="w-full btn-gym-primary" (onClick)="openZaradaDialog()" />
              </p-card>
            </div>
          </div>
        }

        <!-- Dialog: Zarada po mesecima -->
        <p-dialog
          header="Zarada po mesecima"
          [(visible)]="zaradaDialogVisible"
          [modal]="true"
          [style]="{ width: '420px' }"
          styleClass="gym-dialog"
          [draggable]="false"
          [resizable]="false"
        >
          <div class="flex flex-column gap-4 pt-2">
            <div class="flex flex-column gap-2">
              <label for="godina" style="color: var(--gym-text-muted); font-size: 0.9rem;">Godina</label>
              <p-select
                id="godina"
                [options]="godine"
                [(ngModel)]="selectedGodina"
                placeholder="Izaberi godinu"
                styleClass="w-full"
              />
            </div>
            <div class="flex flex-column gap-2">
              <label for="mesec" style="color: var(--gym-text-muted); font-size: 0.9rem;">Mesec</label>
              <p-select
                id="mesec"
                [options]="meseci"
                optionLabel="label"
                optionValue="value"
                [(ngModel)]="selectedMesec"
                placeholder="Izaberi mesec"
                styleClass="w-full"
              />
            </div>
            <div class="flex flex-column gap-2">
              <label style="color: var(--gym-text-muted); font-size: 0.9rem;">Format izveštaja</label>
              <div class="flex gap-2">
                <p-button
                  label="Excel"
                  icon="pi pi-file-excel"
                  [outlined]="izvestajFormat !== 'excel'"
                  styleClass="flex-1"
                  (onClick)="izvestajFormat = 'excel'"
                />
                <p-button
                  label="PDF"
                  icon="pi pi-file-pdf"
                  [outlined]="izvestajFormat !== 'pdf'"
                  styleClass="flex-1"
                  (onClick)="izvestajFormat = 'pdf'"
                />
              </div>
            </div>
          </div>
          <ng-template pTemplate="footer">
            <p-button label="Otkaži" styleClass="p-button-text" (onClick)="zaradaDialogVisible = false" />
            <p-button
              [label]="izvestajFormat === 'excel' ? 'Izvezi u Excel' : 'Izvezi u PDF'"
              [icon]="izvestajFormat === 'excel' ? 'pi pi-file-excel' : 'pi pi-file-pdf'"
              styleClass="btn-gym-primary"
              [disabled]="!selectedGodina || !selectedMesec"
              [loading]="generatingIzvestaj"
              (onClick)="generateZaradaIzvestaj()"
            />
          </ng-template>
        </p-dialog>

      </div>
    </div>

    <p-toast />
    <p-confirmdialog />
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .dashboard-welcome { border-bottom: 1px solid var(--gym-border); padding-bottom: 1rem; }
    .dash-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .dash-sub { color: var(--gym-text-muted); margin: 0; }
    .text-black { color: var(--gym-text-primary); font-weight: 700; }
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
    .dashboard-tabs { border-bottom: 1px solid var(--gym-border); padding-bottom: 0.5rem; }
    .tab-btn .p-button { font-size: 0.9rem; }



    @keyframes pulse-tab {
      0% { box-shadow: 0 0 0 0 rgba(240, 165, 0, 0.5); }
      70% { box-shadow: 0 0 0 12px rgba(240, 165, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(240, 165, 0, 0); }
    }
    :host ::ng-deep .pulse-tab {
      animation: pulse-tab 2s infinite !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private korisniciService = inject(KorisniciService);
  private clanarineService = inject(ClanarineService);
  private programiService = inject(ProgramiService);
  private izvestajiService = inject(IzvestajiService);
  private auth = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  username = computed(() => this.auth.currentUser()?.ime ?? '');

  totalKorisnici = 0;
  totalZaposleni = 0;
  totalProgrami = 0;
  totalClanarine = 0;
  recentKorisnici: Korisnik[] = [];

  activeTab: 'stats' | 'pending' | 'actions' | 'reports' = 'stats';

  pendingKorisnici: Korisnik[] = [];
  loadingPending = false;

  zaradaDialogVisible = false;
  generatingIzvestaj = false;
  selectedGodina: number | null = null;
  selectedMesec: number | null = null;
  izvestajFormat: 'excel' | 'pdf' = 'excel';

  godine: number[] = [];
  meseci = [
    { label: 'Januar', value: 1 },
    { label: 'Februar', value: 2 },
    { label: 'Mart', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Maj', value: 5 },
    { label: 'Jun', value: 6 },
    { label: 'Jul', value: 7 },
    { label: 'Avgust', value: 8 },
    { label: 'Septembar', value: 9 },
    { label: 'Oktobar', value: 10 },
    { label: 'Novembar', value: 11 },
    { label: 'Decembar', value: 12 }
  ];

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.godine = [];
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
      this.godine.push(y);
    }

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

    this.loadPendingKorisnici();
  }

  loadPendingKorisnici(): void {
    this.loadingPending = true;
    this.korisniciService.getPendingKorisnici().subscribe({
      next: (data) => {
        this.pendingKorisnici = data;
        this.loadingPending = false;
      },
      error: () => {
        this.loadingPending = false;
      }
    });
  }

  approveUser(k: Korisnik): void {
    this.confirmationService.confirm({
      header: this.translate.instant('DASHBOARD.CONFIRM_APPROVE_HEADER'),
      message: this.translate.instant('DASHBOARD.CONFIRM_APPROVE', { name: `${k.ime} ${k.prezime}` }),
      acceptLabel: this.translate.instant('COMMON.YES'),
      rejectLabel: this.translate.instant('COMMON.CANCEL'),
      accept: () => {
        this.korisniciService.approveVezbac(k.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('DASHBOARD.USER_APPROVED', { name: `${k.ime} ${k.prezime}` })
            });
            this.pendingKorisnici = this.pendingKorisnici.filter(u => u.id !== k.id);
            this.totalKorisnici++;
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('COMMON.ERROR'),
              detail: this.translate.instant('DASHBOARD.APPROVE_FAILED')
            });
          }
        });
      }
    });
  }

  rejectUser(k: Korisnik): void {
    this.confirmationService.confirm({
      header: this.translate.instant('DASHBOARD.CONFIRM_REJECT_HEADER'),
      message: this.translate.instant('DASHBOARD.CONFIRM_REJECT', { name: `${k.ime} ${k.prezime}` }),
      acceptLabel: this.translate.instant('COMMON.YES'),
      rejectLabel: this.translate.instant('COMMON.CANCEL'),
      accept: () => {
        this.korisniciService.rejectVezbac(k.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('DASHBOARD.USER_REJECTED', { name: `${k.ime} ${k.prezime}` })
            });
            this.pendingKorisnici = this.pendingKorisnici.filter(u => u.id !== k.id);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('COMMON.ERROR'),
              detail: this.translate.instant('DASHBOARD.REJECT_FAILED')
            });
          }
        });
      }
    });
  }

  openZaradaDialog(): void {
    this.selectedGodina = new Date().getFullYear();
    this.selectedMesec = new Date().getMonth() + 1;
    this.zaradaDialogVisible = true;
  }

  generateZaradaIzvestaj(): void {
    if (!this.selectedGodina || !this.selectedMesec) return;

    this.generatingIzvestaj = true;
    this.izvestajiService.getZaradaPoMesecu(this.selectedGodina, this.selectedMesec).subscribe({
      next: (data) => {
        if (this.izvestajFormat === 'excel') {
          this.exportToExcel(data);
        } else {
          this.exportToPdf(data);
        }
        this.generatingIzvestaj = false;
        this.zaradaDialogVisible = false;
      },
      error: () => {
        this.generatingIzvestaj = false;
      }
    });
  }

  private exportToExcel(data: MesecnaZaradaResponse): void {
    const mesecNaziv = this.meseci.find(m => m.value === data.mesec)?.label ?? String(data.mesec);

    const headers = [['Tip', 'Naziv', 'Iznos (RSD)', 'Broj uplata']];
    const rows = data.stavke.map(s => [s.tip, s.naziv, s.iznos, s.brojUplata]);
    const totals: any[] = [
      [],
      ['UKUPNO', 'Članarine', data.ukupnoClanarine, ''],
      ['UKUPNO', 'Programi', data.ukupnoProgrami, ''],
      ['UKUPNO', 'SVE UKUPNO', data.ukupnoSve, '']
    ];

    const wsData = [...headers, ...rows, ...totals];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Stilizovanje (bold za header i total)
    ws['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 16 }, { wch: 14 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Zarada');

    const filename = `zarada_${mesecNaziv.toLowerCase()}_${data.godina}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  private exportToPdf(data: MesecnaZaradaResponse): void {
    const mesecNaziv = this.meseci.find(m => m.value === data.mesec)?.label ?? String(data.mesec);

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Zaglavlje
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PowerGym', 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(240, 165, 0);
    doc.text(`Izveštaj o zaradi - ${mesecNaziv} ${data.godina}`, 14, 30);
    doc.setTextColor(0, 0, 0);

    // Tabela
    const bodyRows = data.stavke.map(s => [s.tip, s.naziv, `${s.iznos.toLocaleString('sr-RS')} RSD`, String(s.brojUplata)]);

    autoTable(doc, {
      startY: 40,
      head: [['Tip', 'Naziv', 'Iznos (RSD)', 'Broj uplata']],
      body: bodyRows,
      foot: [
        ['', 'UKUPNO Članarine', `${data.ukupnoClanarine.toLocaleString('sr-RS')} RSD`, ''],
        ['', 'UKUPNO Programi', `${data.ukupnoProgrami.toLocaleString('sr-RS')} RSD`, ''],
        ['', 'SVE UKUPNO', `${data.ukupnoSve.toLocaleString('sr-RS')} RSD`, '']
      ],
      theme: 'grid',
      headStyles: { fillColor: [240, 165, 0], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 10 },
      footStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 }
    });

    // Datum generisanja
    const today = new Date();
    const dateStr = today.toLocaleDateString('sr-RS');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generisano: ${dateStr}`, 14, doc.internal.pageSize.height - 10);

    const filename = `zarada_${mesecNaziv.toLowerCase()}_${data.godina}.pdf`;
    doc.save(filename);
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
