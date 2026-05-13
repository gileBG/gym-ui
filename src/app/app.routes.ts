import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ZAPOSLENI'] },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'korisnici',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/korisnici/korisnici-lista/korisnici-lista.component').then(m => m.KorisniciListaComponent)
      },
      {
        path: 'korisnici/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/korisnici/korisnik-detalj/korisnik-detalj.component').then(m => m.KorisnikDetaljComponent)
      },
      {
        path: 'zaposleni',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/zaposleni/zaposleni.component').then(m => m.ZaposleniComponent)
      },
      {
        path: 'programi',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/programi/programi-lista/programi-lista.component').then(m => m.ProgramiListaComponent)
      },
      {
        path: 'programi/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/programi/program-detalj/program-detalj.component').then(m => m.ProgramDetaljComponent)
      },
      {
        path: 'clanarine',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ZAPOSLENI'] },
        loadComponent: () => import('./pages/clanarine/clanarine.component').then(m => m.ClanarineComponent)
      },
      {
        path: 'profil',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profil/profil.component').then(m => m.ProfilComponent)
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
      }
    ]
  }
];
