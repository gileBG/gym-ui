import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClanarineService } from '../../core/services/clanarine.service';
import { ProgramiService } from '../../core/services/programi.service';
import { KorisniciService } from '../../core/services/korisnici.service';
import { Program } from '../../core/models/program.model';
import { Korisnik } from '../../core/models/korisnik.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-clanarine',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, Button, Dialog, Select, InputText, InputNumber, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">

        <div class="flex align-items-center justify-content-between mb-4">
          <div>
            <h1 class="page-title">{{ 'MEMBERSHIPS.TITLE' | translate }}</h1>
            <p class="page-sub">{{ 'MEMBERSHIPS.SUBTITLE' | translate }}</p>

          </div>
          <p-button *ngIf="isAdmin" [label]="'MEMBERSHIPS.NEW' | translate" icon="pi pi-plus" styleClass="btn-gym-primary" (onClick)="openDialog()" />
        </div>


        <h1 class="page-title gym-header mb-4">{{ 'MEMBERSHIPS.GYM_HEADER' | translate }}</h1>

        <p-table
          [value]="priceListPrograms"
          [loading]="loadingPriceList"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'PROGRAMS.NAME' | translate }}</th>
              <th>{{ 'PROGRAMS.PRICE' | translate }}</th>
              <th *ngIf="isAdmin">{{ 'MEMBERSHIPS.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-p>
            <tr>
              <td>{{ p.naziv }}</td>
              <td>{{ p.cena | number:'1.0-0' }} RSD</td>
              <td *ngIf="isAdmin">
                <div class="flex gap-2">
                  <p-button [label]="'MEMBERSHIPS.EDIT' | translate" icon="pi pi-pencil" size="small" [text]="true" (onClick)="openEditDialog(p)" />
                  <p-button [label]="'COMMON.DELETE' | translate" icon="pi pi-trash" size="small" severity="danger" [text]="true" (onClick)="deleteCenovnik(p)" />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="isAdmin ? 3 : 2" class="text-center p-4" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.EMPTY' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>

        <div *ngIf="isAdmin" class="flex justify-content-end mt-6 mb-3">
          <p-button [label]="'PROGRAMS.ADD_PROGRAM' | translate" icon="pi pi-plus" styleClass="btn-gym-primary" (onClick)="openAddProgramDialog()" />
        </div>

        <h1 class="page-title gym-header mb-3">{{ 'MEMBERSHIPS.GYM_PROGRAM_HEADER' | translate }}</h1>
        <p-table
          [value]="gymProgramRows"
          [loading]="loadingGymPrograms"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              
              <th>{{ 'PROGRAMS.NAME' | translate }}</th>
              <th>{{ 'PROGRAMS.DESCRIPTION' | translate }}</th>
              <th>{{ 'PROGRAMS.PRICE' | translate }}</th>
              <th *ngIf="isAdmin">{{ 'MEMBERSHIPS.ACTIONS' | translate }}</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-c>
            <tr>
              
              <td>{{ rowNaziv(c) }}</td>
              <td>{{ rowOpis(c) }}</td>
              <td>{{ rowCena(c) }}</td>
              <td *ngIf="isAdmin">
                <div class="flex gap-2">
                  <p-button [label]="'PROGRAMS.EDIT' | translate" icon="pi pi-pencil" size="small" [text]="true" (onClick)="openProgramEditDialog(c)" />
                  <p-button [label]="'COMMON.DELETE' | translate" icon="pi pi-trash" size="small" severity="danger" [text]="true" (onClick)="deleteProgramRow(c)" />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="isAdmin ? 4 : 3" class="text-center p-4" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.SYSTEM_EMPTY' | translate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [header]="(editingId ? 'MEMBERSHIPS.EDIT' : 'MEMBERSHIPS.NEW') | translate"
      [modal]="true"
      styleClass="gym-dialog"
      [style]="{width: '450px'}"
    >
      <form [formGroup]="form" class="flex flex-column gap-4 pt-3">
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_NAZIV' | translate }}</label>
          <input pInputText type="text" formControlName="naziv" class="w-full" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_CENA' | translate }}</label>
          <p-inputnumber formControlName="cena" styleClass="w-full" [min]="0" />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" [text]="true" (onClick)="closeDialog()" />
        <p-button [label]="(editingId ? 'COMMON.SAVE' : 'COMMON.CREATE') | translate" icon="pi pi-check" styleClass="btn-gym-primary" [loading]="saving" (onClick)="saveClanarina()" />
      </ng-template>
    </p-dialog>

    <p-dialog
      [(visible)]="programDialogVisible"
      [header]="'PROGRAMS.ADD_PROGRAM' | translate"
      [modal]="true"
      styleClass="gym-dialog"
      [style]="{width: '500px'}"
    >
      <div class="flex flex-column gap-3 pt-2">
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_NAZIV' | translate }}</label>
          <input pInputText type="text" [(ngModel)]="newProgram.naziv" class="w-full" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_OPIS' | translate }}</label>
          <input pInputText type="text" [(ngModel)]="newProgram.opis" class="w-full" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_CENA' | translate }}</label>
          <p-inputnumber [(ngModel)]="newProgram.cena" styleClass="w-full" [min]="0" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_TRAJANJE' | translate }}</label>
          <p-inputnumber [(ngModel)]="newProgram.trajanjeMeseci" styleClass="w-full" [min]="1" />
        </div>

        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.TRAINER' | translate }}</label>
          <p-select
            [(ngModel)]="newProgram.trenerId"
            [options]="trainers"
            optionLabel="fullName"
            optionValue="id"
            [placeholder]="'PROGRAMS.SELECT_TRAINER' | translate"
            [appendTo]="'body'"
            [scrollHeight]="'240px'"
            styleClass="w-full"
          />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" [text]="true" (onClick)="closeAddProgramDialog()" />
        <p-button [label]="'COMMON.SAVE' | translate" icon="pi pi-check" styleClass="btn-gym-primary" [loading]="savingProgram" (onClick)="saveProgram()" />
      </ng-template>
    </p-dialog>

    <p-dialog
      [(visible)]="programEditDialogVisible"
      [header]="'PROGRAMS.EDIT' | translate"
      [modal]="true"
      [styleClass]="programEditClosing ? 'gym-dialog gym-dialog-closing' : 'gym-dialog'"
      [style]="{width: '500px'}"
    >
      <form [formGroup]="programEditForm" class="flex flex-column gap-3 pt-2">
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_NAZIV' | translate }}</label>
          <input pInputText type="text" formControlName="naziv" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_OPIS' | translate }}</label>
          <input pInputText type="text" formControlName="opis" class="w-full" />
        </div>
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.FIELD_CENA' | translate }}</label>
          <p-inputnumber formControlName="cena" styleClass="w-full" [min]="0" />
        </div>
        <div>
          <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'PROGRAMS.TRAINER' | translate }}</label>
          <p-select
            formControlName="trenerId"
            [options]="trainers"
            optionLabel="fullName"
            optionValue="id"
            [placeholder]="'PROGRAMS.SELECT_TRAINER' | translate"
            [appendTo]="'body'"
            [scrollHeight]="'240px'"
            styleClass="w-full"
          />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button [label]="'COMMON.CANCEL' | translate" [text]="true" (onClick)="closeProgramEditDialog()" />
        <p-button [label]="'COMMON.SAVE' | translate" icon="pi pi-check" styleClass="btn-gym-primary" [loading]="savingProgramEdit" (onClick)="saveProgramRowUpdate()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .gym-header { text-align: center; text-transform: lowercase; }
    .page-sub { color: var(--gym-text-muted); margin: 0; }

    :host ::ng-deep .p-dialog-mask {
      animation: gymOverlayFadeIn 180ms ease-out;
    }

    :host ::ng-deep .gym-dialog {
      animation: gymDialogSmoothIn 220ms cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: center;
    }

    :host ::ng-deep .gym-dialog.gym-dialog-closing {
      animation: gymDialogQuickOut 90ms ease-in forwards !important;
    }

    @keyframes gymOverlayFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes gymDialogSmoothIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes gymDialogQuickOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(4px) scale(0.985);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host ::ng-deep .p-dialog-mask,
      :host ::ng-deep .gym-dialog {
        animation: none;
      }
    }
  `]
})
export class ClanarineComponent implements OnInit {
  private clanarineService = inject(ClanarineService);
  private programiService = inject(ProgramiService);
  private korisniciService = inject(KorisniciService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  priceListPrograms: Program[] = [];
  gymProgramRows: any[] = [];
  loadingPriceList = true;
  loadingGymPrograms = true;
  dialogVisible = false;
  saving = false;
  programDialogVisible = false;
  savingProgram = false;
  programEditDialogVisible = false;
  programEditClosing = false;
  savingProgramEdit = false;
  editingId: number | null = null;
  editingProgramRowId: number | null = null;
  readonly isAdmin = this.authService.hasRole('ADMIN');
  trainers: Array<Korisnik & { fullName: string }> = [];
  newProgram = { naziv: '', opis: '', cena: 0, trajanjeMeseci: 1, trenerId: null as number | null };

  form = this.fb.group({
    naziv: ['', [Validators.required]],
    cena: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  programEditForm = this.fb.group({
    naziv: ['', [Validators.required]],
    opis: [''],
    cena: [null as number | null, [Validators.required, Validators.min(0)]],
    trenerId: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadTrainers();
    }

    this.loadPriceListPrograms();
    this.loadGymProgramRows();
  }

  private loadTrainers(): void {
    this.korisniciService.getAllZaposleni().subscribe({
      next: (data) => {
        this.trainers = (data ?? [])
          .filter(k => k.rola === 'TRENER')
          .map(k => ({ ...k, fullName: `${k.ime} ${k.prezime}` }));
      },
      error: () => {
        this.trainers = [];
      }
    });
  }

  private loadPriceListPrograms(): void {
    this.loadingPriceList = true;

    this.clanarineService.getCenovnikPrograms().subscribe({
      next: (data) => {
        this.priceListPrograms = data ?? [];
        this.loadingPriceList = false;
      },
      error: () => {
        this.priceListPrograms = [];
        this.loadingPriceList = false;
      }
    });
  }

  private loadGymProgramRows(): void {
    this.loadingGymPrograms = true;
    // Both admin and non-admin users render rows from programs; admin gets edit/delete actions.
    this.programiService.getAll().subscribe({
      next: (data) => {
        this.gymProgramRows = (data ?? []).map((p) => ({ program: p }));
        this.loadingGymPrograms = false;
      },
      error: () => {
        this.gymProgramRows = [];
        this.loadingGymPrograms = false;
      }
    });
  }

  openDialog(): void {
    this.editingId = null;
    this.form.reset();
    this.dialogVisible = true;
  }

  openEditDialog(program: Program): void {
    this.editingId = program.id;
    this.form.patchValue({
      naziv: program.naziv,
      cena: program.cena
    });
    this.dialogVisible = true;
  }

  closeDialog(): void {
    this.dialogVisible = false;
    this.editingId = null;
  }

  saveClanarina(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const raw = this.form.value;
    const naziv = String(raw.naziv ?? '').trim();
    const cena = Number(raw.cena);

    if (!naziv || !Number.isFinite(cena)) {
      this.saving = false;
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('COMMON.ERROR'),
        detail: this.translate.instant('MEMBERSHIPS.CREATE_FAILED')
      });
      return;
    }

    const payload = {
      naziv,
      cena
    };

    const isEditMode = this.editingId != null;

    const request$ = isEditMode
      ? this.clanarineService.updateCenovnik(this.editingId!, payload)
      : this.clanarineService.createCenovnik(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeDialog();
        this.loadPriceListPrograms();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant(isEditMode ? 'MEMBERSHIPS.UPDATED' : 'MEMBERSHIPS.CREATED')
        });
      },
      error: (err) => {
        const backendDetail = this.extractErrorMessage(err);
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: backendDetail || this.translate.instant(isEditMode ? 'MEMBERSHIPS.UPDATE_FAILED' : 'MEMBERSHIPS.CREATE_FAILED')
        });
      }
    });
  }

  deleteCenovnik(program: Program): void {
    if (!this.isAdmin || !program?.id) return;

    const confirmed = window.confirm(
      this.translate.instant('MEMBERSHIPS.DELETE_Q', { name: program.naziv })
    );
    if (!confirmed) return;

    this.clanarineService.deleteCenovnik(program.id).subscribe({
      next: () => {
        this.loadPriceListPrograms();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('MEMBERSHIPS.DELETED')
        });
      },
      error: (err) => {
        const backendDetail = this.extractErrorMessage(err);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: backendDetail || this.translate.instant('MEMBERSHIPS.DELETE_FAILED')
        });
      }
    });
  }

  openAddProgramDialog(): void {
    this.newProgram = { naziv: '', opis: '', cena: 0, trajanjeMeseci: 1, trenerId: null };
    this.programDialogVisible = true;
  }

  closeAddProgramDialog(): void {
    this.programDialogVisible = false;
  }

  saveProgram(): void {
    if (!this.newProgram.naziv.trim() || !this.newProgram.trenerId) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('COMMON.ERROR'),
        detail: this.translate.instant('PROGRAMS.SELECT_TRAINER')
      });
      return;
    }

    this.savingProgram = true;
    const payload = {
      naziv: this.newProgram.naziv,
      opis: this.newProgram.opis,
      cena: this.newProgram.cena,
      trajanjeMeseci: this.newProgram.trajanjeMeseci,
      trener: { id: this.newProgram.trenerId }
    };

    this.programiService.create(payload).subscribe({
      next: () => {
        this.savingProgram = false;
        this.closeAddProgramDialog();
        this.loadGymProgramRows();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('PROGRAMS.ADD_SUCCESS')
        });
      },
      error: (err) => {
        const backendDetail = this.extractErrorMessage(err);
        this.savingProgram = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: backendDetail || this.translate.instant('PROGRAMS.OP_FAILED')
        });
      }
    });
  }

  openProgramEditDialog(row: any): void {
    if (!this.isAdmin) return;
    const program = this.programFromRow(row);
    if (!program?.id) return;

    this.editingProgramRowId = Number(program.id);
    this.programEditForm.patchValue({
      naziv: String(program.naziv ?? ''),
      opis: String(program.opis ?? ''),
      cena: Number(program.cena ?? 0),
      trenerId: Number(program.trener?.id ?? 0) || null
    });
    this.programEditDialogVisible = true;
  }

  closeProgramEditDialog(): void {
    this.programEditClosing = false;
    this.programEditDialogVisible = false;
    this.editingProgramRowId = null;
  }

  private closeProgramEditDialogWithFade(): void {
    this.programEditClosing = true;
    setTimeout(() => {
      this.programEditDialogVisible = false;
      this.programEditClosing = false;
      this.editingProgramRowId = null;
    }, 90);
  }

  saveProgramRowUpdate(): void {
    if (!this.editingProgramRowId || this.programEditForm.invalid) return;

    const naziv = String(this.programEditForm.value.naziv ?? '').trim();
    const opis = String(this.programEditForm.value.opis ?? '').trim();
    const cena = Number(this.programEditForm.value.cena ?? 0);
    const trenerId = Number(this.programEditForm.value.trenerId ?? 0);

    if (!naziv || !Number.isFinite(cena) || !Number.isFinite(trenerId) || trenerId <= 0) return;

    this.savingProgramEdit = true;
    this.programiService.update(this.editingProgramRowId, {
      naziv,
      opis,
      cena,
      trener: { id: trenerId }
    }).subscribe({
      next: () => {
        this.savingProgramEdit = false;
        this.closeProgramEditDialogWithFade();
        this.loadPriceListPrograms();
        this.loadGymProgramRows();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('PROGRAMS.UPDATED')
        });
      },
      error: (err) => {
        const backendDetail = this.extractErrorMessage(err);
        this.savingProgramEdit = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: backendDetail || this.translate.instant('PROGRAMS.OP_FAILED')
        });
      }
    });
  }

  deleteProgramRow(row: any): void {
    if (!this.isAdmin) return;
    const program = this.programFromRow(row);
    if (!program?.id) return;

    const confirmed = window.confirm(this.translate.instant('PROGRAMS.DELETE_Q', { name: String(program.naziv ?? '') }));
    if (!confirmed) return;

    this.programiService.delete(Number(program.id)).subscribe({
      next: () => {
        this.loadPriceListPrograms();
        this.loadGymProgramRows();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('PROGRAMS.DELETED')
        });
      },
      error: (err) => {
        const backendDetail = this.extractErrorMessage(err);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: backendDetail || this.translate.instant('PROGRAMS.DELETE_FAILED')
        });
      }
    });
  }

  private extractErrorMessage(err: any): string {
    const status = err?.status ? `[${err.status}] ` : '';
    const raw = err?.error;
    if (typeof raw === 'string' && raw.trim()) return `${status}${raw}`;
    if (typeof raw?.message === 'string' && raw.message.trim()) return `${status}${raw.message}`;
    if (typeof raw?.error === 'string' && raw.error.trim()) return `${status}${raw.error}`;
    if (Array.isArray(raw?.errors) && raw.errors.length > 0) {
      return `${status}${String(raw.errors[0])}`;
    }
    return '';
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
