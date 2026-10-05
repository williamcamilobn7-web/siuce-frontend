import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';
import { Reporte, Implicado, Estudiante, Acudiente, SiuceFormato } from '../../core/models/models';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss'
})
export class DetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  reporte: Reporte | null = null;
  implicados: Implicado[] = [];
  estudiantes: Estudiante[] = [];
  acudientes: Acudiente[] = [];
  loading = true;
  modalImp = false;
  siuceOpen = false;
  siuceData: SiuceFormato | null = null;
  impForm: any = { estudianteId:'', rol:'', acudienteId:'' };
  busquedaEstudiante = '';
  estudiantesFiltrados: Estudiante[] = [];
  buscando = false;

  // Permisos según el rol (el backend también los valida; esto solo oculta botones)
  rol = localStorage.getItem('rol') || '';
  esRector = this.rol === 'RECTOR';
  esDisciplina = this.rol === 'DISCIPLINA';
  puedeAgregarImp = ['DISCIPLINA', 'DOCENTE'].includes(this.rol);
  puedeSiuce = ['DISCIPLINA', 'RECTOR'].includes(this.rol);

  ngOnInit() {
    // El id de Mongo es un texto, no un número: no se convierte con Number()
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.get<Reporte>(`/api/reportes/${id}`).subscribe(r => { this.reporte = r; this.loading = false; });
    if (this.puedeSiuce || this.puedeAgregarImp) {
      this.api.get<Implicado[]>(`/api/reportes/${id}/implicados`).subscribe(i => this.implicados = i);
      this.api.get<Acudiente[]>('/api/acudientes').subscribe(a => this.acudientes = a);
    }
    this.estudiantesFiltrados = [];
  }

  reload() {
    const id = this.reporte!.id;
    this.api.get<Reporte>(`/api/reportes/${id}`).subscribe(r => this.reporte = r);
    this.api.get<Implicado[]>(`/api/reportes/${id}/implicados`).subscribe(i => this.implicados = i);
  }

  firmar() {
    if (!confirm('¿Firmar este reporte?')) return;
    this.api.post(`/api/reportes/${this.reporte!.id}/firmar`, {}).subscribe({
      next: () => { this.toast.show('Firmado correctamente'); this.reload(); }, error:()=>{}
    });
  }

  abrirSiuce() {
    this.siuceOpen = true; this.siuceData = null;
    this.api.post<SiuceFormato>(`/api/reportes/${this.reporte!.id}/enviar-siuce`, {}).subscribe({
      next: d => this.siuceData = d, error:()=>{}
    });
  }

  guardarImp() {
    if (!this.impForm.estudianteId || !this.impForm.rol) { this.toast.show('Estudiante y rol son obligatorios','err'); return; }
    this.api.post(`/api/reportes/${this.reporte!.id}/implicados`, this.impForm).subscribe({
      next: () => { this.toast.show('Implicado agregado'); this.modalImp=false; this.reload(); }, error:()=>{}
    });
  }

  eliminarImp(imp: Implicado) {
    if (!confirm('¿Eliminar implicado?')) return;
    this.api.delete(`/api/reportes/${this.reporte!.id}/implicados/${imp.id}`).subscribe({
      next: () => { this.toast.show('Eliminado'); this.reload(); }, error:()=>{}
    });
  }

  tipoLabel(t: string) { return t==='TIPO_I'?'Tipo I · Leve':t==='TIPO_II'?'Tipo II · Moderado':'Tipo III · Grave'; }
  fmtFecha(iso: string) { return iso ? new Date(iso).toLocaleString('es-CO') : '—'; }
  nombreEstudiante(e: Estudiante) { return `${e.nombres} ${e.apellidos} (${e.numeroDocumento})`; }

  buscarEstudiantes() {
    if (this.busquedaEstudiante.trim().length < 2) {
      this.estudiantesFiltrados = [];
      return;
    }
    this.buscando = true;
    this.api.get<Estudiante[]>(`/api/estudiantes/buscar?q=${encodeURIComponent(this.busquedaEstudiante)}`)
      .subscribe({
        next: r => { this.estudiantesFiltrados = r; this.buscando = false; },
        error: () => this.buscando = false
      });
  }
}