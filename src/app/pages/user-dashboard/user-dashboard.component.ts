import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Card } from 'primeng/card';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { ClanarineService } from '../../core/services/clanarine.service';
import { ProgramUplateService } from '../../core/services/program-uplate.service';
import { ObrociService } from '../../core/services/obroci.service';
import { Clanarina } from '../../core/models/clanarina.model';
import { ProgramUplata } from '../../core/models/program-uplata.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Namirnica {
  id: number;
  naziv: string;
  kcal: number;
  kolicina: string;
  kategorija: string;
}

interface ExpiringItem {
  tip: 'clanarina' | 'program';
  naziv: string;
  tipLabel: string;
  datumIsteka: string;
  daysUntil: number;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, InputNumber, InputText, Select, DatePicker, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-7xl mx-auto">

        <!-- Dobrodošlica -->
        <div class="dashboard-welcome flex align-items-center gap-3 mb-5">
          <i class="pi pi-bolt text-4xl" style="color: var(--gym-gold)"></i>
          <div>
            <h1 class="dash-title">MOJ DASHBOARD</h1>
            <p class="dash-sub">Dobrodošao, {{ username() }}! 👋</p>
          </div>
        </div>

        <!-- Loading -->
        <div class="expiring-section mb-5" *ngIf="loadingExpiring">
          <div class="expiring-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Učitavanje...</span>
          </div>
        </div>

        <!-- Uskoro ističe -->
        <div class="expiring-section mb-5" [class.has-items]="expiringItems.length > 0" *ngIf="!loadingExpiring">
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
          <div class="expiring-empty" *ngIf="expiringItems.length === 0">
            <i class="pi pi-check-circle text-green"></i>
            <span>{{ 'DASHBOARD.NO_EXPIRING' | translate }}</span>
          </div>
        </div>

        <!-- Harmonija kalkulatora: grid kartica -->
        <div class="calc-harmony-grid mb-5">
          <!-- BMI kalkulator -->
          <div class="calc-harmony-card" [class.active]="activeCalculator === 'bmi'" (click)="toggleCalculator('bmi')">
            <div class="harmony-icon"><i class="pi pi-calculator"></i></div>
            <div class="harmony-info">
              <span class="harmony-title">Kalkulator težine (BMI)</span>
              <span class="harmony-desc">Izračunaj svoj BMI indeks</span>
            </div>
            <i class="harmony-chevron" [class.open]="activeCalculator === 'bmi'">&#9660;</i>
          </div>

          <!-- Napredni kalkulator -->
          <div class="calc-harmony-card" [class.active]="activeCalculator === 'napredni'" (click)="toggleCalculator('napredni')">
            <div class="harmony-icon"><i class="pi pi-chart-line"></i></div>
            <div class="harmony-info">
              <span class="harmony-title">Kalkulator telesne masti i kalorija</span>
              <span class="harmony-desc">BMR, TDEE, telesna mast i ciljevi</span>
            </div>
            <i class="harmony-chevron" [class.open]="activeCalculator === 'napredni'">&#9660;</i>
          </div>

          <!-- Kalorijski dnevnik -->
          <div class="calc-harmony-card" [class.active]="activeCalculator === 'kalorijski'" (click)="toggleCalculator('kalorijski')">
            <div class="harmony-icon"><i class="pi pi-apple"></i></div>
            <div class="harmony-info">
              <span class="harmony-title">Kalorijski dnevnik</span>
              <span class="harmony-desc">Prati dnevni unos hrane</span>
            </div>
            <i class="harmony-chevron" [class.open]="activeCalculator === 'kalorijski'">&#9660;</i>
          </div>
        </div>

        <!-- Expandovani kalkulatori -->
        <div class="expanded-calculator">
          <!-- BMI Kalkulator -->
          <div class="grid mb-5" *ngIf="activeCalculator === 'bmi'">
            <div class="col-12">
              <p-card styleClass="calc-card">
                <div class="calc-header">
                  <i class="pi pi-calculator text-2xl"></i>
                  <h3 class="calc-title">Kalkulator težine (BMI)</h3>
                </div>
                <div class="calc-body">
                  <div class="grid">
                    <div class="col-12 sm:col-6">
                      <label class="calc-label">Težina (kg)</label>
                      <p-inputNumber
                        [(ngModel)]="tezina"
                        [min]="20"
                        [max]="350"
                        [step]="0.1"
                        [showButtons]="true"
                        mode="decimal"
                        [minFractionDigits]="1"
                        [maxFractionDigits]="1"
                        styleClass="w-full"
                        inputStyleClass="w-full"
                        placeholder="npr. 75.0"
                      />
                    </div>
                    <div class="col-12 sm:col-6">
                      <label class="calc-label">Visina (cm)</label>
                      <p-inputNumber
                        [(ngModel)]="visina"
                        [min]="50"
                        [max]="300"
                        [step]="1"
                        [showButtons]="true"
                        styleClass="w-full"
                        inputStyleClass="w-full"
                        placeholder="npr. 180"
                      />
                    </div>
                  </div>

                  <div *ngIf="bmi > 0" class="bmi-result mt-4">
                    <div class="bmi-value text-center">
                      <span class="bmi-number">{{ bmi }}</span>
                      <span class="bmi-label">BMI</span>
                    </div>

