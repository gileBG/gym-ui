import { Component, inject, OnInit, input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { KorisniciService } from '../../../core/services/korisnici.service';
import { ClanarineService } from '../../../core/services/clanarine.service';
import { Korisnik } from '../../../core/models/korisnik.model';
import { Clanarina, ClanarinaCenovnikItem } from '../../../core/models/clanarina.model';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Program } from '../../../core/models/program.model';
import { ProgramUplata } from '../../../core/models/program-uplata.model';
import { ProgramiService } from '../../../core/services/programi.service';
import { ProgramUplateService } from '../../../core/services/program-uplate.service';
import { ScanService } from '../../../core/services/scan.service';
import { ScanLog } from '../../../core/models/scan-log.model';

interface ExpiringItem {
  tip: 'clanarina' | 'program';
  naziv: string;
  tipLabel: string;
  datumIsteka: string;
  daysUntil: number;
}

@Component({
  selector: 'app-korisnik-detalj',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Card, Button, Dialog, Select, InputText, InputNumber, Tag, TableModule, TranslateModule],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-4xl mx-auto">
        <div class="flex align-items-center gap-3 mb-4">
          <p-button icon="pi pi-arrow-left" [outlined]="true" size="small" (onClick)="goBack()" />
          <h1 class="page-title">{{ 'USERS.DETAIL_TITLE' | translate }}</h1>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <i class="pi pi-spin pi-spinner text-4xl" style="color: var(--gym-gold)"></i>
        </div>

        <div *ngIf="!loading && korisnik" class="grid">
          <!-- Profil korisnika (slika + podaci) - ceo red na vrhu -->
          <div class="col-12">
            <p-card styleClass="korisnik-card">
              <div class="flex align-items-center gap-4 flex-wrap">
                <div class="avatar-circle flex-shrink-0">
                  <img *ngIf="avatarUrl(); else defaultAvatar" [src]="avatarUrl()!" alt="Avatar" class="avatar-img" />
                  <ng-template #defaultAvatar>
                    <i class="pi pi-user text-4xl" style="color: #000"></i>
                  </ng-template>
                </div>
                <div class="flex-grow-1">
                  <h2 class="korisnik-name mb-1">{{ korisnik.ime }} {{ korisnik.prezime }}</h2>
                  <p-tag [value]="korisnik.rola" [severity]="getRoleSeverity(korisnik.rola)" class="mb-2" />
                  <div class="korisnik-info mt-2">
                    <div class="info-row">
                      <i class="pi pi-envelope mr-2" style="color: var(--gym-gold)"></i>
                      <span class="info-label">{{ 'USERS.EMAIL' | translate }}</span>
                      <span class="info-value">{{ korisnik.email }}</span>
                    </div>
                    <div class="info-row">
                      <i class="pi pi-id-card mr-2" style="color: var(--gym-gold)"></i>
                      <span class="info-label">{{ 'USERS.ID' | translate }}</span>
                      <span class="info-value">{{ korisnik.id }}</span>
                    </div>
                  </div>
                </div>
                <div *ngIf="isAdmin" class="flex flex-column gap-2 align-items-start">
                  <input type="file" accept="image/jpeg,image/png,image/webp" (change)="onAvatarSelected($event)" />
                  <div class="flex gap-2">
                    <p-button
                      [label]="'PROFILE.UPLOAD_AVATAR' | translate"
                      icon="pi pi-upload"
                      styleClass="btn-gym-primary"
                      size="small"
                      [disabled]="!selectedAvatarFile || uploadingAvatar || deletingAvatar"
                      [loading]="uploadingAvatar"
                      (onClick)="uploadAvatarForCurrentUser()"
                    />
                    <p-button
                      [label]="'COMMON.DELETE' | translate"
                      icon="pi pi-trash"
                      severity="danger"
                      size="small"
                      [disabled]="!korisnik.avatarUrl || uploadingAvatar || deletingAvatar"
                      [loading]="deletingAvatar"
                      (onClick)="deleteAvatarForCurrentUser()"
                    />
                  </div>
                </div>
              </div>
            </p-card>
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
              <div class="expiring-empty" *ngIf="!loading && !loadingProgramUplate && expiringItems.length === 0">
                <i class="pi pi-check-circle text-green"></i>
                <span>{{ 'DASHBOARD.NO_EXPIRING' | translate }}</span>
              </div>
              <div class="expiring-loading" *ngIf="loading || loadingProgramUplate">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Učitavanje...</span>
              </div>
            </div>
          </div>

          <!-- Članarine i programi -->
          <div class="col-12">
            <p-card [header]="'USERS.MEMBERSHIP_HISTORY' | translate" styleClass="h-full">
              <div *ngIf="isAdmin" class="flex justify-content-end mb-3">
                <p-button
                  [label]="'MEMBERSHIPS.NEW' | translate"
                  icon="pi pi-plus"
                  styleClass="btn-gym-primary"
                  (onClick)="openCreateMembershipDialog()"
                />
              </div>

              <p-table [value]="recentClanarine" [rows]="3" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'USERS.TYPE' | translate }}</th>
                    <th>{{ 'USERS.FROM' | translate }}</th>
                    <th>{{ 'USERS.TO' | translate }}</th>
                    <th>{{ 'COMMON.STATUS' | translate }}</th>
                    <th *ngIf="isAdmin">{{ 'COMMON.ACTIONS' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-c>
                  <tr>
                    <td>{{ c.clanarina.naziv }}</td>
                    <td>{{ c.datumUplate | date: 'dd.MM.yyyy' }}</td>
                    <td>{{ c.datumIsteka | date: 'dd.MM.yyyy' }}</td>
                    <td>
                        <span *ngIf="!isAdmin; else adminStatus">
                          <p-tag
                            [value]="getStatus(c)"
                            [severity]="getStatus(c) === 'AKTIVNA' ? 'success' : 'danger'"
                          />
                        </span>
                        <ng-template #adminStatus>
                          <p-tag
                            [value]="getStatus(c)"
                            [severity]="getStatus(c) === 'AKTIVNA' ? 'success' : 'danger'"
                            styleClass="cursor-pointer"
                            (click)="openStatusMenu($event, c)"
                          />
                        </ng-template>
                      </td>
                      <td *ngIf="isAdmin">
                        <p-button icon="pi pi-trash" severity="danger" size="small" [text]="true" (onClick)="deleteClanarina(c)" />
                      </td>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="emptymessage">
                    <tr><td colspan="5" class="text-center" style="color: var(--gym-text-muted)">{{ 'USERS.NO_MEMBERSHIPS' | translate }}</td></tr>
                  </ng-template>
              </p-table>

              <div *ngIf="hasOlderClanarine" class="mt-3">
                <p-button
                  [label]="oldClanarineExpanded ? 'Sakrij starije članarine' : 'Prikaži starije članarine'"
                  [text]="true"
                  icon="pi pi-angle-down"
                  (onClick)="toggleOldClanarine()"
                />
              </div>

              <div *ngIf="oldClanarineExpanded && hasOlderClanarine" class="mt-2">
                <p-table [value]="olderClanarine" [rows]="10" styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>{{ 'USERS.TYPE' | translate }}</th>
                      <th>{{ 'USERS.FROM' | translate }}</th>
                      <th>{{ 'USERS.TO' | translate }}</th>
                      <th>{{ 'COMMON.STATUS' | translate }}</th>
                      <th *ngIf="isAdmin">{{ 'COMMON.ACTIONS' | translate }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-c>
                    <tr>
                      <td>{{ c.clanarina.naziv }}</td>
                      <td>{{ c.datumUplate | date: 'dd.MM.yyyy' }}</td>
                      <td>{{ c.datumIsteka | date: 'dd.MM.yyyy' }}</td>
                      <td>
                        <span *ngIf="!isAdmin; else adminStatusOld">
                          <p-tag
                            [value]="getStatus(c)"
                            [severity]="getStatus(c) === 'AKTIVNA' ? 'success' : 'danger'"
                          />
                        </span>
                        <ng-template #adminStatusOld>
                          <p-tag
                            [value]="getStatus(c)"
                            [severity]="getStatus(c) === 'AKTIVNA' ? 'success' : 'danger'"
                            styleClass="cursor-pointer"
                            (click)="openStatusMenu($event, c)"
                          />
                        </ng-template>
                      </td>
                      <td *ngIf="isAdmin">
                        <p-button icon="pi pi-trash" severity="danger" size="small" [text]="true" (onClick)="deleteClanarina(c)" />
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>

              <h3 class="mt-4 mb-2" style="color: var(--gym-gold); font-family: 'Bebas Neue', cursive; letter-spacing: 2px;">Moji programi</h3>

              <div *ngIf="isAdmin" class="flex justify-content-end mb-2">
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
                    <th *ngIf="isAdmin">{{ 'COMMON.ACTIONS' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-p>
                  <tr>
                    <td>{{ p.program.naziv }}</td>
                    <td>{{ p.datumUplate | date: 'dd.MM.yyyy' }}</td>
                    <td>{{ p.datumIsteka | date: 'dd.MM.yyyy' }}</td>
                    <td>
                      <span *ngIf="!isAdmin; else adminProgramStatus">
                        <p-tag
                          [value]="getProgramStatus(p)"
                          [severity]="getProgramStatus(p) === 'AKTIVNA' ? 'success' : 'danger'"
                        />
                      </span>
                      <ng-template #adminProgramStatus>
                        <p-tag
                          [value]="getProgramStatus(p)"
                          [severity]="getProgramStatus(p) === 'AKTIVNA' ? 'success' : 'danger'"
                          styleClass="cursor-pointer"
                          (click)="openProgramStatusMenu($event, p)"
                        />
                      </ng-template>
                    </td>
                    <td *ngIf="isAdmin">
                      <p-button icon="pi pi-trash" severity="danger" size="small" [text]="true" (onClick)="deleteProgramUplata(p)" />
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="5" class="text-center" style="color: var(--gym-text-muted); padding: 1rem">
                      Trenutno nema uplata za programe.
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </p-card>
          </div>
        </div>

        <div *ngIf="!loading && !korisnik" class="text-center py-5">
          <p style="color: var(--gym-text-muted)">{{ 'USERS.NOT_FOUND' | translate }}</p>
        </div>

        <!-- Custom Status Popup - Clanarine -->
        <div *ngIf="showStatusMenu" class="status-popup-backdrop" (click)="closeStatusMenu()"></div>
        <div *ngIf="showStatusMenu" class="status-popup" [ngStyle]="statusPopupPos">
          <div class="status-popup-header">Izaberite status</div>
          <div class="status-popup-items">
            <div *ngFor="let s of statusOptions"
              class="status-popup-item"
              [class.active]="selectedMembership?.status === s.value"
              (click)="selectStatus(s.value)">
              <span class="status-dot" [ngClass]="s.colorClass"></span>
              <span class="status-label">{{ s.label }}</span>
              <i *ngIf="selectedMembership?.status === s.value" class="pi pi-check status-check"></i>
            </div>
          </div>
        </div>

        <!-- Custom Status Popup - Programi -->
        <div *ngIf="showProgramStatusMenu" class="status-popup-backdrop" (click)="closeProgramStatusMenu()"></div>
        <div *ngIf="showProgramStatusMenu" class="status-popup" [ngStyle]="programStatusPopupPos">
          <div class="status-popup-header">Izaberite status</div>
          <div class="status-popup-items">
            <div *ngFor="let s of statusOptions"
              class="status-popup-item"
              [class.active]="selectedProgramPayment?.status === s.value"
              (click)="selectProgramStatus(s.value)">
              <span class="status-dot" [ngClass]="s.colorClass"></span>
              <span class="status-label">{{ s.label }}</span>
              <i *ngIf="selectedProgramPayment?.status === s.value" class="pi pi-check status-check"></i>
            </div>
          </div>
        </div>

        <p-dialog
          *ngIf="isAdmin"
          [(visible)]="createMembershipDialogVisible"
          [header]="'MEMBERSHIPS.NEW' | translate"
          [modal]="true"
          [style]="{ width: '480px' }"
          styleClass="gym-dialog"
        >
          <form [formGroup]="membershipForm" class="flex flex-column gap-3 pt-2">
            <div>
              <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.PROGRAM' | translate }}</label>
              <p-select
                formControlName="clanarinaId"
                [options]="clanarinaOptions"
                optionLabel="label"
                optionValue="value"
                [placeholder]="'MEMBERSHIPS.SELECT_PROGRAM' | translate"
                (onChange)="syncMembershipFields()"
                [appendTo]="'body'"
                styleClass="w-full"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.PAYMENT_DATE' | translate }}</label>
              <input pInputText type="date" formControlName="datumUplate" class="w-full" (change)="syncMembershipFields()" />
            </div>

            <div>
              <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.EXPIRY_DATE' | translate }}</label>
              <input pInputText type="date" formControlName="datumIsteka" class="w-full" readonly />
            </div>

            <div>
              <label class="block mb-2 text-sm" style="color: var(--gym-text-muted)">{{ 'MEMBERSHIPS.AMOUNT_RSD' | translate }}</label>
              <p-inputnumber formControlName="iznos" styleClass="w-full" [min]="0" [readonly]="true" />
            </div>
          </form>

          <ng-template pTemplate="footer">
            <p-button [label]="'COMMON.CANCEL' | translate" [text]="true" (onClick)="closeCreateMembershipDialog()" />
            <p-button
              [label]="'COMMON.CREATE' | translate"
              icon="pi pi-check"
              styleClass="btn-gym-primary"
              [loading]="creatingMembership"
              [disabled]="membershipForm.invalid || creatingMembership"
              (onClick)="createMembership()"
            />
          </ng-template>
        </p-dialog>

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
        <div class="col-12">
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
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2rem; color: var(--gym-gold); letter-spacing: 3px; margin: 0; }
    .korisnik-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-gold) !important; }
    .avatar-circle {
      width: 80px; height: 80px;
      background: var(--gym-gold);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .korisnik-name { font-family: 'Bebas Neue', cursive; font-size: 1.6rem; color: #fff; letter-spacing: 2px; }
    .info-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; border-bottom: 1px solid var(--gym-border); }
    .info-label { color: var(--gym-text-muted); font-size: 0.85rem; min-width: 70px; }
    .info-value { color: var(--gym-text-primary); font-weight: 600; }
    .mx-auto { margin-left: auto; margin-right: auto; }

    /* === Custom Status Popup === */
    .status-popup-backdrop {
      position: fixed; inset: 0; z-index: 999; background: transparent;
    }
    .status-popup {
      position: absolute; z-index: 1000;
      background: #1a1a1a; border: 1px solid #2a2a2a;
      border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      min-width: 180px; overflow: hidden;
      animation: popupFadeIn 0.15s ease-out;
    }
    @keyframes popupFadeIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .status-popup-header {
      padding: 0.6rem 1rem; font-size: 0.75rem; text-transform: uppercase;
      color: var(--gym-gold); letter-spacing: 2px;
      border-bottom: 1px solid #2a2a2a;
      background: #111;
    }
    .status-popup-items { padding: 0.3rem 0; }
    .status-popup-item {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.6rem 1rem; cursor: pointer;
      color: var(--gym-text-primary); font-size: 0.9rem;
      transition: background 0.12s;
    }
    .status-popup-item:hover { background: #2a2a2a; }
    .status-popup-item.active { background: rgba(240,165,0,0.08); }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .dot-active   { background: #2dc653; box-shadow: 0 0 6px rgba(45,198,83,0.5); }
    .dot-expired  { background: #e63946; box-shadow: 0 0 6px rgba(230,57,70,0.5); }
    .dot-cancelled { background: #a0a0a0; }
    .status-label { flex: 1; }
    .status-check { color: var(--gym-gold); font-size: 0.8rem; }

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
  `]
})
export class KorisnikDetaljComponent implements OnInit {
  id = input.required<string>();

  private fb = inject(FormBuilder);
  private korisniciService = inject(KorisniciService);
  private clanarineService = inject(ClanarineService);
  private programiService = inject(ProgramiService);
  private programUplateService = inject(ProgramUplateService);
  private scanService = inject(ScanService);
  private auth = inject(AuthService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  readonly isAdmin = this.auth.hasRole('ADMIN');

  showStatusMenu = false;
  statusPopupPos: { top: string; left: string } = { top: '0px', left: '0px' };
  statusOptions = [
    { value: 'AKTIVNA', label: 'Aktivna', colorClass: 'dot-active' },
    { value: 'ISTEKLA', label: 'Istekla', colorClass: 'dot-expired' },
    { value: 'OTKAZANA', label: 'Otkazana', colorClass: 'dot-cancelled' }
  ];

  selectedMembership: Clanarina | null = null;

  showProgramStatusMenu = false;
  programStatusPopupPos: { top: string; left: string } = { top: '0px', left: '0px' };
  selectedProgramPayment: ProgramUplata | null = null;

  korisnik: Korisnik | null = null;
  clanarine: Clanarina[] = [];
  programUplate: ProgramUplata[] = [];
  expiringItems: ExpiringItem[] = [];
  availablePrograms: Program[] = [];
  oldClanarineExpanded = false;
  clanarinaOptions: Array<{ label: string; value: number; cena: number; trajanjeDana: number }> = [];
  loading = true;
  loadingProgramUplate = true;
  createMembershipDialogVisible = false;
  creatingMembership = false;
  selectedAvatarFile: File | null = null;
  uploadingAvatar = false;
  deletingAvatar = false;
  scanHistory: ScanLog[] = [];
  loadingScans = false;

  /** Grupisane posete (ULAZ + IZLAZ) za prikaz u tabeli */
  get visitEntries(): VisitEntry[] {
    return this._groupScansIntoVisits(this.scanHistory);
  }

  programDialogVisible = false;
  selectedProgramId: number | null = null;
  programDatumUplate = '';
  programDatumIsteka = '';
  programIznos = 0;

  avatarUrl = () => {
    const avatar = this.korisnik?.avatarUrl;
    return avatar ? avatar : null;
  };

  membershipForm = this.fb.group({
    clanarinaId: [null as number | null, Validators.required],
    datumUplate: ['', Validators.required],
    datumIsteka: ['', Validators.required],
    iznos: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    const numId = Number(this.id());
    if (isNaN(numId)) { this.loading = false; this.loadingProgramUplate = false; return; }

    this.korisniciService.getVezbacById(numId).subscribe({
      next: (k) => {
        this.korisnik = k;
        this.loadClanarine(numId);
        this.loadProgramUplate(numId);

        if (this.isAdmin) {
          this.loadClanarineCenovnik();
        }
      },
      error: () => { this.loading = false; this.loadingProgramUplate = false; }
    });

    this.programiService.getAll().subscribe({
      next: (programs) => { this.availablePrograms = programs ?? []; },
      error: () => { this.availablePrograms = []; }
    });

    this.loadScanHistory(numId);
  }

  goBack(): void { this.router.navigate(['/korisnici']); }

  openCreateMembershipDialog(): void {
    if (!this.isAdmin || !this.korisnik) {
      return;
    }

    this.membershipForm.reset({
      clanarinaId: null,
      datumUplate: this.getTodayDate(),
      datumIsteka: '',
      iznos: null
    });
    this.syncMembershipFields();
    this.createMembershipDialogVisible = true;
  }

  closeCreateMembershipDialog(): void {
    this.createMembershipDialogVisible = false;
    this.creatingMembership = false;
  }

  createMembership(): void {
    const korisnikId = this.korisnik?.id;
    if (!this.isAdmin || !korisnikId || this.membershipForm.invalid || this.creatingMembership) {
      return;
    }

    const raw = this.membershipForm.getRawValue();
    const clanarinaId = Number(raw.clanarinaId);
    const iznos = Number(raw.iznos);

    if (!Number.isFinite(clanarinaId) || !Number.isFinite(iznos)) {
      return;
    }

    this.creatingMembership = true;
    this.clanarineService.create({
      korisnikId,
      clanarinaId,
      datumUplate: String(raw.datumUplate),
      datumIsteka: String(raw.datumIsteka),
      iznos
    }).subscribe({
      next: () => {
        this.creatingMembership = false;
        this.createMembershipDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: this.translate.instant('MEMBERSHIPS.CREATED')
        });
        this.loadClanarine(korisnikId);
      },
      error: (err) => {
        this.creatingMembership = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.extractErrorMessage(err) || this.translate.instant('MEMBERSHIPS.CREATE_FAILED')
        });
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedAvatarFile = input.files?.[0] ?? null;
  }

  uploadAvatarForCurrentUser(): void {
    if (!this.isAdmin || !this.korisnik?.id || !this.selectedAvatarFile || this.uploadingAvatar || this.deletingAvatar) {
      return;
    }

    this.uploadingAvatar = true;
    const upload$ = this.korisniciService.uploadAvatarForVezbac(this.korisnik.id, this.selectedAvatarFile);

    upload$.subscribe({
      next: (response) => {
        this.uploadingAvatar = false;
        this.selectedAvatarFile = null;
        if (this.korisnik) {
          this.korisnik = { ...this.korisnik, avatarUrl: response.avatarUrl ?? null };
        }
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: 'Avatar je uspešno ažuriran.'
        });
      },
      error: (err) => {
        this.uploadingAvatar = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.extractErrorMessage(err) || 'Neuspešan upload slike.'
        });
      }
    });
  }

  deleteAvatarForCurrentUser(): void {
    if (!this.isAdmin || !this.korisnik?.id || this.uploadingAvatar || this.deletingAvatar) {
      return;
    }

    this.deletingAvatar = true;
    const delete$ = this.korisniciService.deleteAvatarForVezbac(this.korisnik.id);

    delete$.subscribe({
      next: () => {
        this.deletingAvatar = false;
        this.selectedAvatarFile = null;
        if (this.korisnik) {
          this.korisnik = { ...this.korisnik, avatarUrl: null };
        }
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('COMMON.SUCCESS'),
          detail: 'Avatar je obrisan.'
        });
      },
      error: (err) => {
        this.deletingAvatar = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.extractErrorMessage(err) || 'Neuspešno brisanje slike.'
        });
      }
    });
  }

  syncMembershipFields(): void {
    const raw = this.membershipForm.getRawValue();
    const selectedClanarina = this.clanarinaOptions.find((item) => item.value === Number(raw.clanarinaId));
    const datumUplate = String(raw.datumUplate ?? '');

    this.membershipForm.patchValue({
      iznos: selectedClanarina?.cena ?? null,
      datumIsteka: this.calculateExpiryDate(datumUplate, selectedClanarina?.trajanjeDana)
    }, { emitEvent: false });
  }

  getStatus(c: Clanarina): string {
    return c.status || (new Date(c.datumIsteka) >= new Date() ? 'AKTIVNA' : 'ISTEKLA');
  }

  openStatusMenu(event: Event, c: Clanarina): void {
    this.selectedMembership = c;
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.statusPopupPos = {
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`
    };
    this.showStatusMenu = true;
  }

  closeStatusMenu(): void {
    this.showStatusMenu = false;
    this.selectedMembership = null;
  }

  selectStatus(status: string): void {
    if (this.selectedMembership) {
      this.updateClanarinaStatus(this.selectedMembership.id, status);
    }
    this.closeStatusMenu();
  }

  openProgramStatusMenu(event: Event, p: ProgramUplata): void {
    this.selectedProgramPayment = p;
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.programStatusPopupPos = {
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`
    };
    this.showProgramStatusMenu = true;
  }

  closeProgramStatusMenu(): void {
    this.showProgramStatusMenu = false;
    this.selectedProgramPayment = null;
  }

  selectProgramStatus(status: string): void {
    if (this.selectedProgramPayment) {
      this.updateProgramStatus(this.selectedProgramPayment.id, status);
    }
    this.closeProgramStatusMenu();
  }

  private updateProgramStatus(id: number, status: string): void {
    this.programUplateService.updateStatus(id, status).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Uspeh', detail: 'Status programa je ažuriran.' });
        const numId = Number(this.id());
        if (!isNaN(numId)) this.loadProgramUplate(numId);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Greška', detail: this.extractErrorMessage(err) || 'Neuspešno ažuriranje statusa programa.' });
      }
    });
  }

  private updateClanarinaStatus(id: number, status: string): void {
    this.clanarineService.updateStatus(id, status).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Uspeh', detail: 'Status je ažuriran.' });
        const numId = Number(this.id());
        if (!isNaN(numId)) this.loadClanarine(numId);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Greška', detail: this.extractErrorMessage(err) || 'Neuspešno ažuriranje statusa.' });
      }
    });
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
    const korisnikId = this.korisnik?.id;
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
      next: () => {
        this.programDialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Uspeh',
          detail: 'Program je uspešno dodat.'
        });
        this.loadProgramUplate(korisnikId);
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

  private popuniExpiringItems(): void {
    if (this.loading || this.loadingProgramUplate) return;

    this.expiringItems = [];

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

  get recentClanarine(): Clanarina[] {
    return this.clanarine.slice(0, 3);
  }

  get olderClanarine(): Clanarina[] {
    return this.clanarine.slice(3);
  }

  get hasOlderClanarine(): boolean {
    return this.clanarine.length > 3;
  }

  toggleOldClanarine(): void {
    this.oldClanarineExpanded = !this.oldClanarineExpanded;
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'ZAPOSLENI': return 'warn';
      case 'VEZBAC': return 'success';
      default: return 'secondary';
    }
  }

  loadScanHistory(vezbacId: number): void {
    this.loadingScans = true;
    this.scanService.getScansForVezbac(vezbacId).subscribe({
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

  private loadClanarine(korisnikId: number): void {
    this.clanarineService.getByKorisnik(korisnikId).subscribe({
      next: (c) => {
        const sorted = [...(c ?? [])].sort((a, b) => {
          const aTime = new Date(a.datumUplate).getTime();
          const bTime = new Date(b.datumUplate).getTime();
          return bTime - aTime;
        });

        this.clanarine = sorted;
        this.oldClanarineExpanded = false;
        this.loading = false;
        this.popuniExpiringItems();
      },
      error: () => {
        this.loading = false;
        this.popuniExpiringItems();
      }
    });
  }

  private loadProgramUplate(korisnikId: number): void {
    this.programUplateService.getByKorisnik(korisnikId).subscribe({
      next: (data) => {
        this.programUplate = [...data].sort((a, b) => new Date(b.datumUplate).getTime() - new Date(a.datumUplate).getTime());
        this.loadingProgramUplate = false;
        this.popuniExpiringItems();
      },
      error: () => { this.loadingProgramUplate = false; this.popuniExpiringItems(); }
    });
  }

  private loadClanarineCenovnik(): void {
    this.clanarineService.getCenovnikClanarine().subscribe({
      next: (clanarine: ClanarinaCenovnikItem[]) => {
        this.clanarinaOptions = (clanarine ?? []).map((item) => ({
          label: item.naziv,
          value: Number(item.id),
          cena: Number(item.cena ?? 0),
          trajanjeDana: Number(item.trajanjeDana ?? 31)
        }));
        this.syncMembershipFields();
      },
      error: () => {
        this.clanarinaOptions = [];
      }
    });
  }

  private calculateExpiryDate(paymentDate: string, durationDays?: number): string {
    if (!paymentDate || !durationDays) {
      return '';
    }

    const baseDate = new Date(paymentDate);
    if (Number.isNaN(baseDate.getTime())) {
      return '';
    }

    const expiryDate = new Date(baseDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    return expiryDate.toISOString().split('T')[0];
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err !== 'object' || err === null) {
      return '';
    }

    const error = err as { error?: unknown; message?: unknown };
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (typeof error.message === 'string') {
      return error.message;
    }

    if (typeof error.error === 'object' && error.error !== null) {
      const nested = error.error as { message?: unknown; error?: unknown };
      if (typeof nested.message === 'string') {
        return nested.message;
      }
      if (typeof nested.error === 'string') {
        return nested.error;
      }
    }

    return '';
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

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  deleteClanarina(c: Clanarina): void {
    if (!this.isAdmin || !c?.id) return;

    this.clanarineService.deleteClanarina(c.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Obrisano', detail: 'Članarina je obrisana.' });
        const numId = Number(this.id());
        if (!isNaN(numId)) this.loadClanarine(numId);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Greška', detail: this.extractErrorMessage(err) || 'Neuspešno brisanje članarine.' });
      }
    });
  }

  deleteProgramUplata(p: ProgramUplata): void {
    if (!this.isAdmin || !p?.id) return;

    this.programUplateService.delete(p.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Obrisano', detail: 'Program uplata je obrisana.' });
        const numId = Number(this.id());
        if (!isNaN(numId)) this.loadProgramUplate(numId);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Greška', detail: this.extractErrorMessage(err) || 'Neuspešno brisanje programa.' });
      }
    });
  }
}

interface VisitEntry {
  datum: string;
  ulazVreme: string;
  izlazVreme: string | null;
  trajanje: string | null;
}
