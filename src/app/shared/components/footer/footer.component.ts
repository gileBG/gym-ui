import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <footer class="gym-footer">
      <div class="footer-inner">
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="flex align-items-center gap-2 mb-3">
              <i class="pi pi-bolt text-xl" style="color: var(--gym-gold)"></i>
              <span class="footer-logo">POWER<span style="color: var(--gym-gold)">GYM</span></span>
            </div>
            <p class="footer-desc">{{ 'FOOTER.DESCRIPTION' | translate }}</p>
          </div>
          <div class="col-12 md:col-4">
            <h4 class="footer-heading">{{ 'FOOTER.QUICK_LINKS' | translate }}</h4>
            <ul class="footer-links">
              <li><a routerLink="/">{{ 'NAV.HOME' | translate }}</a></li>
              <li><a routerLink="/about">{{ 'NAV.ABOUT' | translate }}</a></li>
              <li><a routerLink="/programi">{{ 'NAV.PROGRAMS' | translate }}</a></li>
              <li><a routerLink="/login">{{ 'AUTH.LOGIN' | translate }}</a></li>
            </ul>
          </div>
          <div class="col-12 md:col-4">
            <h4 class="footer-heading">{{ 'FOOTER.CONTACT' | translate }}</h4>
            <p><i class="pi pi-map-marker mr-2"></i>{{ 'FOOTER.ADDRESS' | translate }}</p>
            <p><i class="pi pi-phone mr-2"></i>+381 11 123 4567</p>
            <p><i class="pi pi-envelope mr-2"></i>info&#64;powergym.rs</p>
            <div class="social-links mt-3 flex gap-3">
              <i class="pi pi-facebook" style="font-size: 1.4rem; cursor: pointer; color: var(--gym-text-muted);"></i>
              <i class="pi pi-instagram" style="font-size: 1.4rem; cursor: pointer; color: var(--gym-text-muted);"></i>
              <i class="pi pi-twitter" style="font-size: 1.4rem; cursor: pointer; color: var(--gym-text-muted);"></i>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>{{ 'FOOTER.RIGHTS' | translate }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .gym-footer {
      background: #0a0a0a;
      border-top: 2px solid var(--gym-gold);
      color: var(--gym-text-muted);
      padding: 3rem 2rem 1rem;
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .footer-logo {
      font-family: 'Bebas Neue', cursive;
      font-size: 1.5rem;
      color: #fff;
      letter-spacing: 2px;
    }
    .footer-desc { font-size: 0.9rem; line-height: 1.6; }
    .footer-heading {
      font-family: 'Bebas Neue', cursive;
      color: var(--gym-gold);
      letter-spacing: 2px;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    .footer-links {
      list-style: none;
      li { margin-bottom: 0.5rem; }
      a { color: var(--gym-text-muted); font-size: 0.9rem; text-decoration: none; &:hover { color: var(--gym-gold); } }
    }
    p { margin-bottom: 0.5rem; font-size: 0.9rem; }
    .social-links i:hover { color: var(--gym-gold) !important; }
    .footer-bottom {
      border-top: 1px solid var(--gym-border);
      margin-top: 2rem;
      padding-top: 1rem;
      text-align: center;
      font-size: 0.8rem;
    }
  `]
})
export class FooterComponent {}
