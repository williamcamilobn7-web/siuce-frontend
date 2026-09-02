import { Component, inject } from '@angular/core';
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

  esDisciplinaODocente() {
    return ['DISCIPLINA','DOCENTE'].includes(this.rol);
  }
}