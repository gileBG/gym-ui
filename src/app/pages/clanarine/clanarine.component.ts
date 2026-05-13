import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClanarineService } from '../../core/services/clanarine.service';
import { KorisniciService } from '../../core/services/korisnici.service';
import { Korisnik } from '../../core/models/korisnik.model';
import { Program } from '../../core/models/program.model';

@Component({
  selector: 'app-clanarine',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, Button, Dialog, Select, DatePicker, InputNumber, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">
        <div class="flex align-items-center justify-content-between mb-4">
          <div>
            <h1 class="page-title">{{ 'MEMBERSHIPS.TITLE' | translate }}</h1>
            <p class="page-sub">{{ 'MEMBERSHIPS.SUBTITLE' | translate }}</p>
          </div>
          <p-button [label]="'MEMBERSHIPS.NEW' | translate" icon="pi pi-plus" styleClass="btn-gym-primary" (onClick)="openDialog()" />
        </div>

        <h1 class="page-title gym-header mb-4">{{ 'MEMBERSHIPS.GYM_HEADER' | translate }}</h1>

        <p-table
          [value]="programs"
          [loading]="loading"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'PROGRAMS.NAME' | translate }}</th>
              <th>{{ 'PROGRAMS.PRICE' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-p>
            <tr>
              <td>{{ p.naziv }}</td>
              <td>{{ p.cena | number:'1.0-0' }} RSD</td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="2" class="text-center p-4" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.EMPTY' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>

        <h1 class="page-title gym-header mt-6 mb-3">{{ 'MEMBERSHIPS.GYM_PROGRAM_HEADER' | translate }}</h1>
        <p-table
          [value]="clanarineRows"
          [loading]="loadingClanarine"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              
              <th>{{ 'PROGRAMS.NAME' | translate }}</th>
              <th>{{ 'PROGRAMS.DESCRIPTION' | translate }}</th>
              <th>{{ 'PROGRAMS.PRICE' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-c>
            <tr>
              
              <td>{{ rowNaziv(c) }}</td>
              <td>{{ rowOpis(c) }}</td>
              <td>{{ rowCena(c) }}</td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center p-4" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.SYSTEM_EMPTY' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [header]="'MEMBERSHIPS.NEW' | translate"
      [modal]="true"
      styleClass="gym-dialog"
      [style]="{width: '450px'}"
    >
      <form [formGroup]="form" class="flex flex-column gap-4 pt-3">
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.USER' | translate }}</label>
          <p-select
            formControlName="korisnikId"
            [options]="korisnici"
            optionLabel="fullName"
            optionValue="id"
            [placeholder]="'MEMBERSHIPS.SELECT_USER' | translate"
            styleClass="w-full"
            [filter]="true"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.PROGRAM' | translate }}</label>
          <p-select
            formControlName="programId"
            [options]="programs"
            optionLabel="naziv"
            optionValue="id"
            [placeholder]="'MEMBERSHIPS.SELECT_PROGRAM' | translate"
            styleClass="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.PAYMENT_DATE' | translate }}</label>
          <p-datepicker formControlName="datumUplate" dateFormat="dd.mm.yy" styleClass="w-full" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.EXPIRY_DATE' | translate }}</label>
          <p-datepicker formControlName="datumIsteka" dateFormat="dd.mm.yy" styleClass="w-full" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.AMOUNT_RSD' | translate }}</label>
          <p-inputnumber formControlName="iznos" styleClass="w-full" [min]="0" />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" [text]="true" (onClick)="closeDialog()" />
        <p-button [label]="'COMMON.CREATE' | translate" icon="pi pi-check" styleClass="btn-gym-primary" [loading]="saving" (onClick)="saveClanarina()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .gym-header { text-align: center; text-transform: lowercase; }
    .page-sub { color: var(--gym-text-muted); margin: 0; }
  `]
})
export class ClanarineComponent implements OnInit {
  private clanarineService = inject(ClanarineService);
  private korisniciService = inject(KorisniciService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  korisnici: (Korisnik & { fullName: string })[] = [];
  programs: Program[] = [];
  clanarineRows: any[] = [];
  loading = true;
  loadingClanarine = true;
  dialogVisible = false;
  saving = false;

  form = this.fb.group({
    korisnikId: [null as number | null, Validators.required],
    programId: [null as number | null, Validators.required],
    datumUplate: [null as Date | null, Validators.required],
    datumIsteka: [null as Date | null],
    iznos: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadPrograms();
    this.loadClanarineRows();
    this.korisniciService.getAllVezbaci().subscribe({
      next: (data) => {
        this.korisnici = data.map(k => ({ ...k, fullName: `${k.ime} ${k.prezime} (${k.email})` }));
      },
      error: () => {}
    });

    this.form.controls.programId.valueChanges.subscribe(() => this.applyProgramDefaults());
    this.form.controls.datumUplate.valueChanges.subscribe(() => this.applyProgramDefaults());
  }

  loadPrograms(): void {
    this.loading = true;
    this.clanarineService.getCenovnikPrograms().subscribe({
      next: (data) => { this.programs = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadClanarineRows(): void {
    this.loadingClanarine = true;
    this.clanarineService.getAll().subscribe({
      next: (data) => { this.clanarineRows = data; this.loadingClanarine = false; },
      error: () => { this.loadingClanarine = false; }
    });
  }

  openDialog(): void {
    this.form.reset();
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }

  saveClanarina(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const raw = this.form.value;
    const paymentDate = raw.datumUplate as Date | null;
    if (!paymentDate) {
      this.saving = false;
      return;
    }

    let expiryDate = raw.datumIsteka as Date | null;
    if (!expiryDate) {
      const selectedProgram = this.programs.find(p => p.id === raw.programId);
      if (selectedProgram) {
        expiryDate = new Date(paymentDate);
        expiryDate.setMonth(expiryDate.getMonth() + selectedProgram.trajanjeMeseci);
        this.form.patchValue({ datumIsteka: expiryDate }, { emitEvent: false });
      }
    }

    if (!expiryDate) {
      this.saving = false;
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('COMMON.ERROR'),
        detail: this.translate.instant('MEMBERSHIPS.CREATE_FAILED')
      });
      return;
    }

    const payload = {
      korisnikId: raw.korisnikId!,
      programId: raw.programId!,
      datumUplate: paymentDate.toISOString().split('T')[0],
      datumIsteka: expiryDate.toISOString().split('T')[0],
      iznos: raw.iznos!
    };

    this.clanarineService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.closeDialog();
        this.loadPrograms();
        this.loadClanarineRows();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('MEMBERSHIPS.CREATED')
        });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('MEMBERSHIPS.CREATE_FAILED')
        });
      }
    });
  }

  private applyProgramDefaults(): void {
    const programId = this.form.controls.programId.value;
    if (!programId) return;

    const selectedProgram = this.programs.find(p => p.id === programId);
    if (!selectedProgram) return;

    this.form.patchValue({ iznos: selectedProgram.cena }, { emitEvent: false });

    const paymentDate = this.form.controls.datumUplate.value as Date | null;
    if (!paymentDate) return;

    const expiryDate = new Date(paymentDate);
    expiryDate.setMonth(expiryDate.getMonth() + selectedProgram.trajanjeMeseci);
    this.form.patchValue({ datumIsteka: expiryDate }, { emitEvent: false });
  }

  private programFromRow(row: any): any {
    return row?.program ?? row;
  }

  rowId(row: any): number | string {
    const program = this.programFromRow(row);
    return program?.id ?? '-';
  }

  rowNaziv(row: any): string {
    const program = this.programFromRow(row);
    return program?.naziv || '-';
  }

  rowOpis(row: any): string {
    const program = this.programFromRow(row);
    return program?.opis || '-';
  }

  rowCena(row: any): string {
    const program = this.programFromRow(row);
    if (program?.cena == null) return '-';
    const amount = Number(program.cena);
    return Number.isFinite(amount) ? `${amount.toLocaleString('sr-RS')} RSD` : '-';
  }

}
