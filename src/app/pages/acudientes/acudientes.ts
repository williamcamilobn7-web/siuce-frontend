import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/toast/toast';
import { Acudiente } from '../../core/models/models';

@Component({
  selector: 'app-acudientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './acudientes.html',
  styleUrl: './acudientes.scss'
})
export class AcudientesComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);
  lista: Acudiente[] = [];
  form = { nombreCompleto:'', telefono:'', email:'' };

  ngOnInit() { this.cargar(); }
  cargar() { this.api.get<Acudiente[]>('/api/acudientes').subscribe(d => this.lista = d); }

  guardar() {
    if (!this.form.nombreCompleto) { this.toast.show('El nombre es obligatorio','err'); return; }
    this.api.post<Acudiente>('/api/acudientes', this.form).subscribe({
      next:()=>{ this.toast.show('Acudiente guardado'); this.form={nombreCompleto:'',telefono:'',email:''}; this.cargar(); }, error:()=>{}
    });
  }

  notificar(a: Acudiente) {
    this.api.put(`/api/acudientes/${a.id}/notificar`, {}).subscribe({
      next:()=>{ this.toast.show('Notificado'); this.cargar(); }, error:()=>{}
    });
  }
}