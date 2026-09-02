// dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router'; // ← NUEVO: importar Router
import { ApiService } from '../../core/services/api.service';
import { Reporte, Estadisticas } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router); // 
  stats: Estadisticas | null = null;
  recientes: Reporte[] = [];
  rol = localStorage.getItem('rol') || '';
  nombreCompleto = localStorage.getItem('nombreCompleto') || 'Usuario';
  misReportes: any[] = JSON.parse(localStorage.getItem('misReportes') || '[]');
  reportesAcudidos: any[] = JSON.parse(localStorage.getItem('reportesAcudidos') || '[]');

  ngOnInit() {
    if (['DISCIPLINA','DOCENTE'].includes(this.rol)) {
      this.api.get<Estadisticas>('/api/reportes/estadisticas').subscribe(s => {
        this.stats = s;
        setTimeout(() => this.initCharts(s), 100);
      });
      this.api.get<Reporte[]>('/api/reportes').subscribe(r => {
        this.recientes = [...r].reverse().slice(0, 5);
      });
    }
  }

  initCharts(s: Estadisticas) {
    const Chart = (window as any).Chart;
    if (!Chart) return;
    const ctxT = (document.getElementById('chartTipo') as HTMLCanvasElement)?.getContext('2d');
    if (ctxT) new Chart(ctxT, {
      type: 'bar',
      data: { labels: ['Tipo I','Tipo II','Tipo III'],
        datasets: [{ data: [s.porTipo['TIPO_I']||0, s.porTipo['TIPO_II']||0, s.porTipo['TIPO_III']||0],
          backgroundColor: ['rgba(34,197,94,.25)','rgba(245,158,11,.25)','rgba(239,68,68,.25)'],
          borderColor: ['#22c55e','#f59e0b','#ef4444'], borderWidth: 1.5, borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#8fa4be' } },
                  y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#8fa4be', stepSize: 1 } } } }
    });
  }

  tipoLabel(t: string) { return t==='TIPO_I'?'Tipo I':t==='TIPO_II'?'Tipo II':'Tipo III'; }
  
  fmtFecha(iso: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-CO', {day:'2-digit', month:'short', year:'numeric'});
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}