import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';

/**
 * Pantalla a la que vuelve el navegador después de entrar con Google.
 * El servidor ya dejó la sesión en una cookie; si algo falló, la dirección trae  #error=codigo.
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
    cuenta_no_vinculada: 'Tu correo de Google no aparece registrado como acudiente. Por favor verifica que uses el correo registrado en el colegio o contacta a la institución.',
    email_no_verificado: 'El correo de tu cuenta no está verificado en Google.',
    oauth_fallido: 'No se pudo completar el inicio de sesión.'
  };

  ngOnInit() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const error = params.get('error');
    window.history.replaceState(null, '', window.location.pathname);

    if (error) {
      this.toast.show(this.mensajes[error] ?? 'No se pudo iniciar sesión', 'err');
      this.router.navigate(['/login']);
      return;
    }

    // La cookie ya está en el navegador: se piden los datos de la persona (rol, nombre y reportes)
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