                    <!-- Meter -->
                    <div class="bmi-meter-wrapper mt-3">
                      <div class="bmi-meter">
                        <div class="meter-bar">
                          <div class="meter-segment segment-red" style="left: 0%; width: 46.25%;"></div>
                          <div class="meter-segment segment-green" style="left: 46.25%; width: 16.25%;"></div>
                          <div class="meter-segment segment-yellow" style="left: 62.5%; width: 12.5%;"></div>
                          <div class="meter-segment segment-red-dark" style="left: 75%; width: 25%;"></div>
                        </div>
                        <div class="meter-indicator" [style.left]="bmiPosition"></div>
                      </div>
                      <div class="meter-labels">
                        <span>Pothranjen</span>
                        <span>Normalan</span>
                        <span>Prekomerno</span>
                        <span>Gojazan</span>
                      </div>
                    </div>

                    <!-- Kategorija -->
                    <div class="bmi-category text-center mt-3" [style.color]="bmiColor">
                      <i [class]="bmiIcon" style="font-size: 1.5rem;"></i>
                      <span class="category-text">{{ bmiKategorija }}</span>
                    </div>
                  </div>
                </div>
              </p-card>
            </div>
          </div>

          <!-- Napredni kalkulator -->
          <div class="grid mb-5" *ngIf="activeCalculator === 'napredni'">
            <div class="col-12">
              <p-card styleClass="calc-card">
                <div class="calc-header">
                  <i class="pi pi-chart-line text-2xl"></i>
                  <h3 class="calc-title">Kalkulator telesne masti i kalorija</h3>
                </div>
                <div class="calc-body">
                  <div class="grid">
                    <div class="col-12 sm:col-6 md:col-3">
                      <label class="calc-label">Težina (kg)</label>
                      <p-inputNumber
                        [(ngModel)]="naprednaTezina"
                        [min]="20" [max]="350" [step]="0.1"
                        [showButtons]="true" mode="decimal"
                        [minFractionDigits]="1" [maxFractionDigits]="1"
                        styleClass="w-full" inputStyleClass="w-full"
                        placeholder="75.0"
                      />
                    </div>
                    <div class="col-12 sm:col-6 md:col-3">
                      <label class="calc-label">Visina (cm)</label>
                      <p-inputNumber
                        [(ngModel)]="naprednaVisina"
                        [min]="50" [max]="300" [step]="1"
                        [showButtons]="true"
                        styleClass="w-full" inputStyleClass="w-full"
                        placeholder="180"
                      />
                    </div>
                    <div class="col-12 sm:col-6 md:col-3">
                      <label class="calc-label">Godine</label>
                      <p-inputNumber
                        [(ngModel)]="godine"
                        [min]="10" [max]="120" [step]="1"
                        [showButtons]="true"
                        styleClass="w-full" inputStyleClass="w-full"
                        placeholder="30"
                      />
                    </div>
                    <div class="col-12 sm:col-6 md:col-3">
                      <label class="calc-label">Pol</label>
                      <p-select
                        [options]="polOpcije"
                        [(ngModel)]="pol"
                        placeholder="Izaberi pol"
                        styleClass="w-full"
                      />
                    </div>
                  </div>

                  <div class="grid mt-3">
                    <div class="col-12 sm:col-6 md:col-4">
                      <label class="calc-label">Nivo aktivnosti</label>
                      <p-select
                        [options]="aktivnostOpcije"
                        [(ngModel)]="nivoAktivnosti"
                        optionLabel="label"
                        placeholder="Izaberi nivo aktivnosti"
                        styleClass="w-full"
                      />
                    </div>
                    <div class="col-12 sm:col-6 md:col-4">
                      <label class="calc-label">Cilj</label>
                      <p-select
                        [options]="ciljOpcije"
                        [(ngModel)]="cilj"
                        optionLabel="label"
                        placeholder="Izaberi cilj"
                        styleClass="w-full"
                      />
                    </div>
                  </div>

