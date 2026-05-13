import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, Button, Card, TranslateModule],
  template: `
    <!-- Hero -->
    <section class="about-hero">
      <div class="about-hero-overlay"></div>
      <div class="about-hero-content text-center">
        <h1 class="about-title">{{ 'ABOUT.TITLE' | translate }}</h1>
        <p class="about-subtitle">{{ 'ABOUT.SUBTITLE' | translate }}</p>
      </div>
    </section>

    <!-- Priča -->
    <section class="section about-story">
      <div class="max-w-5xl mx-auto grid align-items-center">
        <div class="col-12 md:col-6">
          <h2 class="section-title text-left">{{ 'ABOUT.STORY_TITLE' | translate }}</h2>
          <p class="about-text">{{ 'ABOUT.STORY_TEXT_1' | translate }}</p>
          <p class="about-text mt-3">{{ 'ABOUT.STORY_TEXT_2' | translate }}</p>
        </div>
        <div class="col-12 md:col-6 flex justify-content-center">
          <div class="about-image-placeholder flex align-items-center justify-content-center">
            <i class="pi pi-bolt" style="font-size: 8rem; color: var(--gym-gold)"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Tim -->
    <section class="section team-section">
      <h2 class="section-title">{{ 'ABOUT.TEAM_TITLE' | translate }}</h2>
      <div class="grid max-w-5xl mx-auto">
        <div class="col-12 md:col-4" *ngFor="let member of team">
          <p-card styleClass="team-card text-center">
            <div class="team-avatar flex align-items-center justify-content-center mb-3">
              <i class="pi pi-user"></i>
            </div>
            <h3 class="team-name">{{ member.name }}</h3>
            <p class="team-role">{{ member.role }}</p>
            <p class="team-bio">{{ member.bio }}</p>
          </p-card>
        </div>
      </div>
    </section>

    <!-- Vrednosti -->
    <section class="section values-section">
      <h2 class="section-title">{{ 'ABOUT.VALUES_TITLE' | translate }}</h2>
      <div class="grid max-w-4xl mx-auto">
        <div class="col-12 md:col-6" *ngFor="let v of values">
          <div class="value-item flex align-items-start gap-3">
            <i [class]="v.icon + ' text-2xl mt-1'" style="color: var(--gym-gold)"></i>
            <div>
              <h4 class="value-title">{{ v.title }}</h4>
              <p class="value-desc">{{ v.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta text-center">
      <h2 class="cta-title">{{ 'ABOUT.JOIN' | translate }}</h2>
      <a routerLink="/register">
        <p-button [label]="'ABOUT.JOIN_CTA' | translate" icon="pi pi-arrow-right" iconPos="right" size="large" styleClass="btn-gym-primary mt-3" />
      </a>
    </section>
  `,
  styles: [`
    .about-hero {
      position: relative;
      height: 40vh;
      background: url('https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600') center/cover no-repeat;
      display: flex; align-items: center; justify-content: center;
    }
    .about-hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.75); }
    .about-hero-content { position: relative; z-index: 1; }
    .about-title { font-family: 'Bebas Neue', cursive; font-size: 4rem; color: var(--gym-gold); letter-spacing: 5px; }
    .about-subtitle { color: rgba(255,255,255,0.8); font-size: 1.1rem; }
    .about-story { background: var(--gym-dark-bg); }
    .about-text { color: var(--gym-text-muted); line-height: 1.8; font-size: 1rem; }
    .about-image-placeholder {
      width: 300px; height: 300px;
      background: var(--gym-card-bg);
      border: 2px solid var(--gym-gold);
      border-radius: 8px;
    }
    .team-section { background: #111; }
    .team-card { background: var(--gym-card-bg) !important; border: 1px solid var(--gym-border) !important; }
    .team-avatar {
      width: 80px; height: 80px;
      background: var(--gym-gold);
      border-radius: 50%;
      margin: 0 auto;
      i { font-size: 2.5rem; color: #000; }
    }
    .team-name { font-family: 'Bebas Neue', cursive; font-size: 1.3rem; letter-spacing: 2px; color: #fff; }
    .team-role { color: var(--gym-gold); font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
    .team-bio { color: var(--gym-text-muted); font-size: 0.9rem; margin-top: 0.5rem; }
    .values-section { background: var(--gym-dark-bg); }
    .value-item { padding: 1rem; }
    .value-title { font-family: 'Bebas Neue', cursive; font-size: 1.2rem; color: #fff; letter-spacing: 1px; margin-bottom: 0.3rem; }
    .value-desc { color: var(--gym-text-muted); font-size: 0.9rem; }
    .about-cta { padding: 4rem 2rem; background: linear-gradient(135deg, #1a1a2e, #0d0d0d); border-top: 2px solid var(--gym-gold); }
    .cta-title { font-family: 'Bebas Neue', cursive; font-size: 2.5rem; color: var(--gym-gold); letter-spacing: 3px; }
    .max-w-5xl { max-width: 1000px; margin-left: auto; margin-right: auto; }
    .max-w-4xl { max-width: 900px; margin-left: auto; margin-right: auto; }
    .mx-auto { margin-left: auto; margin-right: auto; }
  `]
})
export class AboutComponent {
  team = [
    { name: 'Marko Petrović', role: 'Osnivač & Head Coach', bio: 'Sertifikovani trener sa 12 godina iskustva u powerlifting-u i funkcionalnom treningu.' },
    { name: 'Ana Jovanović', role: 'Yoga & Wellness trener', bio: 'Specijalistkinja za mindfulness i holističke treninge. Certifikovana RYT-500 instruktorka.' },
    { name: 'Stefan Nikolić', role: 'Strength & Conditioning', bio: 'Bivši profesionalni atletičar, specijalizovan za snagu i kondicioni trening.' },
  ];

  values = [
    { icon: 'pi pi-shield', title: 'Bezbednost na prvom mestu', desc: 'Svaki trening planiranm sa fokusom na ispravnu tehniku i prevenciju povreda.' },
    { icon: 'pi pi-users', title: 'Zajednica', desc: 'Gradimo podsticajnu zajednicu gde svaki član oseća podršku i motivaciju.' },
    { icon: 'pi pi-chart-line', title: 'Rezultati', desc: 'Merljivi napredak kroz personalizovane treninge prilagođene tvojim ciljevima.' },
    { icon: 'pi pi-heart', title: 'Strast', desc: 'Volimo ono što radimo i ta energija se prenosi na svakog člana koji uđe kroz naša vrata.' },
  ];
}
