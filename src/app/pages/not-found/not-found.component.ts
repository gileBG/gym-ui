import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, Button, TranslateModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content text-center">
        <div class="error-code">404</div>
        <div class="error-divider"></div>
        <h2 class="error-msg">{{ 'NOT_FOUND.TITLE' | translate }}</h2>
        <p class="error-sub">{{ 'NOT_FOUND.SUBTITLE' | translate }}</p>
        <a routerLink="/">
          <p-button [label]="'NOT_FOUND.BACK_HOME' | translate" icon="pi pi-home" styleClass="btn-gym-primary mt-4" />
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .error-code {
      font-family: 'Bebas Neue', cursive;
      font-size: clamp(6rem, 20vw, 12rem);
      color: var(--gym-gold);
      line-height: 1;
      letter-spacing: 10px;
    }
    .error-divider {
      width: 100px; height: 3px;
      background: var(--gym-gold);
      margin: 1rem auto;
    }
    .error-msg {
      font-family: 'Bebas Neue', cursive;
      font-size: 1.8rem;
      color: #fff;
      letter-spacing: 3px;
    }
    .error-sub { color: var(--gym-text-muted); font-size: 1rem; }
  `]
})
export class NotFoundComponent {}
