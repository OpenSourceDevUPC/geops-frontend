import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-supplier-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './supplier-notifications.component.html',
  styleUrls: ['./supplier-notifications.component.css']
})
export class SupplierNotificationsComponent {
  businessName = 'Aruma';

  notifications: Notification[] = [
    {
      id: 1,
      title: 'Campaña por finalizar',
      description: 'Recuerda, Mákieros, termina en 24h.',
      date: '2025-09-28 09:10',
      isRead: false,
      isNew: true
    },
    {
      id: 2,
      title: 'Hito de impresiones',
      description: 'Gift Card 40 → 28.90 alcanzó 75k impresiones.',
      date: '2025-09-27 18:32',
      isRead: false,
      isNew: true
    },
    {
      id: 3,
      title: 'Nuevo comentario',
      description: 'Paola dejó una reseña en tu perfil.',
      date: '2025-09-26 14:02',
      isRead: true
    }
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  markAllAsRead() {
    this.notifications.forEach(n => {
      n.isRead = true;
      n.isNew = false;
    });
  }

  clearAll() {
    if (confirm('¿Estás seguro de que deseas limpiar todas las notificaciones?')) {
      this.notifications = [];
    }
  }
}

