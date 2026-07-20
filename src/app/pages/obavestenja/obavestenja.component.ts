import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ObavestenjaService, Obavestenje } from '../../core/services/obavestenja.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-obavestenja',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, Button, InputText, InputTextarea, TableModule, Toast, ConfirmDialog, TranslateModule],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="gym-page px-4 py-4">
      <div class="max-w-4xl mx-auto">

        <div class="flex align-items-center gap-3 mb-4">
          <i class="pi pi-campaign text-3xl" style="color: var(--gym-gold)"></i>
          <div>
            <h1 class="page-title">Obaveštenja</h1>
            <p class="page-sub">Pošaljite obaveštenje svim korisnicima</p>
          </div>
        </div>

        <!-- Forma za slanje -->
        <p-card header="Novo obaveštenje" styleClass="mb-4">
          <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-1">
              <label for="naslov" style="color: var(--gym-text-muted); font-size: 0.9rem;">Naslov</label>
              <input
                id="naslov"
                pInputText
                [(ngModel)]="noviNaslov"
                placeholder="Unesite naslov obaveštenja"
                class="w-full"
              />
            </div>
            <div class="flex flex-column gap-1">
              <label for="sadrzaj" style="color: var(--gym-text-muted); font-size: 0.9rem;">Sadržaj</label>
              <textarea
                id="sadrzaj"
                pInputTextarea
                [(ngModel)]="noviSadrzaj"
                placeholder="Unesite sadržaj obaveštenja"
                [rows]="4"
                class="w-full"
              ></textarea>
            </div>
            <p-button
              label="Pošalji obaveštenje"
              icon="pi pi-send"
              styleClass="btn-gym-primary"
              [disabled]="!noviNaslov?.trim() || !noviSadrzaj?.trim()"
              [loading]="slanje"
              (onClick)="posaljiObavestenje()"
            />
          </div>
        </p-card>

        <!-- Lista poslatih -->
        <p-card header="Poslata obaveštenja">
          <p-table [value]="obavestenja" [loading]="loading" styleClass="p-datatable-sm" dataKey="id">
            <ng-template pTemplate="header">
              <tr>
                <th>Naslov</th>
                <th>Sadržaj</th>
                <th>Datum</th>
                <th>Poslao</th>
                <th style="width: 80px"></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-o>
              <tr>
                <td style="font-weight: 600;">{{ o.naslov }}</td>
                <td style="max-width: 300px;">
                  <span style="color: var(--gym-text-muted); font-size: 0.9rem;">{{ o.sadrzaj }}</span>
                </td>
                <td>{{ o.datumKreiranja | date:'dd.MM.yyyy. HH:mm' }}</td>
                <td>{{ o.admin.ime }} {{ o.admin.prezime }}</td>
                <td>
                  <p-button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    [outlined]="true"
                    (onClick)="obrisiObavestenje(o)"
                  />
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center p-4" style="color: var(--gym-text-muted);">
                  <i class="pi pi-inbox text-3xl mb-2" style="display: block;"></i>
                  Nema poslatih obaveštenja
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

      </div>
    </div>

    <p-toast />
    <p-confirmdialog />
  `,
  styles: [`
    .max-w-4xl { max-width: 900px; margin-left: auto; margin-right: auto; }
    .page-title { font-family: 'Bebas Neue', cursive; font-size: 2.2rem; color: var(--gym-gold); letter-spacing: 2px; margin: 0; }
    .page-sub { color: var(--gym-text-muted); margin: 0; font-size: 0.9rem; }
  `]
})
export class ObavestenjaComponent implements OnInit {
  private obavestenjaService = inject(ObavestenjaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  obavestenja: Obavestenje[] = [];
  loading = false;
  slanje = false;

  noviNaslov = '';
  noviSadrzaj = '';

  ngOnInit(): void {
    this.ucitajObavestenja();
  }

  ucitajObavestenja(): void {
    this.loading = true;
    this.obavestenjaService.getAll().subscribe({
      next: (data) => {
        this.obavestenja = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  posaljiObavestenje(): void {
    if (!this.noviNaslov?.trim() || !this.noviSadrzaj?.trim()) return;

    this.slanje = true;
    this.obavestenjaService.create({
      naslov: this.noviNaslov.trim(),
      sadrzaj: this.noviSadrzaj.trim()
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Uspešno',
          detail: 'Obaveštenje je poslato svim korisnicima.'
        });
        this.noviNaslov = '';
        this.noviSadrzaj = '';
        this.slanje = false;
        this.ucitajObavestenja();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Slanje obaveštenja nije uspelo.'
        });
        this.slanje = false;
      }
    });
  }

  obrisiObavestenje(o: Obavestenje): void {
    this.confirmationService.confirm({
      header: 'Potvrda brisanja',
      message: `Da li ste sigurni da želite da obrišete obaveštenje "${o.naslov}"?`,
      acceptLabel: 'Da',
      rejectLabel: 'Odustani',
      accept: () => {
        this.obavestenjaService.delete(o.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Uspešno',
              detail: 'Obaveštenje je obrisano.'
            });
            this.ucitajObavestenja();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Greška',
              detail: 'Brisanje nije uspelo.'
            });
          }
        });
      }
    });
  }
}