                  <!-- Rezultati -->
                  <div *ngIf="mozeRacunati" class="napredni-rezultati mt-4">
                    <div class="grid">
                      <!-- Telesna mast -->
                      <div class="col-12 sm:col-6 md:col-3">
                        <div class="result-card">
                          <div class="result-icon"><i class="pi pi-chart-pie"></i></div>
                          <div class="result-value">{{ telesnaMast }}<span class="result-unit">%</span></div>
                          <div class="result-label">Telesna mast</div>
                          <div class="result-status" [style.color]="mastBoja">{{ mastKategorija }}</div>
                        </div>
                      </div>
                      <!-- BMR -->
                      <div class="col-12 sm:col-6 md:col-3">
                        <div class="result-card">
                          <div class="result-icon"><i class="pi pi-fire"></i></div>
                          <div class="result-value">{{ bmr }} <span class="result-unit">kcal</span></div>
                          <div class="result-label">BMR (bazalni metabolizam)</div>
                        </div>
                      </div>
                      <!-- TDEE -->
                      <div class="col-12 sm:col-6 md:col-3">
                        <div class="result-card">
                          <div class="result-icon"><i class="pi pi-bolt"></i></div>
                          <div class="result-value">{{ tdee }} <span class="result-unit">kcal</span></div>
                          <div class="result-label">TDEE (dnevni unos)</div>
                        </div>
                      </div>
                      <!-- Preporuka kalorija -->
                      <div class="col-12 sm:col-6 md:col-3">
                        <div class="result-card" [style.border-color]="preporukaBoja">
                          <div class="result-icon"><i class="pi pi-flag-fill"></i></div>
                          <div class="result-value" [style.color]="preporukaBoja">{{ preporukaKalorija }} <span class="result-unit">kcal</span></div>
                          <div class="result-label">Preporučeni unos</div>
                          <div class="result-status" [style.color]="preporukaBoja">{{ preporukaTekst }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Objašnjenje -->
                    <div class="napredni-info mt-3">
                      <div class="info-row" *ngIf="kalorijskaRazlika !== 0">
                        <span class="info-label">Razlika od TDEE:</span>
                        <span class="info-value" [style.color]="preporukaBoja">{{ kalorijskaRazlika > 0 ? '+' : '' }}{{ kalorijskaRazlika }} kcal/dan</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Procenat masti (BMI metod):</span>
                        <span class="info-value">{{ telesnaMast }}%</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Masa masti:</span>
                        <span class="info-value">{{ masaMasti }} kg</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Masa bez masti (mišići + kosti):</span>
                        <span class="info-value">{{ masaBezMasti }} kg</span>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="!mozeRacunati" class="empty-state mt-4">
                    <i class="pi pi-chart-line text-3xl" style="color: var(--gym-text-muted); opacity: 0.3;"></i>
                    <p class="empty-text">Unesi težinu, visinu, godine i pol za izračun</p>
                  </div>
                </div>
              </p-card>
            </div>
          </div>

          <!-- Kalorijski dnevnik -->
          <div class="grid mb-5" *ngIf="activeCalculator === 'kalorijski'">
            <div class="col-12">
              <p-card styleClass="calc-card">
                <div class="calc-header">
                  <i class="pi pi-apple text-2xl"></i>
                  <h3 class="calc-title">Kalorijski dnevnik</h3>
                </div>
                <div class="calc-body">
                  <!-- Pretraga namirnica -->
                  <div class="food-search-wrapper mb-3">
                    <span class="p-input-icon-left w-full" style="position: relative;">
                      <i class="pi pi-search" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--gym-text-muted);"></i>
                      <input
                        type="text"
                        pInputText
                        [(ngModel)]="pretragaText"
                        (ngModelChange)="onPretraga()"
                        class="w-full"
                        style="padding-left: 2.5rem; background: #111; border: 1px solid var(--gym-border); color: #fff; border-radius: 8px;"
                        placeholder="Pretraži namirnice..."
                      />
                    </span>
                  </div>

                  <!-- Rezultati pretrage -->
                  <div class="food-list">
                    <div class="food-item" *ngFor="let n of filteredNamirnice">
                      <div class="food-info">
                        <span class="food-name">{{ n.naziv }}</span>
                        <span class="food-kcal">{{ n.kcal }} kcal</span>
                        <span class="food-kolicina">({{ n.kolicina }})</span>
                      </div>
                      <button class="food-add-btn" (click)="dodajNamirnicu(n)">
                        <i class="pi pi-plus"></i>
                      </button>
                    </div>
                  </div>

                  <div *ngIf="!pretragaText && filteredNamirnice.length === 0" class="empty-state mt-2">
                    <p class="empty-text" style="font-size:0.8rem; color: var(--gym-text-muted);">
                      Počni da kucaš za pretragu namirnica
                    </p>
                  </div>
                  <div *ngIf="pretragaText && filteredNamirnice.length === 0 && !loadingNamirnice" class="empty-state mt-2">
                    <p class="empty-text" style="font-size:0.8rem; color: var(--gym-text-muted);">
                      Nema rezultata za "{{ pretragaText }}"
                    </p>
                  </div>

                  <!-- Dodate namirnice i total -->
                  <div class="food-dnevnik mt-4" *ngIf="odabraneNamirnice.length > 0">
                    <h4 class="dnevnik-title">Dnevni unos</h4>
                    <div class="dnevnik-lista">
                      <div class="dnevnik-item" *ngFor="let o of odabraneNamirnice; let i = index">
                        <span class="dnevnik-name">{{ o.naziv }}</span>
                        <span class="dnevnik-kcal">{{ o.kcal }} kcal</span>
                        <button class="food-remove-btn" (click)="ukloniNamirnicu(i)">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="dnevnik-total">
                      <span class="total-label">UKUPNO</span>
                      <span class="total-value">{{ ukupnoKalorija }} kcal</span>
                    </div>
                  </div>

                  <div *ngIf="odabraneNamirnice.length === 0" class="empty-state mt-3">
                    <i class="pi pi-apple text-3xl" style="color: var(--gym-text-muted); opacity: 0.3;"></i>
                    <p class="empty-text">Pretraži i dodaj namirnice koje si jeo</p>
                  </div>

