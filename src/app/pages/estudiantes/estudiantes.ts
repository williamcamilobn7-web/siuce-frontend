import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';
import { Estudiante } from '../../core/models/models';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.scss'
})
export class EstudiantesComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  lista: Estudiante[] = [];
  filtrados: Estudiante[] = [];
  busqueda = '';
  loading = true;
  modalOpen = false;
  editando: Estudiante | null = null;
  form: any = { tipoDocumento:'TI', numeroDocumento:'', nombres:'', apellidos:'', fechaNacimiento:'', genero:'', grado:'', jornada:'', sede:'', promedioAcademico:'', numeroInasistencias:0 };

  pagina = 0;
  totalPaginas = 0;
  totalElementos = 0;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    this.api.get<any>(`/api/estudiantes?page=${this.pagina}&size=50`).subscribe({
      next: d => {
        this.lista = d.contenido;
        this.filtrados = d.contenido;
        this.totalElementos = d.totalElementos;
        this.totalPaginas = d.totalPaginas;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  paginaAnterior() { if (this.pagina > 0) { this.pagina--; this.cargar(); } }
  paginaSiguiente() { if (this.pagina < this.totalPaginas-1) { this.pagina++; this.cargar(); } }

  filtrar() {
    const q = this.busqueda.toLowerCase();
    this.filtrados = this.lista.filter(e =>
      e.nombres.toLowerCase().includes(q) ||
      e.apellidos.toLowerCase().includes(q) ||
      e.numeroDocumento.includes(q) ||
      (e.grado||'').toLowerCase().includes(q)
    );
  }

  abrirCrear() { this.editando=null; this.form={tipoDocumento:'TI',numeroDocumento:'',nombres:'',apellidos:'',fechaNacimiento:'',genero:'',grado:'',jornada:'',sede:'',promedioAcademico:'',numeroInasistencias:0}; this.modalOpen=true; }

  abrirEditar(e: Estudiante) { this.editando=e; this.form={...e}; this.modalOpen=true; }

  guardar() {
    if (!this.form.numeroDocumento||!this.form.nombres||!this.form.apellidos) { this.toast.show('Documento, nombres y apellidos son obligatorios','err'); return; }
    const obs = this.editando
      ? this.api.put<Estudiante>(`/api/estudiantes/${this.editando.id}`, this.form)
      : this.api.post<Estudiante>('/api/estudiantes', this.form);
    obs.subscribe({ next:()=>{ this.toast.show(this.editando?'Actualizado':'Creado'); this.modalOpen=false; this.cargar(); }, error:()=>{} });
  }

  eliminar(e: Estudiante) {
    if (!confirm(`¿Eliminar a ${e.nombres} ${e.apellidos}?`)) return;
    this.api.delete(`/api/estudiantes/${e.id}`).subscribe({ next:()=>{ this.toast.show('Eliminado'); this.cargar(); }, error:()=>{} });
  }
  
}