// core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // 1. Buscar el token en localStorage
    const token = localStorage.getItem('token');
    
    // 2. Si NO hay token, redirigir al login
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // 3. Si hay token, permitir el acceso
    return true;
  }
}