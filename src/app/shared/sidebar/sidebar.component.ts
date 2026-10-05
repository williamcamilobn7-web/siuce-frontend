import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  rol = localStorage.getItem('rol') || '';
  nombre = localStorage.getItem('nombreCompleto') || '';

  // Personal del colegio (incluye al rector)
  esDisciplinaODocente() {
    return ['DISCIPLINA', 'DOCENTE', 'RECTOR'].includes(this.rol);
  }
}