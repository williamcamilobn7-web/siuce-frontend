import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private api = inject(ApiService);
  private router = inject(Router);

  // Primero se revoca el token en el servidor; pase lo que pase, se limpia la sesión local
  logout() {
    const limpiar = () => { localStorage.clear(); this.router.navigate(['/login']); };
    this.api.post('/api/auth/logout', {}).subscribe({ next: limpiar, error: limpiar });
  }
}