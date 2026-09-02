import { Component, OnInit, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Reporte } from '../../core/models/models';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss'
})
export class MapaComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);
  reportes: Reporte[] = [];
  loading = true;
  private map: any;

  ngOnInit() {
    this.api.get<Reporte[]>('/api/reportes').subscribe(r => {
      this.reportes = r;
      this.loading = false;
      setTimeout(() => this.initMap(), 100);
    });
  }

  ngAfterViewInit() {}

  initMap() {
    const L = (window as any).L;
    if (!L) return;

    this.map = L.map('mapa-container').setView([10.3997, -75.5144], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    const colores: any = {
      TIPO_I:   '#22c55e',
      TIPO_II:  '#f59e0b',
      TIPO_III: '#ef4444'
    };

    this.reportes.forEach(r => {
      if (r.latitud && r.longitud) {
        const color = colores[r.tipoFalta] || '#2f80ed';
        const icono = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14]
        });
        L.marker([r.latitud, r.longitud], { icon: icono })
          .addTo(this.map)
          .bindPopup(`
            <div style="font-family:'DM Sans',sans-serif;min-width:180px">
              <strong>Reporte #${r.id}</strong><br/>
              <span style="color:${color};font-weight:600">${r.tipoFalta.replace('_',' ')}</span><br/>
              <span style="color:#555;font-size:12px">${r.lugar}</span><br/>
              <span style="color:#888;font-size:11px">${new Date(r.fechaHora).toLocaleDateString('es-CO')}</span><br/>
              <span style="color:#888;font-size:11px">Estado: ${r.estado}</span>
            </div>
          `);
      }
    });

    // Marcadores EPS y Policía
    this.api.get<any[]>('/api/entidades-salud').subscribe(eps => {
      eps.forEach(e => {
        if (e.latitud && e.longitud) {
          const icono = L.divIcon({
            className: '',
            html: `<div style="width:16px;height:16px;background:#60a5fa;border:2px solid white;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;color:white">H</div>`,
            iconSize: [16, 16]
          });
          L.marker([e.latitud, e.longitud], { icon: icono })
            .addTo(this.map)
            .bindPopup(`<strong>🏥 ${e.nombre}</strong><br/>${e.direccion}<br/>📞 ${e.telefono}`);
        }
      });
    });

    this.api.get<any[]>('/api/policia').subscribe(pol => {
      pol.forEach(p => {
        if (p.latitud && p.longitud) {
          const icono = L.divIcon({
            className: '',
            html: `<div style="width:16px;height:16px;background:#a78bfa;border:2px solid white;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;color:white">P</div>`,
            iconSize: [16, 16]
          });
          L.marker([p.latitud, p.longitud], { icon: icono })
            .addTo(this.map)
            .bindPopup(`<strong>👮 ${p.nombre}</strong><br/>${p.estacion}<br/>📞 ${p.telefonoEmergencia}`);
        }
      });
    });
  }

  contarPorTipo(tipo: string) {
    return this.reportes.filter(r => r.tipoFalta === tipo).length;
  }

  conUbicacion() {
    return this.reportes.filter(r => r.latitud && r.longitud).length;
  }
}