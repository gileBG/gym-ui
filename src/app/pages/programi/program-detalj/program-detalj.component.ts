import { Component, inject, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { ProgramiService } from '../../../core/services/programi.service';
import { Program } from '../../../core/models/program.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-program-detalj',
  standalone: true,
  imports: [CommonModule, Card, Button, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-3xl mx-auto">
        <div class="flex align-items-center gap-3 mb-4">
          <p-button icon="pi pi-arrow-left" [outlined]="true" size="small" (onClick)="goBack()" />
          <h1 class="page-title">{{ 'PROGRAMS.DETAIL_TITLE' | translate }}</h1>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <i class="pi pi-spin pi-spinner text-4xl" style="color: var(--gym-gold)"></i>
        </div>

        <p-card *ngIf="!loading && program" styleClass="program-detail-card">
          <ng-template pTemplate="header">
            <div class="program-detail-header px-4 py-4">
              <div class="flex align-items-center gap-3">
                <div class="program-icon-wrap">
                  <i class="pi pi-bolt text-2xl" style="color: #000"></i>
                </div>
                <h2 class="program-detail-title">{{ program.naziv }}</h2>
              </div>
            </div>
          </ng-template>

          <div class="program-detail-body">
            <p class="program-desc">{{ program.opis }}</p>

            <div class="program-detail-meta grid mt-4">
              <div class="col-6">
                <div class="meta-item">
                  <i class="pi pi-clock mr-2" style="color: var(--gym-gold)"></i>
                  <span class="meta-label">{{ 'PROGRAMS.DURATION_LABEL' | translate }}</span>
                  <span class="meta-value">{{ program.trajanjeMeseci }} {{ 'PROGRAMS.MONTHS' | translate }}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="meta-item">
                  <i class="pi pi-tag mr-2" style="color: var(--gym-gold)"></i>
                  <span class="meta-label">{{ 'PROGRAMS.PRICE_LABEL' | translate }}</span>
                  <span class="meta-value">{{ program.cena | number:'1.0-0' }} RSD</span>
                </div>
              </div>
            </div>
          </div>
        </p-card>

        <div *ngIf="!loading && !program" class="text-center py-5">
          <p style="color: var(--gym-text-muted)">{{ 'PROGRAMS.NOT_FOUND' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-3xl { max-width: 700px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .program-detail-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-gold) !important; }
    .program-detail-header { background: linear-gradient(135deg, #111, #1a1a2e); border-bottom: 2px solid var(--gym-gold); }
    .program-icon-wrap {
      width: 55px; height: 55px;
      background: var(--gym-gold);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .program-detail-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: #fff; letter-spacing: 3px; margin: 0; }
    .program-desc { color: var(--gym-text-muted); font-size: 1rem; line-height: 1.8; }
    .meta-item { display: flex; align-items: center; gap: 0.4rem; }
    .meta-label { color: var(--gym-text-muted); font-size: 0.9rem; }
    .meta-value { color: #fff; font-weight: 600; font-size: 0.9rem; }
  `]
})
export class ProgramDetaljComponent implements OnInit {
  id = input.required<string>();

  private programiService = inject(ProgramiService);
  private router = inject(Router);

  program: Program | null = null;
  loading = true;

  ngOnInit(): void {
    const numId = Number(this.id());
    if (isNaN(numId)) { this.loading = false; return; }
    this.programiService.getById(numId).subscribe({
      next: (p) => { this.program = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  goBack(): void { this.router.navigate(['/programi']); }
}
