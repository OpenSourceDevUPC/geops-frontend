import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-supplier-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './supplier-sidebar.component.html',
  styleUrls: ['./supplier-sidebar.component.css']
})
export class SupplierSidebarComponent {
  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Resumen', route: '/suppliers/dashboard' },
    { icon: 'campaign', label: 'Campañas', route: '/suppliers/campaigns' },
    { icon: 'assessment', label: 'Reportes', route: '/suppliers/reports' },
    { icon: 'comment', label: 'Comentarios', route: '/suppliers/reviews' },
    { icon: 'card_membership', label: 'Planes', route: '/suppliers/plans' },
    { icon: 'help', label: 'Ayuda', route: '/suppliers/help' },
    { icon: 'notifications', label: 'Notificaciones', route: '/suppliers/notifications' },
    { icon: 'person', label: 'Perfil', route: '/suppliers/profile' }
  ];
}