                  <!-- Save controls -->
                  <div class="obrok-save-controls mt-4" *ngIf="odabraneNamirnice.length > 0">
                    <div class="grid">
                      <div class="col-12 sm:col-4">
                        <label class="calc-label">Datum</label>
                        <p-datePicker
                          [(ngModel)]="obrokDatum"
                          dateFormat="dd.mm.yy"
                          styleClass="w-full"
                          inputStyleClass="w-full"
                          [showIcon]="true"
                        />
                      </div>
                      <div class="col-12 sm:col-4">
                        <label class="calc-label">Vreme</label>
                        <p-datePicker
                          [(ngModel)]="obrokVreme"
                          [timeOnly]="true"
                          styleClass="w-full"
                          inputStyleClass="w-full"
                          [showIcon]="true"
                        />
                      </div>
                      <div class="col-12 sm:col-4">
                        <label class="calc-label">Tip obroka</label>
                        <p-select
                          [options]="tipObrokaOpcije"
                          [(ngModel)]="obrokTip"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Izaberi tip"
                          styleClass="w-full"
                        />
                      </div>
                    </div>
                    <div class="flex justify-content-end mt-3 gap-2">
                      <button class="save-obrok-btn" (click)="sacuvajObrok()" [disabled]="!obrokDatum || !obrokTip || loadingSave">
                        <i class="pi pi-save" style="margin-right: 0.4rem;"></i>
                        {{ loadingSave ? 'Čuvanje...' : 'Sačuvaj obrok' }}
                      </button>
                    </div>
                  </div>

                  <!-- Pregled obroka po datumu -->
                  <div class="obrok-history mt-4">
                    <div class="history-date-picker mb-3">
                      <label class="calc-label">Izaberi datum</label>
                      <p-datePicker
                        [(ngModel)]="selectedHistoryDate"
                        (ngModelChange)="onHistoryDateChange()"
                        dateFormat="dd.mm.yy"
                        styleClass="w-full"
                        inputStyleClass="w-full"
                        [showIcon]="true"
                      />
                    </div>

                    <div *ngIf="!selectedHistoryDate" class="empty-state mt-2">
                      <p class="empty-text" style="font-size:0.85rem;">Izaberi datum za pregled obroka</p>
                    </div>

                    <div *ngIf="selectedHistoryDate && istorijaObroka.length === 0" class="empty-state mt-2">
                      <p class="empty-text" style="font-size:0.85rem;">Nema sačuvanih obroka za ovaj datum</p>
                    </div>

                    <div class="history-day-total" *ngIf="istorijaObroka.length > 0">
                      <span class="total-label">UKUPNO ZA DAN</span>
                      <span class="total-value">{{ ukupnoKalorijaZaDan }} kcal</span>
                    </div>

                    <div class="history-item" *ngFor="let o of istorijaObroka">
                      <div class="history-header">
                        <span class="history-tip" [style.background]="tipBoja(o.tip)">{{ tipLabel(o.tip) }}</span>
                        <span class="history-count">{{ o.stavke?.length || 0 }} stavki</span>
                        <span class="history-total">{{ ukupnoKalorijaZaObrok(o) }} kcal</span>
                      </div>
                      <div class="history-stavke">
                        <span class="history-stavka" *ngFor="let s of o.stavke">{{ s.naziv }} ({{ s.kcal }} kcal)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </p-card>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .max-w-7xl { max-width: 1400px; margin-left: auto; margin-right: auto; }
    .dashboard-welcome { border-bottom: 1px solid var(--gym-border); padding-bottom: 1rem; }
    .dash-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .dash-sub { color: var(--gym-text-muted); margin: 0; font-size: 1.1rem; }

