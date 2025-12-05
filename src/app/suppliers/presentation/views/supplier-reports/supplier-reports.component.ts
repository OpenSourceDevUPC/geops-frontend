import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-supplier-reports',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './supplier-reports.component.html',
  styleUrls: ['./supplier-reports.component.css']
})
export class SupplierReportsComponent {
  businessName = 'Aruma';

  // Datos de las campañas en formato JSON
  campaignsData = [
    {
      id: "c1",
      name: "Lanzamiento Makis 2x1",
      status: "Activa",
      imp: 15420,
      clicks: 1210,
      ctr: 7.8
    },
    {
      id: "c2",
      name: "Semana del Cine -10%",
      status: "Pausada",
      imp: 8200,
      clicks: 430,
      ctr: 5.2
    },
    {
      id: "c3",
      name: "Back to School - Parque",
      status: "Finalizada",
      imp: 6600,
      clicks: 310,
      ctr: 4.7
    }
  ];

  get jsonData(): string {
    return JSON.stringify(this.campaignsData, null, 2);
  }

  exportToCSV() {
    // Crear el contenido CSV
    const headers = ['ID', 'Nombre', 'Estado', 'Impresiones', 'Clics', 'CTR'];
    const rows = this.campaignsData.map(campaign => [
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.imp.toString(),
      campaign.clicks.toString(),
      campaign.ctr.toString()
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `reportes_campañas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

