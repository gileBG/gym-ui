import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Button, TranslateModule],
  template: `
    <div class="gym-navbar">
      <div class="navbar-inner flex align-items-center justify-content-between px-4 py-2">
        <!-- Logo -->
        <a routerLink="/" class="navbar-logo flex align-items-center gap-2">
          <i class="pi pi-bolt text-2xl" style="color: var(--gym-gold)"></i>
          <span class="logo-text">POWER<span class="text-gold">GYM</span></span>
        </a>

        <!-- Nav links -->
        <nav class="navbar-links flex align-items-center gap-4">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">{{ 'NAV.HOME' | translate }}</a>
          <a routerLink="/about" routerLinkActive="active">{{ 'NAV.ABOUT' | translate }}</a>
          <a routerLink="/programi" routerLinkActive="active">{{ 'NAV.PROGRAMS' | translate }}</a>
          <a routerLink="/clanarine" routerLinkActive="active">{{ 'NAV.MEMBERSHIPS' | translate }}</a>
          <a routerLink="/korisnici" routerLinkActive="active" *ngIf="isAdmin()">{{ 'NAV.USERS' | translate }}</a>
          <a routerLink="/zaposleni" routerLinkActive="active" *ngIf="isAdmin()">{{ 'NAV.EMPLOYEES' | translate }}</a>
          <a routerLink="/dashboard" routerLinkActive="active" *ngIf="isAdminOrZaposleni()">{{ 'NAV.DASHBOARD' | translate }}</a>
          <a routerLink="/obavestenja" routerLinkActive="active" *ngIf="isAdmin()">{{ 'NAV.NOTIFICATIONS' | translate }}</a>
          <a routerLink="/qr-kodovi" routerLinkActive="active" *ngIf="isAdmin()">{{ 'QR.NAV_LINK' | translate }}</a>
          <a routerLink="/moj-dashboard" routerLinkActive="active" *ngIf="isLoggedIn() && !isAdminOrZaposleni()">Moj dashboard</a>
        </nav>

        <!-- Auth actions -->
        <div class="navbar-auth flex align-items-center gap-2">
          <label class="lang-label" for="lang-select">{{ 'NAV.LANGUAGE' | translate }}</label>
          <select
            id="lang-select"
            class="lang-select"
            [value]="currentLanguage()"
            (change)="onLanguageChange($any($event.target).value)"
          >
            <option value="sr">SR</option>
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>

          <ng-container *ngIf="isLoggedIn(); else guestButtons">
            <a routerLink="/profil" class="profile-link flex align-items-center gap-2">
              <i class="pi pi-user"></i>
              <span>{{ username() }}</span>
            </a>
            <p-button
              [label]="'AUTH.LOGOUT' | translate"
              icon="pi pi-sign-out"
              size="small"
              severity="danger"
              (onClick)="logout()"
            />
          </ng-container>
          <ng-template #guestButtons>
            <a routerLink="/login">
              <p-button [label]="'AUTH.LOGIN' | translate" icon="pi pi-sign-in" size="small" [outlined]="true" styleClass="btn-gym-outline"/>
            </a>
            <a routerLink="/register">
              <p-button [label]="'AUTH.REGISTER' | translate" icon="pi pi-user-plus" size="small" styleClass="btn-gym-primary"/>
            </a>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gym-navbar {
      background: rgba(10, 10, 10, 0.95);
      border-bottom: 2px solid var(--gym-gold);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }
    .navbar-inner {
      max-width: 1400px;
      margin: 0 auto;
    }
    .logo-text {
      font-family: 'Bebas Neue', cursive;
      font-size: 1.8rem;
      color: #fff;
      letter-spacing: 3px;
    }
    .text-gold { color: var(--gym-gold); }
    .navbar-links a {
      color: var(--gym-text-muted);
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      transition: color 0.2s;
      text-decoration: none;
      &:hover, &.active { color: var(--gym-gold); }
    }
    .profile-link {
      color: var(--gym-text-primary);
      font-weight: 600;
      text-decoration: none;
      &:hover { color: var(--gym-gold); }
    }
    .lang-label {
      color: var(--gym-text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .lang-select {
      background: #111;
      color: var(--gym-text-primary);
      border: 1px solid var(--gym-border);
      border-radius: 6px;
      padding: 0.35rem 0.5rem;
      font-size: 0.8rem;
    }
  `]
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private i18n = inject(I18nService);

  isLoggedIn = this.auth.isLoggedIn;
  username = computed(() => this.auth.currentUser()?.ime ?? '');

  isAdmin = computed(() => this.auth.hasRole('ADMIN'));
  isAdminOrZaposleni = computed(() => this.auth.hasRole('ADMIN', 'ZAPOSLENI'));

  currentLanguage(): string {
    return this.i18n.currentLanguage();
  }

  onLanguageChange(language: string): void {
    if (language === 'sr' || language === 'en' || language === 'de') {
      this.i18n.setLanguage(language);
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
