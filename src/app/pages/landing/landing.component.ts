import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgramiService } from '../../core/services/programi.service';
import { Program } from '../../core/models/program.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, Button, Card, TranslateModule],
  template: `
    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content text-center">
        <div class="hero-badge mb-3">{{ 'LANDING.BADGE' | translate }}</div>
        <h1 class="hero-title">{{ 'LANDING.TITLE' | translate }}<br><span class="text-gold">{{ 'LANDING.TITLE_STRONG' | translate }}</span> {{ 'LANDING.TITLE_END' | translate }}</h1>
        <p class="hero-subtitle mt-3">{{ 'LANDING.SUBTITLE' | translate }}</p>
        <div class="hero-cta flex justify-content-center gap-3 mt-5">
          <a routerLink="/register">
            <p-button [label]="'LANDING.START' | translate" icon="pi pi-arrow-right" iconPos="right" size="large" styleClass="btn-gym-primary" />
          </a>
          <a routerLink="/about">
            <p-button [label]="'LANDING.LEARN_MORE' | translate" icon="pi pi-info-circle" size="large" [outlined]="true" />
          </a>
        </div>
      </div>
      <div class="hero-scroll-indicator">
        <i class="pi pi-chevron-down"></i>
      </div>
    </section>

    <!-- PREDNOSTI -->
    <section class="section features-section">
      <h2 class="section-title">{{ 'LANDING.WHY' | translate }}</h2>
      <div class="grid max-w-6xl mx-auto">
        <div class="col-12 md:col-4" *ngFor="let f of features">
          <p-card styleClass="feature-card text-center h-full">
            <div class="feature-icon mb-3">
              <i [class]="f.icon"></i>
            </div>
            <h3 class="feature-title">{{ f.title | translate }}</h3>
            <p class="feature-desc">{{ f.desc | translate }}</p>
          </p-card>
        </div>
      </div>
    </section>

    <!-- STATISTIKE -->
    <section class="section stats-section">
      <div class="stats-inner grid max-w-4xl mx-auto text-center">
        <div class="col-6 md:col-3" *ngFor="let s of stats">
          <div class="stat-number">{{ s.value }}</div>
          <div class="stat-label">{{ s.label | translate }}</div>
        </div>
      </div>
    </section>

    <!-- PROGRAMI PREVIEW -->
    <section class="section programs-section">
      <h2 class="section-title">{{ 'LANDING.PROGRAMS' | translate }}</h2>
      <div *ngIf="programs.length > 0" class="grid max-w-6xl mx-auto">
        <div class="col-12 md:col-4" *ngFor="let p of programs.slice(0, 3)">
          <p-card styleClass="program-card h-full">
            <ng-template pTemplate="header">
              <div class="program-card-header flex align-items-center gap-2 p-3">
                <i class="pi pi-bolt text-xl" style="color: var(--gym-gold)"></i>
                <span class="program-card-title">{{ p.naziv }}</span>
              </div>
            </ng-template>
            <p class="program-desc">{{ p.opis }}</p>
            <div class="program-meta mt-3">
              <i class="pi pi-clock mr-2" style="color: var(--gym-gold)"></i>
                <span>{{ p.trajanjeMeseci }} {{ 'LANDING.MONTHS' | translate }}</span>
              <span class="ml-3">
                <i class="pi pi-tag mr-2" style="color: var(--gym-gold)"></i>{{ p.cena | number:'1.0-0' }} RSD
              </span>
            </div>
          </p-card>
        </div>
      </div>
      <div class="text-center mt-4">
        <a routerLink="/programi">
          <p-button [label]="'LANDING.ALL_PROGRAMS' | translate" icon="pi pi-list" styleClass="btn-gym-primary" />
        </a>
      </div>
    </section>

    <!-- CTA BANER -->
    <section class="cta-section">
      <div class="cta-inner text-center">
        <h2 class="cta-title">{{ 'LANDING.READY' | translate }}</h2>
        <p class="cta-desc">{{ 'LANDING.READY_DESC' | translate }}</p>
        <a routerLink="/register">
          <p-button [label]="'LANDING.REGISTER_FREE' | translate" icon="pi pi-star" iconPos="right" size="large" styleClass="btn-gym-primary mt-4" />
        </a>
      </div>
    </section>
  `,
  styles: [`
    /* HERO */
    .hero-section {
      position: relative;
      min-height: 100vh;
      background: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600') center/cover no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      padding: 2rem;
    }
    .hero-badge {
      display: inline-block;
      background: var(--gym-gold);
      color: #000;
      font-weight: 700;
      font-size: 0.75rem;
      letter-spacing: 3px;
      padding: 0.4rem 1.2rem;
      border-radius: 2px;
    }
    .hero-title {
      font-family: 'Bebas Neue', cursive;
      font-size: clamp(3rem, 10vw, 6rem);
      line-height: 1;
      color: #fff;
      letter-spacing: 4px;
    }
    .text-gold { color: var(--gym-gold); }
    .hero-subtitle {
      color: rgba(255,255,255,0.8);
      font-size: 1.1rem;
      max-width: 500px;
      margin: 0 auto;
    }
    .hero-scroll-indicator {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      color: var(--gym-gold);
      font-size: 1.5rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
    }

    /* FEATURES */
    .features-section { background: var(--gym-dark-bg); }
    .feature-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-border) !important; transition: transform 0.3s, border-color 0.3s !important; }
    .feature-card:hover { transform: translateY(-5px); border-color: var(--gym-gold) !important; }
    .feature-icon { font-size: 2.5rem; color: var(--gym-gold); }
    .feature-title { font-family: 'Bebas Neue', cursive; font-size: 1.4rem; letter-spacing: 2px; color: #fff; margin-bottom: 0.5rem; }
    .feature-desc { color: var(--gym-text-muted); font-size: 0.9rem; line-height: 1.6; }

    /* STATS */
    .stats-section { background: var(--gym-gold); padding: 3rem 2rem; }
    .stat-number { font-family: 'Bebas Neue', cursive; font-size: 3.5rem; color: #000; letter-spacing: 2px; }
    .stat-label { font-weight: 700; font-size: 0.85rem; color: rgba(0,0,0,0.7); text-transform: uppercase; letter-spacing: 2px; }

    /* PROGRAMS */
    .programs-section { background: #111; }
    .program-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-border) !important; }
    .program-card-header { background: #111; border-bottom: 1px solid var(--gym-border); }
    .program-card-title { font-family: 'Bebas Neue', cursive; font-size: 1.2rem; letter-spacing: 1px; color: #fff; }
    .program-desc { color: var(--gym-text-muted); font-size: 0.9rem; line-height: 1.6; }
    .program-meta { color: var(--gym-text-muted); font-size: 0.85rem; }

    /* CTA */
    .cta-section {
      padding: 5rem 2rem;
      background: linear-gradient(135deg, #1a1a2e 0%, #0d0d0d 100%);
      border-top: 2px solid var(--gym-gold);
    }
    .cta-title { font-family: 'Bebas Neue', cursive; font-size: clamp(2rem, 5vw, 3rem); color: var(--gym-gold); letter-spacing: 3px; }
    .cta-desc { color: var(--gym-text-muted); font-size: 1rem; }

    .max-w-6xl { max-width: 1200px; margin-left: auto; margin-right: auto; }
    .max-w-4xl { max-width: 900px; margin-left: auto; margin-right: auto; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class LandingComponent implements OnInit {
  private programiService = inject(ProgramiService);
  programs: Program[] = [];

  features = [
    { icon: 'pi pi-users text-5xl', title: 'LANDING.FEATURE_1_TITLE', desc: 'LANDING.FEATURE_1_DESC' },
    { icon: 'pi pi-star text-5xl', title: 'LANDING.FEATURE_2_TITLE', desc: 'LANDING.FEATURE_2_DESC' },
    { icon: 'pi pi-heart text-5xl', title: 'LANDING.FEATURE_3_TITLE', desc: 'LANDING.FEATURE_3_DESC' },
  ];

  stats = [
    { value: '500+', label: 'LANDING.STAT_MEMBERS' },
    { value: '15', label: 'LANDING.STAT_COACHES' },
    { value: '30+', label: 'LANDING.STAT_PROGRAMS' },
    { value: '10', label: 'LANDING.STAT_YEARS' },
  ];

  ngOnInit(): void {
    this.programiService.getAll().subscribe({
      next: (data) => this.programs = data,
      error: () => {}
    });
  }
}
