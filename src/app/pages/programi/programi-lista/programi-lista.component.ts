import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ProgramiService } from '../../../core/services/programi.service';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { AuthService } from '../../../core/services/auth.service';
import { Program } from '../../../core/models/program.model';
import { Korisnik } from '../../../core/models/korisnik.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-programi-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, DialogModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">
        <div class="mb-5">
          <h1 class="page-title">{{ 'PROGRAMS.TITLE' | translate }}</h1>
          <p class="page-sub">{{ 'PROGRAMS.SUBTITLE' | translate }}</p>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <i class="pi pi-spin pi-spinner text-4xl" style="color: var(--gym-gold)"></i>
        </div>

        <!-- Nedeljni raspored -->
        <div *ngIf="!loading && schedule.length" class="mt-6">
          <div class="schedule-header">
            <div>
              <h2 class="section-title mb-1">{{ 'PROGRAMS.SCHEDULE_TITLE' | translate }}</h2>
              <p class="page-sub mb-4">{{ 'PROGRAMS.SCHEDULE_SUBTITLE' | translate }}</p>
            </div>
            <button *ngIf="isAdmin" class="add-btn" (click)="openAddDialog()">
              <i class="pi pi-plus"></i> {{ 'PROGRAMS.ADD_PROGRAM' | translate }}
            </button>
          </div>
          <div class="schedule-wrapper">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th class="time-col">{{ 'PROGRAMS.TIME' | translate }}</th>
                  <th *ngFor="let day of days">{{ day | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of schedule; let ti = index">
                  <td class="time-cell">{{ times[ti] }}</td>
                  <td *ngFor="let cell of row" class="prog-cell">
                    <div *ngIf="cell" class="schedule-pill" [style.background]="getProgramColor(cell.program)">
                      <span class="pill-name"><i class="pi pi-clock pill-icon"></i>{{ cell.program.naziv }}</span>
                      <span class="pill-desc">{{ cell.desc }}</span>
                      <span *ngIf="cell.extra" class="pill-desc">{{ cell.extra }}</span>
                      <span *ngIf="cell.program.trener" class="pill-trainer">{{ cell.program.trener.ime }} {{ cell.program.trener.prezime }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Treneri -->
        <div *ngIf="!loading" class="mt-6">
          <h2 class="section-title mb-1">{{ 'PROGRAMS.TRAINERS_TITLE' | translate }}</h2>
          <p class="page-sub mb-4">{{ 'PROGRAMS.TRAINERS_SUBTITLE' | translate }}</p>

          <div *ngIf="trainers.length === 0" class="text-center py-4">
            <i class="pi pi-users text-4xl mb-3" style="color: var(--gym-text-muted); display:block"></i>
            <span style="color: var(--gym-text-muted)">{{ 'PROGRAMS.TRAINERS_EMPTY' | translate }}</span>
          </div>

          <div class="trainers-grid">
            <div *ngFor="let t of trainers" class="trainer-card">
              <div class="trainer-avatar">
                <i class="pi pi-user" style="font-size:1.6rem;color:#000"></i>
              </div>
              <div class="trainer-info">
                <span class="trainer-name">{{ t.ime }} {{ t.prezime }}</span>
                <span class="trainer-desc">{{ trainerDescMap[t.email] || 'Sertifikovani fitnes trener.' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Dialog: Dodaj program (samo ADMIN) -->
    <p-dialog
      [(visible)]="showAddDialog"
      [modal]="true"
      [closable]="true"
      [style]="{width:'480px'}"
      [header]="'PROGRAMS.ADD_PROGRAM' | translate">
      <div class="dialog-form">
        <div class="form-field">
          <label>{{ 'PROGRAMS.FIELD_NAZIV' | translate }}</label>
          <input type="text" [(ngModel)]="newProgram.naziv" class="gym-input" />
        </div>
        <div class="form-field">
          <label>{{ 'PROGRAMS.FIELD_OPIS' | translate }}</label>
          <textarea [(ngModel)]="newProgram.opis" class="gym-input" rows="3"></textarea>
        </div>
        <div class="form-field">
          <label>{{ 'PROGRAMS.FIELD_CENA' | translate }}</label>
          <input type="number" [(ngModel)]="newProgram.cena" class="gym-input" min="0" />
        </div>
        <div class="form-field">
          <label>{{ 'PROGRAMS.FIELD_TRAJANJE' | translate }}</label>
          <input type="number" [(ngModel)]="newProgram.trajanjeMeseci" class="gym-input" min="1" />
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" (click)="showAddDialog = false">{{ 'COMMON.CANCEL' | translate }}</button>
          <button class="save-btn" (click)="saveProgram()" [disabled]="saving">
            <i *ngIf="saving" class="pi pi-spin pi-spinner"></i>
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </div>
    </p-dialog>

  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .page-sub { color: var(--gym-text-muted); margin: 0; }
    .section-title { font-family: 'Bebas Neue', cursive; font-size: 1.8rem; color: var(--gym-gold); letter-spacing: 2px; margin: 0; }
    .mt-6 { margin-top: 2.5rem; }
    .schedule-wrapper { overflow-x: auto; border: 1px solid var(--gym-border); border-radius: 8px; }
    .schedule-table { border-collapse: collapse; width: 100%; min-width: 700px; }
    .schedule-table thead tr { border-bottom: 2px solid var(--gym-gold); }
    .schedule-table th { color: var(--gym-gold); font-family: 'Bebas Neue', cursive; letter-spacing: 1px; padding: 0.75rem 0.5rem; text-align: center; font-size: 0.95rem; background: #111; }
    .schedule-table .time-col { text-align: left; padding-left: 1rem; }
    .schedule-table tbody tr { border-bottom: 1px solid var(--gym-border); transition: background 0.2s; }
    .schedule-table tbody tr:hover { background: #181818; }
    .time-cell { color: var(--gym-gold); font-size: 0.85rem; font-weight: 700; padding: 0.7rem 0.5rem 0.7rem 1rem; white-space: nowrap; background: #0d0d0d; }
    .prog-cell { padding: 0.35rem 0.3rem; vertical-align: middle; min-width: 110px; }
    .schedule-pill { border-radius: 6px; padding: 0.45rem 0.6rem; display: flex; flex-direction: column; gap: 0.1rem; opacity: 0.92; transition: opacity 0.2s, transform 0.15s; cursor: default; }
    .schedule-pill:hover { opacity: 1; transform: scale(1.03); }
    .pill-name { font-size: 1rem; font-weight: 700; color: #000; line-height: 1.3; display: flex; align-items: center; gap: 0.25rem; }
    .pill-icon { font-size: 0.85rem; flex-shrink: 0; }
    .pill-desc { font-size: 0.82rem; color: #000; font-style: normal; line-height: 1.2; font-weight: 400; }
    .pill-trainer { font-size: 0.6rem; color: rgba(0,0,0,0.55); }
    .trainers-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .trainer-card { background: var(--gym-card-bg); border: 1px solid var(--gym-border); border-radius: 10px; padding: 1.2rem 1rem; display: flex; align-items: center; gap: 1rem; transition: border-color 0.25s; }
    .trainer-card:hover { border-color: var(--gym-gold); }
    .trainer-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--gym-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .trainer-info { display: flex; flex-direction: column; gap: 0.25rem; overflow: hidden; }
    .trainer-name { font-family: 'Bebas Neue', cursive; font-size: 1rem; color: #fff; letter-spacing: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .trainer-desc { font-size: 0.8rem; color: var(--gym-text-muted); line-height: 1.4; }
    .schedule-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
    .add-btn { background: var(--gym-gold); color: #000; border: none; border-radius: 6px; padding: 0.55rem 1.1rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: opacity 0.2s; }
    .add-btn:hover { opacity: 0.85; }
    .dialog-form { display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0; }
    .form-field { display: flex; flex-direction: column; gap: 0.3rem; }
    .form-field label { font-size: 0.85rem; color: var(--gym-text-muted); }
    .gym-input { background: #1a1a1a; border: 1px solid var(--gym-border); border-radius: 6px; color: #fff; padding: 0.5rem 0.75rem; font-size: 0.95rem; width: 100%; box-sizing: border-box; outline: none; }
    .gym-input:focus { border-color: var(--gym-gold); }
    textarea.gym-input { resize: vertical; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
    .cancel-btn { background: transparent; border: 1px solid var(--gym-border); color: var(--gym-text-muted); border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer; }
    .save-btn { background: var(--gym-gold); color: #000; border: none; border-radius: 6px; padding: 0.5rem 1.2rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }
    .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class ProgramiListaComponent implements OnInit {
  private programiService = inject(ProgramiService);
  private korisniciService = inject(KorisniciService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  private authService = inject(AuthService);

  readonly isAdmin = this.authService.userRole() === 'ADMIN';

  programs: Program[] = [];
  trainers: Korisnik[] = [];
  loading = true;
  showAddDialog = false;
  saving = false;
  newProgram = { naziv: '', opis: '', cena: 0, trajanjeMeseci: 1 };

  readonly times = ['08:30', '09:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00'];
  readonly days = [
    'PROGRAMS.DAY_MON', 'PROGRAMS.DAY_TUE', 'PROGRAMS.DAY_WED',
    'PROGRAMS.DAY_THU', 'PROGRAMS.DAY_FRI', 'PROGRAMS.DAY_SAT', 'PROGRAMS.DAY_SUN'
  ];
  schedule: ({ program: Program; desc: string; extra?: string } | null)[][] = [];

  private readonly programColors = ['#d4a017', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#1abc9c'];

  readonly trainerDescMap: Record<string, string> = {
    'nemanja@yahoo.com': 'MMA, JIU-JITSU',
    'sava@yahoo.com': 'MMA, STRIKING',
    'gile.az09@gmail.com': 'MMA, RVANJE',
    'ivanak.az09@gmail.com': 'PILATES, HTK',
    'marijanas.yahoo@com': 'PILATES',
    'ivan.az09@gmail.com': 'HTK',
    'sanja.az09@gmail.com': 'HTK, CROSSFIT',
    'ashelk.az09@gmail.com': 'CROSSFIT',
  };

  private readonly programRoomMap: Record<string, string> = {
    'Pilates': '(FITNES SALA)',
    'HTK': '(OCTAGON ROOM)',
    'CrossFit': '(CROSSFIT SALA)',
  };

  // [programIdx, desc, extra?] | null — 10 slots x 7 days
  private readonly scheduleMap: ([number, string, string?] | null)[][] = [
    // 08:30
    [[0,'JIU-JITSU', '(OCTAGON ROOM)'], null, [1,'(FITNES SALA)'], null, [2,'(CROSSFIT SALA)'], [3,'(OCTAGON ROOM)'], null],
    // 09:00
    [null, [1,'(FITNES SALA)'], null, [0,'GRAPPLING', '(OCTAGON ROOM)'], null, [2,'(CROSSFIT SALA)'], [3,'(OCTAGON ROOM)']],
    // 09:30
    [[2,'(CROSSFIT SALA)'], null, [0,'MMA STRIKING', '(OCTAGON ROOM)'], null, [1,'(FITNES SALA)'], null, null],
    // 11:00
    [null, [3,'(OCTAGON ROOM)'], null, [0,'BOX', '(OCTAGON ROOM)'], [1,'(FITNES SALA)'], null],
    // 12:30
    [[1,'(FITNES SALA)'], null, null, [3,'(OCTAGON ROOM)'], null, [0,'SPARING', '(OCTAGON ROOM)'], [2,'(CROSSFIT SALA)']],
    // 14:00
    [null, [0,'RVANJE', '(OCTAGON ROOM)'], [3,'(OCTAGON ROOM)'], [1,'(FITNES SALA)'], null, null, [3,'(OCTAGON ROOM)']],
    // 15:30
    [[3,'(OCTAGON ROOM)'], [2,'(CROSSFIT SALA)'], null, [0,'GRAPPLING', '(OCTAGON ROOM)'], [3,'(OCTAGON ROOM)'], [1,'(FITNES SALA)'], null],
    // 17:00
    [[0,'STRIKING', '(OCTAGON ROOM)'], null, [2,'(CROSSFIT SALA)'], null, [1,'(FITNES SALA)'], null, [2,'(CROSSFIT SALA)']],
    // 18:30
    [null, [3,'(OCTAGON ROOM)'], [0,'RVANJE', '(OCTAGON ROOM)'], [2,'(CROSSFIT SALA)'], null, [3,'(OCTAGON ROOM)'], [1,'(FITNES SALA)']],
    // 20:00
    [[2,'(CROSSFIT SALA)'], null, [1,'(FITNES SALA)'], [3,'(OCTAGON ROOM)'], null, null]
  ];

  ngOnInit(): void {
    this.loadPrograms();
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.korisniciService.getAllZaposleni().subscribe({
      next: (data) => { this.trainers = data.filter(k => k.rola === 'TRENER'); },
      error: () => { this.trainers = []; }
    });
  }

  loadPrograms(): void {
    this.loading = true;
    this.programiService.getAll().subscribe({
      next: (data) => { this.programs = data; this.loading = false; this.buildSchedule(); },
      error: (err) => {
        this.loading = false;

        let detail = this.translate.instant('PROGRAMS.OP_FAILED');
        if (err?.status === 401) {
          detail = this.translate.instant('PROGRAMS.LOAD_UNAUTHORIZED');
        } else if (err?.status === 403) {
          detail = this.translate.instant('PROGRAMS.LOAD_FORBIDDEN');
        }

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail
        });
      }
    });
  }

  buildSchedule(): void {
    if (this.programs.length === 0) {
      this.schedule = this.scheduleMap.map(row => row.map(() => null));
      return;
    }
    this.schedule = this.scheduleMap.map(row =>
      row.map(cell => cell !== null
        ? { program: this.programs[cell[0] % this.programs.length], desc: cell[1], extra: cell[2] }
        : null
      )
    );
  }

  getProgramColor(p: Program): string {
    const idx = this.programs.indexOf(p);
    return this.programColors[idx % this.programColors.length];
  }

  openAddDialog(): void {
    this.newProgram = { naziv: '', opis: '', cena: 0, trajanjeMeseci: 1 };
    this.showAddDialog = true;
  }

  saveProgram(): void {
    if (!this.newProgram.naziv.trim()) return;
    this.saving = true;
    this.programiService.create(this.newProgram).subscribe({
      next: (p) => {
        this.programs = [...this.programs, p];
        this.buildSchedule();
        this.showAddDialog = false;
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('PROGRAMS.ADD_SUCCESS')
        });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('PROGRAMS.OP_FAILED')
        });
      }
    });
  }
}
