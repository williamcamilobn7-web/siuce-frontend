import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';

/**
 * Pantalla a la que vuelve el navegador después de entrar con Google o GitHub.
 * El servidor lo redirige a  /oauth-callback#token=...  (o  #error=codigo  si algo falló).
 */
@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;color:#8fa4be;font-size:14px">
               Iniciando sesión…
             </div>`
})
export class OauthCallbackComponent implements OnInit {
  private api    = inject(ApiService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  private mensajes: Record<string, string> = {
    cuenta_no_vinculada: 'Tu cuenta no está vinculada a ningún usuario del sistema. Pide al coordinador que registre tu correo.',
    email_no_verificado: 'El correo de tu cuenta no está verificado en ese proveedor.',
    oauth_fallido: 'No se pudo completar el inicio de sesión.'
  };

  ngOnInit() {
    // El token viene en el fragmento (#), que el navegador nunca envía a ningún servidor
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('token');
    const error = params.get('error');
    // Se quita de la barra de direcciones y del historial para que no quede a la vista
    window.history.replaceState(null, '', window.location.pathname);

    if (!token) {
      this.toast.show(this.mensajes[error ?? ''] ?? 'No se pudo iniciar sesión', 'err');
      this.router.navigate(['/login']);
      return;
    }

    // Se guarda el token y se piden los datos del usuario (rol, nombre y sus reportes si aplica)
    localStorage.setItem('token', token);
    this.api.get<any>('/api/auth/me').subscribe({
      next: res => {
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('nombreCompleto', res.nombreCompleto);
        localStorage.setItem('username', res.username);
        if (res.misReportes) localStorage.setItem('misReportes', JSON.stringify(res.misReportes));
        if (res.reportesAcudidos) localStorage.setItem('reportesAcudidos', JSON.stringify(res.reportesAcudidos));
        this.toast.show('Bienvenido, ' + res.nombreCompleto);
        this.router.navigate(['/dashboard']);
      },
      error: () => { localStorage.clear(); this.router.navigate(['/login']); }
    });
  }
}