    /* Kalkulator */
    .calc-card {
      border: 1px solid var(--gym-border) !important;
      background: var(--gym-card-bg) !important;
      border-radius: 12px !important;
    }
    .calc-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--gym-border);
      color: var(--gym-gold);
    }
    .calc-title { color: #fff; margin: 0; font-size: 1.15rem; }
    .calc-body { padding-top: 1.25rem; }
    .calc-label {
      display: block;
      color: var(--gym-text-muted);
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .bmi-value { display: flex; align-items: baseline; justify-content: center; gap: 0.5rem; }
    .bmi-number {
      font-family: 'Bebas Neue', cursive;
      font-size: 4rem;
      color: #fff;
      line-height: 1;
      letter-spacing: 2px;
    }
    .bmi-label {
      font-size: 1rem;
      color: var(--gym-text-muted);
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .bmi-meter-wrapper { position: relative; padding: 0 0; }
    .bmi-meter {
      position: relative;
      height: 24px;
      border-radius: 12px;
      overflow: hidden;
      background: #1a1a1a;
    }
    .meter-bar {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .meter-segment {
      position: absolute;
      top: 0;
      height: 100%;
    }
    .segment-red { background: #e74c3c; }
    .segment-green { background: #2ecc71; }
    .segment-yellow { background: #f1c40f; }
    .segment-red-dark { background: #c0392b; }

    .meter-indicator {
      position: absolute;
      top: -4px;
      width: 6px;
      height: 32px;
      background: #fff;
      border-radius: 3px;
      transform: translateX(-50%);
      transition: left 0.3s ease;
      box-shadow: 0 0 8px rgba(255,255,255,0.6);
      z-index: 2;
    }

    .meter-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.4rem;
      font-size: 0.7rem;
      color: var(--gym-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bmi-category {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .category-text {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    /* Napredni rezultati */
    .napredni-rezultati {
      border-top: 1px solid var(--gym-border);
      padding-top: 1.25rem;
    }
    .result-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--gym-border);
      border-radius: 10px;
      padding: 1.25rem 1rem;
      text-align: center;
      height: 100%;
      transition: border-color 0.2s;
    }
    .result-icon { color: var(--gym-gold); margin-bottom: 0.5rem; font-size: 1.2rem; }
    .result-value {
      font-family: 'Bebas Neue', cursive;
      font-size: 2.2rem;
      color: #fff;
      line-height: 1;
      letter-spacing: 1px;
    }
    .result-unit { font-size: 0.9rem; color: var(--gym-text-muted); font-family: inherit; }
    .result-label {
      color: var(--gym-text-muted);
      font-size: 0.75rem;
      margin-top: 0.3rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .result-status {
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.25rem;
      letter-spacing: 0.5px;
    }
    .napredni-info {
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--gym-border);
      border-radius: 8px;
      padding: 1rem;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.35rem 0;
    }
    .info-row + .info-row { border-top: 1px solid rgba(255,255,255,0.04); }
    .info-label { color: var(--gym-text-muted); font-size: 0.85rem; }
    .info-value { color: #fff; font-size: 0.9rem; font-weight: 600; }
    .empty-state { text-align: center; padding: 0.5rem 0; }
    .empty-state { text-align: center; padding: 0.5rem 0; }
    .empty-text { color: var(--gym-text-muted); font-size: 0.85rem; margin-top: 0.5rem; }

    /* Kalorijski dnevnik */
    .food-list { display: flex; flex-direction: column; gap: 0.35rem; }
    .food-item {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.03); border: 1px solid var(--gym-border);
      border-radius: 8px; padding: 0.6rem 0.75rem;
      transition: border-color 0.15s;
    }
    .food-item:hover { border-color: var(--gym-gold); }
    .food-info { display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
    .food-name { color: #fff; font-weight: 600; font-size: 0.9rem; }
    .food-kcal { color: var(--gym-gold); font-weight: 700; font-size: 0.85rem; }
    .food-kolicina { color: var(--gym-text-muted); font-size: 0.75rem; }
    .food-add-btn {
      background: rgba(240,165,0,0.15); border: none; color: var(--gym-gold);
      width: 30px; height: 30px; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .food-add-btn:hover { background: rgba(240,165,0,0.3); }
    .dnevnik-title {
      color: #fff; font-size: 1rem; margin: 0 0 0.5rem 0;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .dnevnik-lista { display: flex; flex-direction: column; gap: 0.3rem; }
    .dnevnik-item {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(46,204,113,0.06); border: 1px solid rgba(46,204,113,0.2);
      border-radius: 6px; padding: 0.5rem 0.75rem;
    }
    .dnevnik-name { color: #fff; font-size: 0.85rem; }
    .dnevnik-kcal { color: #2ecc71; font-weight: 700; font-size: 0.85rem; }
    .food-remove-btn {
      background: rgba(231,76,60,0.15); border: none; color: #e74c3c;
      width: 26px; height: 26px; border-radius: 5px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; transition: background 0.15s;
    }
    .food-remove-btn:hover { background: rgba(231,76,60,0.3); }
    .dnevnik-total {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(240,165,0,0.1); border: 1px solid rgba(240,165,0,0.3);
      border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.5rem;
    }
    .total-label { color: var(--gym-gold); font-weight: 700; letter-spacing: 2px; font-size: 0.85rem; }
    .total-value { color: #fff; font-family: 'Bebas Neue', cursive; font-size: 1.8rem; letter-spacing: 1px; }

    .obrok-save-controls {
      border-top: 1px solid var(--gym-border);
      padding-top: 1rem;
    }
    .save-obrok-btn {
      background: var(--gym-gold); color: #000; border: none;
      padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700;
      font-size: 0.9rem; cursor: pointer; letter-spacing: 1px;
      text-transform: uppercase; transition: opacity 0.15s;
    }
    .save-obrok-btn:hover { opacity: 0.85; }
    .save-obrok-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .history-item {
      background: rgba(255,255,255,0.02); border: 1px solid var(--gym-border);
      border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;
    }
    .history-header {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    }
    .history-time { color: var(--gym-text-muted); font-size: 0.85rem; font-weight: 600; }
    .history-tip {
      color: #000; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem;
      border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;
    }
    .history-total { color: var(--gym-gold); font-weight: 700; margin-left: auto; font-size: 0.9rem; }
    .history-day-total {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(240,165,0,0.08); border: 1px solid rgba(240,165,0,0.2);
      border-radius: 8px; padding: 0.6rem 1rem; margin-bottom: 0.75rem;
    }
    .history-stavke { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem; }
    .history-stavka {
      background: rgba(255,255,255,0.04); color: var(--gym-text-muted);
      font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px;
    }

    /* Placeholder kartice */
    .placeholder-card {
      border: 1px solid var(--gym-border) !important;
      background: var(--gym-card-bg) !important;
      border-radius: 12px !important;
      text-align: center;
    }
    .placeholder-card :deep(.p-card-body) { padding-top: 0; }
    .placeholder-header {
      background: rgba(240, 165, 0, 0.08);
      padding: 1.5rem;
      color: var(--gym-gold);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .placeholder-title { color: #fff; margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .placeholder-desc { color: var(--gym-text-muted); margin: 0; font-size: 0.85rem; line-height: 1.5; }
    .placeholder-coming {
      margin-top: 1rem;
      color: var(--gym-gold);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      opacity: 0.6;
    }

    /* === USKORO ISTIČE === */
    .expiring-section {
      border: 1px solid var(--gym-border);
      background: var(--gym-card-bg);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
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

    /* === HARMONIJA KALKULATORA === */
    .calc-harmony-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .calc-harmony-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--gym-card-bg);
      border: 1px solid var(--gym-border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .calc-harmony-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(240,165,0,0.05), transparent);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .calc-harmony-card:hover {
      border-color: rgba(240,165,0,0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }

    .calc-harmony-card:hover::before {
      opacity: 1;
    }

    .calc-harmony-card.active {
      border-color: var(--gym-gold);
      background: linear-gradient(135deg, rgba(240,165,0,0.08), rgba(240,165,0,0.02));
      box-shadow: 0 0 20px rgba(240,165,0,0.1);
    }

    .calc-harmony-card.active::before {
      opacity: 1;
    }

    .harmony-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(240,165,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: var(--gym-gold);
      flex-shrink: 0;
      transition: background 0.25s ease;
    }

    .calc-harmony-card.active .harmony-icon {
      background: rgba(240,165,0,0.2);
    }

    .harmony-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
      min-width: 0;
    }

    .harmony-title {
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .harmony-desc {
      color: var(--gym-text-muted);
      font-size: 0.78rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .harmony-chevron {
      color: var(--gym-text-muted);
      font-size: 0.7rem;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }

    .harmony-chevron.open {
      transform: rotate(180deg);
      color: var(--gym-gold);
    }

    /* Expandovani kalkulator animacija */
    .expanded-calculator {
      animation: fadeSlideIn 0.3s ease;
    }

    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .calc-harmony-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private clanarineService = inject(ClanarineService);
  private programUplateService = inject(ProgramUplateService);
  private obrociService = inject(ObrociService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private baseUrl = '/api/namirnice';

  // Uskoro ističe
  expiringItems: ExpiringItem[] = [];
  loadingExpiring = false;

  // Aktivni kalkulator (harmonija)
  activeCalculator: string | null = null;

  toggleCalculator(calc: string): void {
    if (this.activeCalculator === calc) {
      this.activeCalculator = null;
    } else {
      this.activeCalculator = calc;
    }
  }

  // BMI inputs
  tezina: number | null = null;
  visina: number | null = null;

  // Napredni kalkulator inputs
  naprednaTezina: number | null = null;
  naprednaVisina: number | null = null;
  godine: number | null = null;
  pol: string | null = null;
  nivoAktivnosti: { label: string; value: number } | null = null;
  cilj: { label: string; value: number } | null = null;

  polOpcije = [
    { label: 'Muški', value: 'M' },
    { label: 'Ženski', value: 'Z' }
  ];

  aktivnostOpcije = [
    { label: 'Sedeći (bez vežbanja)', value: 1.2 },
    { label: 'Lagan (1-3 dana/nedeljno)', value: 1.375 },
    { label: 'Umeren (3-5 dana/nedeljno)', value: 1.55 },
    { label: 'Aktivan (6-7 dana/nedeljno)', value: 1.725 },
    { label: 'Ekstremno aktivan (2x dnevno)', value: 1.9 }
  ];

  ciljOpcije = [
    { label: 'Održavanje težine', value: 0 },
    { label: 'Blagi gubitak ( -250 kcal )', value: -250 },
    { label: 'Gubitak težine ( -500 kcal )', value: -500 },
    { label: 'Brzi gubitak ( -750 kcal )', value: -750 },
    { label: 'Blagi dobitak ( +250 kcal )', value: 250 },
    { label: 'Dobitak mase ( +500 kcal )', value: 500 }
  ];

  // ---- Kalorijski dnevnik ----
  pretragaText = '';
  sveNamirnice: Namirnica[] = [];
  filteredNamirnice: Namirnica[] = [];
  loadingNamirnice = false;
  odabraneNamirnice: { naziv: string; kcal: number; kolicina?: string }[] = [];

  // Save obrok
  obrokDatum: Date = new Date();
  obrokVreme: Date = new Date();
  obrokTip: string | null = null;
  loadingSave = false;
  istorijaObroka: any[] = [];

  tipObrokaOpcije = [
    { label: 'Doručak', value: 'DORUCAK' },
    { label: 'Ručak', value: 'RUCAK' },
    { label: 'Večera', value: 'VECERA' },
    { label: 'Užina', value: 'UZINA' }
  ];

  selectedHistoryDate: Date | null = null;

  ngOnInit(): void {
    this.ucitajSveNamirnice();
    this.ucitajExpiringItems();
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onHistoryDateChange(): void {
    if (!this.selectedHistoryDate) {
      this.istorijaObroka = [];
      return;
    }
    const datum = this.formatDate(this.selectedHistoryDate);
    this.obrociService.getAll(datum).subscribe({
      next: (data) => this.istorijaObroka = data,
      error: () => {}
    });
  }

  get ukupnoKalorijaZaDan(): number {
    return this.istorijaObroka.reduce((sum, o) => sum + this.ukupnoKalorijaZaObrok(o), 0);
  }

  tipLabel(tip: string): string {
    const m: Record<string, string> = { DORUCAK: 'Doručak', RUCAK: 'Ručak', VECERA: 'Večera', UZINA: 'Užina' };
    return m[tip] || tip;
  }

  tipBoja(tip: string): string {
    const b: Record<string, string> = { DORUCAK: '#f1c40f', RUCAK: '#e67e22', VECERA: '#9b59b6', UZINA: '#1abc9c' };
    return b[tip] || '#666';
  }

  ukupnoKalorijaZaObrok(o: any): number {
    return (o.stavke || []).reduce((s: number, st: any) => s + Number(st.kcal), 0);
  }

  sacuvajObrok(): void {
    if (!this.obrokDatum || !this.obrokTip || this.odabraneNamirnice.length === 0) return;

    this.loadingSave = true;
    const datum = this.formatDate(this.obrokDatum);
    const vreme = this.obrokVreme.toTimeString().split(' ')[0].slice(0, 5);

    this.obrociService.create({
      datum,
      vreme,
      tip: this.obrokTip,
      stavke: this.odabraneNamirnice.map(n => ({
        naziv: n.naziv,
        kcal: n.kcal,
        kolicina: (n as any).kolicina || '1 porcija'
      }))
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.odabraneNamirnice = [];
        if (this.selectedHistoryDate) this.onHistoryDateChange();
        this.messageService.add({
          severity: 'success',
          summary: 'Sačuvano',
          detail: 'Obrok je uspešno sačuvan!'
        });
      },
      error: () => {
        this.loadingSave = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Došlo je do greške prilikom čuvanja obroka.'
        });
      }
    });
  }

  private ucitajSveNamirnice(): void {
    this.loadingNamirnice = true;
    this.http.get<Namirnica[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.sveNamirnice = data;
        this.loadingNamirnice = false;
      },
      error: () => {
        this.loadingNamirnice = false;
      }
    });
  }

  private ucitajExpiringItems(): void {
    const userId = this.auth.userId();
    if (!userId) {
      this.loadingExpiring = false;
      return;
    }

    this.loadingExpiring = true;
    this.expiringItems = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Safety: ensure loading stops after 15s even if APIs hang
    const safetyTimer = setTimeout(() => {
      if (this.loadingExpiring) {
        this.loadingExpiring = false;
      }
    }, 15000);

    let zavrseno = 0;
    const ukupno = 2;

    const onComplete = () => {
      zavrseno++;
      if (zavrseno >= ukupno) {
        clearTimeout(safetyTimer);
        this.loadingExpiring = false;
      }
    };

    const clanarinaObs = this.clanarineService.getByKorisnik(userId);

    clanarinaObs.subscribe({
      next: (data) => {
        for (const c of data) {
          if (c.status !== 'AKTIVNA' || !c.datumIsteka) continue;
          const parsedDate = this.parseDateSafe(c.datumIsteka);
          if (!parsedDate) continue;
          const diffDays = Math.floor((parsedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
        onComplete();
      },
      error: () => onComplete()
    });

    const programObs = this.programUplateService.getByKorisnik(userId);

    programObs.subscribe({
      next: (data) => {
        for (const p of data) {
          if (p.status !== 'AKTIVNA' || !p.datumIsteka) continue;
          const parsedDate = this.parseDateSafe(p.datumIsteka);
          if (!parsedDate) continue;
          const diffDays = Math.floor((parsedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
        onComplete();
      },
      error: () => onComplete()
    });
  }

  private parseDateSafe(value: unknown): Date | null {
    if (!value) return null;

    // Java LocalDate array format: [year, month, day]
    if (Array.isArray(value) && value.length >= 3) {
      const y = Number(value[0]);
      const m = Number(value[1]);
      const d = Number(value[2]);
      if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
        return new Date(y, m - 1, d, 0, 0, 0);
      }
      return null;
    }

    const str = String(value).trim();
    if (!str) return null;

    // YYYY-MM-DD format
    const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      return new Date(+match[1], +match[2] - 1, +match[3], 0, 0, 0);
    }

    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  onPretraga(): void {
    const query = this.pretragaText.trim().toLowerCase();
    if (!query) {
      this.filteredNamirnice = [];
      return;
    }
    this.filteredNamirnice = this.sveNamirnice.filter(n =>
      n.naziv.toLowerCase().includes(query)
    ).slice(0, 30);
  }

  username = computed(() => this.auth.currentUser()?.ime ?? '');
  user = computed(() => ({
    ime: this.auth.currentUser()?.ime ?? '',
    prezime: this.auth.currentUser()?.prezime ?? '',
    email: this.auth.currentUser()?.email ?? '',
    rola: this.auth.currentUser()?.rola ?? ''
  }));

  // ---- BMI (postojeći) ----

  get bmi(): number {
    if (!this.tezina || !this.visina || this.visina <= 0) return 0;
    const visinaMetri = this.visina / 100;
    const bmi = this.tezina / (visinaMetri * visinaMetri);
    return Math.round(bmi * 10) / 10;
  }

  get bmiPosition(): string {
    const bmi = this.bmi;
    if (bmi <= 0) return '0%';
    const clamped = Math.min(Math.max(bmi, 10), 45);
    const position = ((clamped - 10) / 35) * 100;
    return Math.min(Math.max(position, 0), 100) + '%';
  }

  get bmiKategorija(): string {
    const bmi = this.bmi;
    if (bmi <= 0) return '';
    if (bmi < 18.5) return 'Pothranjenost';
    if (bmi < 25) return 'Normalna težina';
    if (bmi < 30) return 'Prekomerna težina';
    return 'Gojaznost';
  }

  get bmiColor(): string {
    const bmi = this.bmi;
    if (bmi <= 0) return '';
    if (bmi < 18.5) return '#e74c3c';
    if (bmi < 25) return '#2ecc71';
    if (bmi < 30) return '#f1c40f';
    return '#c0392b';
  }

  get bmiIcon(): string {
    const bmi = this.bmi;
    if (bmi <= 0) return '';
    if (bmi < 18.5 || bmi >= 30) return 'pi pi-exclamation-triangle';
    if (bmi < 25) return 'pi pi-check-circle';
    return 'pi pi-exclamation-circle';
  }

  // ---- Napredni kalkulator ----

  get mozeRacunati(): boolean {
    return !!this.naprednaTezina && !!this.naprednaVisina && !!this.godine && !!this.pol && !!this.nivoAktivnosti && !!this.cilj;
  }

  /** BMI vrednost za napredni kalkulator */
  private get napredniBmi(): number {
    if (!this.naprednaTezina || !this.naprednaVisina || this.naprednaVisina <= 0) return 0;
    return this.naprednaTezina / Math.pow(this.naprednaVisina / 100, 2);
  }

  /** Procenat telesne masti (BMI-based formula) */
  get telesnaMast(): number {
    const bmi = this.napredniBmi;
    if (bmi <= 0 || !this.godine || !this.pol) return 0;
    let procenat: number;
    if (this.pol === 'M') {
      procenat = (1.20 * bmi) + (0.23 * this.godine) - 16.2;
    } else {
      procenat = (1.20 * bmi) + (0.23 * this.godine) - 5.4;
    }
    return Math.round(Math.min(Math.max(procenat, 3), 60) * 10) / 10;
  }

  get mastKategorija(): string {
    const m = this.telesnaMast;
    if (this.pol === 'M') {
      if (m < 6) return 'Esencijalna mast';
      if (m < 14) return 'Sportski oblik';
      if (m < 18) return 'Fit';
      if (m < 25) return 'Prihvatljivo';
      return 'Prekomerno';
    } else {
      if (m < 14) return 'Esencijalna mast';
      if (m < 21) return 'Sportski oblik';
      if (m < 25) return 'Fit';
      if (m < 32) return 'Prihvatljivo';
      return 'Prekomerno';
    }
  }

  get mastBoja(): string {
    const m = this.telesnaMast;
    if (this.pol === 'M') {
      if (m < 6 || m >= 25) return '#e74c3c';
      if (m >= 18) return '#f1c40f';
      return '#2ecc71';
    } else {
      if (m < 14 || m >= 32) return '#e74c3c';
      if (m >= 25) return '#f1c40f';
      return '#2ecc71';
    }
  }

  /** BMR - Mifflin-St Jeor */
  get bmr(): number {
    if (!this.naprednaTezina || !this.naprednaVisina || !this.godine || !this.pol) return 0;
    let bmr: number;
    if (this.pol === 'M') {
      bmr = 10 * this.naprednaTezina + 6.25 * this.naprednaVisina - 5 * this.godine + 5;
    } else {
      bmr = 10 * this.naprednaTezina + 6.25 * this.naprednaVisina - 5 * this.godine - 161;
    }
    return Math.round(bmr);
  }

  /** TDEE = BMR × aktivnost */
  get tdee(): number {
    if (!this.bmr || !this.nivoAktivnosti) return 0;
    return Math.round(this.bmr * this.nivoAktivnosti.value);
  }

  /** Preporučen dnevni unos kalorija */
  get preporukaKalorija(): number {
    if (!this.tdee || !this.cilj) return 0;
    return Math.round(this.tdee + this.cilj.value);
  }

  get preporukaTekst(): string {
    if (!this.cilj) return '';
    switch (this.cilj.value) {
      case 0: return 'Održavanje';
      case -250: return 'Blagi deficit';
      case -500: return 'Deficit';
      case -750: return 'Veći deficit';
      case 250: return 'Blagi suficit';
      case 500: return 'Suficit';
      default: return '';
    }
  }

  get preporukaBoja(): string {
    if (!this.cilj) return '';
    if (this.cilj.value < 0) return '#e74c3c';
    if (this.cilj.value > 0) return '#2ecc71';
    return 'var(--gym-gold)';
  }

  get kalorijskaRazlika(): number {
    if (!this.tdee || !this.cilj) return 0;
    return this.cilj.value;
  }

  /** Masa masti u kg */
  get masaMasti(): number {
    if (!this.naprednaTezina || !this.telesnaMast) return 0;
    return Math.round((this.naprednaTezina * this.telesnaMast / 100) * 10) / 10;
  }

  /** Masa bez masti (mišići, kosti, voda) */
  get masaBezMasti(): number {
    if (!this.naprednaTezina || !this.masaMasti) return 0;
    return Math.round((this.naprednaTezina - this.masaMasti) * 10) / 10;
  }

  // ---- Kalorijski dnevnik ----

  get ukupnoKalorija(): number {
    return this.odabraneNamirnice.reduce((sum, n) => sum + n.kcal, 0);
  }

  dodajNamirnicu(n: { naziv: string; kcal: number }): void {
    this.odabraneNamirnice.push({ ...n });
  }

  ukloniNamirnicu(index: number): void {
    this.odabraneNamirnice.splice(index, 1);
  }
}
