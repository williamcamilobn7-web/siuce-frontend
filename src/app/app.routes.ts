import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

// AuthGuard como función
const authGuard = () => {
  const router = inject(Router);
  if (localStorage.getItem('token')) return true;
  router.navigate(['/login']);
  return false;
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  
  // Todas las rutas protegidas con authGuard
  { path: 'dashboard',   canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'reportes',    canActivate: [authGuard], loadComponent: () => import('./pages/reportes/reportes').then(m => m.ReportesComponent) },
  { path: 'reportes/:id',canActivate: [authGuard], loadComponent: () => import('./pages/detalle/detalle').then(m => m.DetalleComponent) },
  { path: 'estudiantes', canActivate: [authGuard], loadComponent: () => import('./pages/estudiantes/estudiantes').then(m => m.EstudiantesComponent) },
  { path: 'mapa', canActivate: [authGuard], loadComponent: () => import('./pages/mapa/mapa').then(m => m.MapaComponent) },
  { path: 'oauth-callback', loadComponent: () => import('./pages/oauth-callback/oauth-callback').then(m => m.OauthCallbackComponent) },
  { path: 'acudientes',  canActivate: [authGuard], loadComponent: () => import('./pages/acudientes/acudientes').then(m => m.AcudientesComponent) },
];