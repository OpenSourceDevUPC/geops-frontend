import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * OwnerToolbarComponent
 *
 * Barra de navegación específica para usuarios con rol OWNER.
 * Muestra las opciones: Resumen, Campañas, Crear, Reportes, Comentarios
 */
@Component({
  selector: 'app-owner-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './owner-toolbar.component.html',
  styleUrls: ['./owner-toolbar.component.css']
})
export class OwnerToolbarComponent {
  /** Secciones del menú de owner */
  menuItems = [
    { label: 'Resumen', route: '/resumen', icon: 'dashboard' },
    { label: 'Campañas', route: '/campañas', icon: 'campaign' },
    { label: 'Crear', route: '/crear-campañas', icon: 'add_circle' },
    { label: 'Reportes', route: '/reportes', icon: 'assessment' },
    { label: 'Comentarios', route: '/comentarios', icon: 'comment' }
  ];

  activeRoute = '/owner-dashboard';

  /**
   * Verifica si una ruta está activa
   */
  isActive(route: string): boolean {
    return this.activeRoute === route;
  }

  /**
   * Navega a una sección
   */
  navigateTo(route: string): void {
    this.activeRoute = route;
  }
}

