import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';
import { Notification } from '../../../domain/model/notification.entity';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Notifications Dropdown Component
 *
 * Displays notifications in a dropdown menu from the header
 *
 * @summary Notification dropdown component
 */
@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './notifications-dropdown.component.html',
  styleUrl: './notifications-dropdown.component.css'
})
export class NotificationsDropdownComponent implements OnInit {
  public notificationsService = inject(NotificationsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  public userId: number | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.notificationsService.loadNotifications(user.id);
      this.notificationsService.loadUnreadCount(user.id);
    }
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read if not already
    if (!notification.isRead && this.userId) {
      this.notificationsService.markAsRead(notification.id, this.userId);
    }

    // Navigate to related page if actionUrl exists
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  onMarkAllAsRead(): void {
    if (this.userId) {
      this.notificationsService.markAllAsRead(this.userId);
    }
  }

  onDeleteNotification(event: Event, notificationId: number): void {
    event.stopPropagation();
    if (this.userId) {
      this.notificationsService.deleteNotification(notificationId, this.userId);
    }
  }

  onRefresh(): void {
    if (this.userId) {
      this.notificationsService.refresh(this.userId);
    }
  }

  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'PAYMENT': 'payment',
      'PREMIUM_UPGRADE': 'workspace_premium',
      'PROFILE_UPDATE': 'person',
      'FAVORITE': 'favorite',
      'COUPON_EXPIRATION': 'schedule',
      'REVIEW_COMMENT': 'comment'
    };
    return iconMap[type] || 'notifications';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
  }
}
