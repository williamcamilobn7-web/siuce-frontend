import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../../core/services/sesion.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private router = inject(Router);
  private sesion = inject(SesionService);

  // Solo DISCIPLINA y DOCENTE pueden crear reportes
  puedeCrear = ['DISCIPLINA', 'DOCENTE'].includes(localStorage.getItem('rol') || '');

  logout() { this.sesion.logout(); }
  nuevo() { this.router.navigate(['/reportes']); }
}