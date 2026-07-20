import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ProgramiService } from '../../../core/services/programi.service';
import { ClanarineService } from '../../../core/services/clanarine.service';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { Program } from '../../../core/models/program.model';
import { Korisnik } from '../../../core/models/korisnik.model';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-programi-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
          <div>
            <h2 class="section-title mb-1">{{ 'PROGRAMS.SCHEDULE_TITLE' | translate }}</h2>
            <p class="page-sub mb-4">{{ 'PROGRAMS.SCHEDULE_SUBTITLE' | translate }}</p>
          </div>
          <div class="schedule-wrapper">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th class="time-col">{{ 'PROGRAMS.TIME' | translate }}</th>
                  <th *ngFor="let day of days; let di = index" [class.current-day-head]="di === currentDayIndex">{{ day | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of schedule; let ti = index">
                  <td class="time-cell">{{ times[ti] }}</td>
                  <td *ngFor="let cell of row; let di = index" class="prog-cell" [class.current-day-cell]="di === currentDayIndex">
                    <div *ngIf="cell" class="schedule-pill" [class.schedule-pill-active]="isActiveSlot(ti, di)" [style.background]="getProgramColor(cell.program)">
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
    .schedule-table th.current-day-head {
      color: #000;
      background: linear-gradient(180deg, var(--gym-gold), #e7bb4e);
      box-shadow: inset 0 -2px 0 rgba(0,0,0,0.22), 0 0 14px rgba(212, 160, 23, 0.28);
      animation: currentDayHeadPulse 1700ms ease-in-out infinite;
    }
    .schedule-table tbody tr { border-bottom: 1px solid var(--gym-border); transition: background 0.2s; }
    .schedule-table tbody tr:hover { background: #181818; }
    .time-cell { color: var(--gym-gold); font-size: 0.85rem; font-weight: 700; padding: 0.7rem 0.5rem 0.7rem 1rem; white-space: nowrap; background: #0d0d0d; }
    .prog-cell { padding: 0.35rem 0.3rem; vertical-align: middle; min-width: 110px; }
    .prog-cell.current-day-cell { background: rgba(212, 160, 23, 0.05); }
    .schedule-pill { border-radius: 6px; padding: 0.45rem 0.6rem; display: flex; flex-direction: column; gap: 0.1rem; opacity: 0.92; transition: opacity 0.2s, transform 0.15s; cursor: default; }
    .schedule-pill:hover { opacity: 1; transform: scale(1.03); }
    .schedule-pill-active {
      animation: currentSlotPulse 1600ms ease-in-out infinite;
      box-shadow: 0 0 0 0 rgba(212, 160, 23, 0.45);
      opacity: 1;
    }
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

    @keyframes currentSlotPulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(212, 160, 23, 0.34);
      }
      50% {
        transform: scale(1.03);
        box-shadow: 0 0 0 8px rgba(212, 160, 23, 0.08);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(212, 160, 23, 0);
      }
    }

    @keyframes currentDayHeadPulse {
      0% { filter: brightness(1); }
      50% { filter: brightness(1.08); }
      100% { filter: brightness(1); }
    }

    @media (prefers-reduced-motion: reduce) {
      .schedule-table th.current-day-head {
        animation: none;
      }
      .schedule-pill-active {
        animation: none;
        box-shadow: 0 0 0 2px rgba(212, 160, 23, 0.45);
      }
    }
  `]
})
export class ProgramiListaComponent implements OnInit, OnDestroy {
  private programiService = inject(ProgramiService);
  private clanarineService = inject(ClanarineService);
  private korisniciService = inject(KorisniciService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  programs: Program[] = [];
  trainers: Korisnik[] = [];
  loading = true;

  readonly times = ['08:30', '09:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00'];
  readonly days = [
    'PROGRAMS.DAY_MON', 'PROGRAMS.DAY_TUE', 'PROGRAMS.DAY_WED',
    'PROGRAMS.DAY_THU', 'PROGRAMS.DAY_FRI', 'PROGRAMS.DAY_SAT', 'PROGRAMS.DAY_SUN'
  ];
  schedule: ({ program: Program; desc: string; extra?: string } | null)[][] = [];
  currentDayIndex = -1;
  currentMinutes = 0;
  private clockTimer: ReturnType<typeof setInterval> | null = null;

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
    this.updateCurrentTimeContext();
    this.clockTimer = setInterval(() => this.updateCurrentTimeContext(), 30000);

    this.loadPrograms();
    this.loadTrainers();
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
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
      next: (programs) => {
        this.programs = programs;
        this.loading = false;
        this.buildSchedule();
      },
      error: (err) => {
        this.loading = false;
        let detail = this.translate.instant('PROGRAMS.OP_FAILED');
        if (err?.status === 401) detail = this.translate.instant('PROGRAMS.LOAD_UNAUTHORIZED');
        if (err?.status === 403) detail = this.translate.instant('PROGRAMS.LOAD_FORBIDDEN');

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

  isActiveSlot(timeIndex: number, dayIndex: number): boolean {
    if (dayIndex !== this.currentDayIndex) return false;

    const currentSlotStart = this.parseTimeToMinutes(this.times[timeIndex]);
    const nextSlotStart = timeIndex < this.times.length - 1
      ? this.parseTimeToMinutes(this.times[timeIndex + 1])
      : 24 * 60;

    return this.currentMinutes >= currentSlotStart && this.currentMinutes < nextSlotStart;
  }

  private updateCurrentTimeContext(): void {
    const now = new Date();
    this.currentMinutes = now.getHours() * 60 + now.getMinutes();

    // JS: Sunday=0 ... Saturday=6 -> convert to Monday-first index (Mon=0 ... Sun=6)
    const jsDay = now.getDay();
    this.currentDayIndex = (jsDay + 6) % 7;
  }

  private parseTimeToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  }
}
