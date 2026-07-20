import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';
import { ScanService } from '../../core/services/scan.service';
import { KorisniciService } from '../../core/services/korisnici.service';
import { ScanLog } from '../../core/models/scan-log.model';
import { Korisnik } from '../../core/models/korisnik.model';

@Component({
  selector: 'app-qr-kodovi',
  standalone: true,
  imports: [CommonModule, Card, Button, TableModule, Tag, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">
        <!-- Naslov -->
        <div class="page-header flex align-items-center gap-3 mb-5">
          <i class="pi pi-qrcode text-4xl" style="color: var(--gym-gold)"></i>
          <div>
            <h1 class="page-title">{{ 'QR.PAGE_TITLE' | translate }}</h1>
          </div>
        </div>

        <!-- QR kodovi grid -->
        <div class="grid mb-5">
          <!-- Ulaz -->
          <div class="col-12 md:col-6">
            <p-card styleClass="qr-card h-full">
              <div class="flex flex-column align-items-center gap-3">
                <h2 class="qr-direction">{{ 'QR.ENTRY_QR' | translate }}</h2>
                <div class="qr-image-wrapper">
                  <img [src]="entryQrUrl" alt="Entry QR" class="qr-image" />
                </div>
                <p class="qr-desc">{{ 'QR.ENTRY_DESC' | translate }}</p>
                <p-button
                  [label]="'QR.DOWNLOAD_ENTRY' | translate"
                  icon="pi pi-download"
                  styleClass="btn-gym-primary"
                  (onClick)="downloadQr(entryQrUrl, 'ulaz.png')"
                />
              </div>
            </p-card>
          </div>

          <!-- Izlaz -->
          <div class="col-12 md:col-6">
            <p-card styleClass="qr-card h-full">
              <div class="flex flex-column align-items-center gap-3">
                <h2 class="qr-direction">{{ 'QR.EXIT_QR' | translate }}</h2>
                <div class="qr-image-wrapper">
                  <img [src]="exitQrUrl" alt="Exit QR" class="qr-image" />
                </div>
                <p class="qr-desc">{{ 'QR.EXIT_DESC' | translate }}</p>
                <p-button
                  [label]="'QR.DOWNLOAD_EXIT' | translate"
                  icon="pi pi-download"
                  styleClass="btn-gym-primary"
                  (onClick)="downloadQr(exitQrUrl, 'izlaz.png')"
                />
              </div>
            </p-card>
          </div>
        </div>

        <!-- Poslednja skeniranja -->
        <div class="grid">
          <div class="col-12">
            <p-card [header]="'QR.RECENT_SCANS' | translate" styleClass="scans-card">
              <p-table
                [value]="recentScans"
                [rows]="10"
                [loading]="loadingScans"
                styleClass="p-datatable-sm"
                dataKey="id"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'QR.USER' | translate }}</th>
                    <th>{{ 'QR.DIRECTION' | translate }}</th>
                    <th>{{ 'QR.SCAN_TIME' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-scan>
                  <tr>
                    <td>{{ getVezbacName(scan.vezbacId) }}</td>
                    <td>
                      <p-tag
                        [value]="scan.tip === 'ULAZ' ? ('QR.ENTRY_QR' | translate) : ('QR.EXIT_QR' | translate)"
                        [severity]="scan.tip === 'ULAZ' ? 'success' : 'warn'"
                      />
                    </td>
                    <td>{{ scan.skeniranoU | date:'dd.MM.yyyy. HH:mm:ss' }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="3" class="text-center p-4">
                      <i class="pi pi-inbox text-3xl mb-2" style="color: var(--gym-text-muted); display: block;"></i>
                      <span style="color: var(--gym-text-muted)">{{ 'QR.NO_SCANS' | translate }}</span>
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
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .page-header { border-bottom: 1px solid var(--gym-border); padding-bottom: 1rem; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .qr-card { border: 1px solid var(--gym-border) !important; background: var(--gym-card-bg) !important; }
    .qr-direction { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: #fff; letter-spacing: 2px; margin: 0; }
    .qr-image-wrapper {
      background: #fff;
      padding: 1rem;
      border-radius: 12px;
      display: inline-flex;
    }
    .qr-image { width: 250px; height: 250px; display: block; }
    .qr-desc { color: var(--gym-text-muted); text-align: center; margin: 0; font-size: 0.9rem; }
    .scans-card { border: 1px solid var(--gym-border) !important; background: var(--gym-card-bg) !important; }
  `]
})
export class QrKodoviComponent implements OnInit {
  private scanService = inject(ScanService);
  private korisniciService = inject(KorisniciService);

  entryQrUrl = this.scanService.getEntryQrUrl();
  exitQrUrl = this.scanService.getExitQrUrl();

  recentScans: ScanLog[] = [];
  loadingScans = false;
  vezbaciMap = new Map<number, string>();

  ngOnInit(): void {
    this.loadVezbaci();
    this.loadRecentScans();
  }

  private loadVezbaci(): void {
    this.korisniciService.getAllVezbaci().subscribe({
      next: (data) => {
        for (const v of data) {
          this.vezbaciMap.set(v.id, `${v.ime} ${v.prezime}`);
        }
      }
    });
  }

  private loadRecentScans(): void {
    this.loadingScans = true;
    this.scanService.getAllScans().subscribe({
      next: (data: any) => {
        this.recentScans = data?.content ?? data ?? [];
        this.loadingScans = false;
      },
      error: () => {
        this.loadingScans = false;
      }
    });
  }

  getVezbacName(vezbacId: number): string {
    return this.vezbaciMap.get(vezbacId) ?? `#${vezbacId}`;
  }

  downloadQr(url: string, filename: string): void {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }
}
