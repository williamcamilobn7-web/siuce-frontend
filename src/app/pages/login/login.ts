import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private api    = inject(ApiService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  tipo = 'admin';
  loading = false;
  form = { username: '', password: '' };
  formEst = { numeroDocumento: '', password: '' };

  login() {
    if (!this.form.username || !this.form.password) {
      this.toast.show('Completa todos los campos', 'err'); return;
    }
    this.loading = true;
    this.api.post<any>('/api/auth/login', this.form).subscribe({
      next: res => this.guardarSesion(res),
      error: () => { this.toast.show('Credenciales incorrectas', 'err'); this.loading = false; }
    });
  }

  loginEstudiante() {
    if (!this.formEst.numeroDocumento || !this.formEst.password) {
      this.toast.show('Completa todos los campos', 'err'); return;
    }
    this.loading = true;
    this.api.post<any>('/api/auth/login-estudiante', this.formEst).subscribe({
      next: res => this.guardarSesion(res),
      error: () => { this.toast.show('Documento o contraseña incorrectos', 'err'); this.loading = false; }
    });
  }
  loginGoogle() {
    window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
  }

  guardarSesion(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('rol', res.rol);
    localStorage.setItem('nombreCompleto', res.nombreCompleto);
    localStorage.setItem('username', res.username);
    if (res.misReportes) localStorage.setItem('misReportes', JSON.stringify(res.misReportes));
    if (res.reportesAcudidos) localStorage.setItem('reportesAcudidos', JSON.stringify(res.reportesAcudidos));
    this.toast.show('Bienvenido, ' + res.nombreCompleto);
    this.router.navigate(['/dashboard']);
  }
}