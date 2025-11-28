import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * ReportesComponent
 *
 * Vista de reportes para exportar métricas de campañas.
 * Muestra datos en formato JSON y opción de exportar a CSV.
 */
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {
  /** Título de la sección */
  title = 'Exporta las métricas de tus campañas';

  /** Datos de ejemplo en formato JSON */
  campaignsData = [
    {
      id: 'c1',
      name: 'Lanzamiento Makis 2x1',
      status: 'Activa',
      imp: 15420,
      clicks: 1210,
      ctr: 7.8
    },
    {
      id: 'c2',
      name: 'Semana del Cine -10%',
      status: 'Pausada',
      imp: 8200,
      clicks: 430,
      ctr: 5.2
    },
    {
      id: 'c3',
      name: 'Back to School - Parque',
      status: 'Finalizada',
      imp: 6600,
      clicks: 310,
      ctr: 4.7
    }
  ];

  /**
   * Formatea los datos como JSON para mostrar
   */
  getJsonData(): string {
    return JSON.stringify(this.campaignsData, null, 2);
  }

  /**
   * Exporta datos a CSV
   */
  onExportCSV(): void {
    console.log('[Reportes] Exportando a CSV');
    // Convertir a CSV
    const headers = ['ID', 'Nombre', 'Estado', 'Impresiones', 'Clicks', 'CTR'];
    const rows = this.campaignsData.map(c =>
      `${c.id},${c.name},${c.status},${c.imp},${c.clicks},${c.ctr}`
    );

    const csv = [headers.join(','), ...rows].join('\n');

    // Crear descarga
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reportes-campañas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

