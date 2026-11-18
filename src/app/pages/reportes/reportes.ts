import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';
import { Reporte, Estudiante } from '../../core/models/models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  todos: Reporte[] = [];
  filtrados: Reporte[] = [];
  filtroTipo = ''; filtroEstado = '';
  loading = true;
  modalOpen = false;
  editando: Reporte | null = null;
  form = { lugar: '', descripcionHecho: '' };
  tipoPreview = '';

  // Implicados que se asignarán al crear el reporte
  implicadosParaCrear: { estudiante: Estudiante; rol: 'VICTIMA' | 'AGRESOR' | 'TESTIGO' }[] = [];
  busquedaEstudiante = '';
  estudiantesFiltrados: Estudiante[] = [];
  buscando = false;
  nuevoImplicado: { estudianteId: string; rol: 'VICTIMA' | 'AGRESOR' | 'TESTIGO' } = {
    estudianteId: '',
    rol: 'VICTIMA'
  };

  // Permisos según el rol (el backend también los valida; esto solo oculta botones)
  rol = localStorage.getItem('rol') || '';
  esDisciplina = this.rol === 'DISCIPLINA';
  esRector = this.rol === 'RECTOR';
  puedeCrear = ['DISCIPLINA', 'DOCENTE'].includes(this.rol);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    this.api.get<Reporte[]>('/api/reportes').subscribe({
      next: d => { this.todos = [...d].reverse(); this.aplicarFiltros(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  aplicarFiltros() {
    this.filtrados = this.todos.filter(r =>
      (!this.filtroTipo   || r.tipoFalta === this.filtroTipo) &&
      (!this.filtroEstado || r.estado    === this.filtroEstado)
    );
  }

  abrirCrear() {
    this.editando = null;
    this.form = { lugar: '', descripcionHecho: '' };
    this.tipoPreview = '';
    this.implicadosParaCrear = [];
    this.busquedaEstudiante = '';
    this.estudiantesFiltrados = [];
    this.nuevoImplicado = { estudianteId: '', rol: 'VICTIMA' };
    this.modalOpen = true;
  }

  abrirEditar(r: Reporte) {
    this.editando = r;
    this.form = { lugar: r.lugar, descripcionHecho: r.descripcionHecho };
    this.calcTipo();
    this.modalOpen = true;
  }

  calcTipo() {
    const d = this.form.descripcionHecho.toLowerCase();
    const t3 = ['arma','cuchillo','pistola','violencia sexual','abuso sexual','agresion fisica grave','hospitaliz','delito','herida','sangre','fractura'];
    const t2 = ['bullying','acoso','ciberacoso','intimidacion','amenaza','golpe','pelea repetida','matoneo'];
    if (t3.some(p => d.includes(p))) this.tipoPreview='TIPO_III';
    else if (t2.some(p => d.includes(p))) this.tipoPreview='TIPO_II';
    else this.tipoPreview = d.length > 5 ? 'TIPO_I' : '';
  }

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

  nombreEstudiante(e: Estudiante) {
    return `${e.nombres} ${e.apellidos} (${e.numeroDocumento})`;
  }

  agregarImplicadoTemporal() {
    if (!this.nuevoImplicado.estudianteId) {
      this.toast.show('Selecciona un estudiante', 'err');
      return;
    }
    const yaExiste = this.implicadosParaCrear.some(i => String(i.estudiante.id) === String(this.nuevoImplicado.estudianteId));
    if (yaExiste) {
      this.toast.show('Ese estudiante ya está en la lista de implicados', 'err');
      return;
    }
    const est = this.estudiantesFiltrados.find(e => String(e.id) === String(this.nuevoImplicado.estudianteId));
    if (!est) return;

    this.implicadosParaCrear.push({
      estudiante: est,
      rol: this.nuevoImplicado.rol
    });

    this.nuevoImplicado.estudianteId = '';
    this.toast.show('Implicado añadido a la lista');
  }

  quitarImplicadoTemporal(index: number) {
    this.implicadosParaCrear.splice(index, 1);
  }

  guardar() {
    if (!this.form.lugar.trim() || !this.form.descripcionHecho.trim()) {
      this.toast.show('Completa todos los campos obligatorios', 'err'); return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => this.enviarReporte(pos.coords.latitude, pos.coords.longitude),
        ()  => this.enviarReporte(null, null)
      );
    } else {
      this.enviarReporte(null, null);
    }
  }

  enviarReporte(latitud: number | null, longitud: number | null) {
    const body: any = { ...this.form };
    if (latitud) body.latitud = latitud;
    if (longitud) body.longitud = longitud;

    if (!this.editando && this.implicadosParaCrear.length > 0) {
      body.implicados = this.implicadosParaCrear.map(i => ({
        estudianteId: i.estudiante.id,
        rol: i.rol,
        acudienteId: i.estudiante.acudiente?.id
      }));
    }

    const obs = this.editando
      ? this.api.put<any>(`/api/reportes/${this.editando.id}`, body)
      : this.api.post<any>('/api/reportes', body);
    obs.subscribe({
      next: () => {
        this.toast.show(this.editando ? 'Actualizado' : 'Reporte creado con éxito');
        this.modalOpen = false;
        this.cargar();
      },
      error: () => {}
    });
  }

  eliminar(r: Reporte) {
    if (!confirm(`¿Eliminar reporte #${r.id}?`)) return;
    this.api.delete(`/api/reportes/${r.id}`).subscribe({ next:()=>{ this.toast.show('Eliminado'); this.cargar(); }, error:()=>{} });
  }

  firmar(r: Reporte) {
    if (!confirm(`¿Firmar reporte #${r.id}?`)) return;
    this.api.post(`/api/reportes/${r.id}/firmar`, {}).subscribe({ next:()=>{ this.toast.show('Firmado'); this.cargar(); }, error:()=>{} });
  }

  tipoLabel(t: string) { return t==='TIPO_I'?'Tipo I · Leve':t==='TIPO_II'?'Tipo II · Moderado':'Tipo III · Grave'; }
  fmtFecha(iso: string) { return iso ? new Date(iso).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}) : '—'; }
}
