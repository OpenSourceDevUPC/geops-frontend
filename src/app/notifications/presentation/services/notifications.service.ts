import { Injectable, inject, signal } from '@angular/core';
import { NotificationsApiEndpoint } from '../../infrastructure/notifications-api-endpoint';
import { Notification } from '../../domain/model/notification.entity';
import { BehaviorSubject } from 'rxjs';

/**
 * Notifications Service
 *
 * Presentation service for managing notification state
 *
 * @summary Manages notification UI state and operations
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly api = inject(NotificationsApiEndpoint);

  // State signals
  public notifications = signal<Notification[]>([]);
  public unreadCount = signal<number>(0);
  public isLoading = signal<boolean>(false);

  // Observable for real-time updates
  private refreshSubject = new BehaviorSubject<void>(undefined);
  public refresh$ = this.refreshSubject.asObservable();

  /**
   * Load notifications for a user
   */
  loadNotifications(userId: number): void {
    this.isLoading.set(true);
    this.api.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.updateUnreadCount();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[NotificationsService] Error loading notifications:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load unread count for a user
   */
  loadUnreadCount(userId: number): void {
    this.api.getUnreadCount(userId).subscribe({
      next: (count) => {
        this.unreadCount.set(count);
      },
      error: (err) => {
        console.error('[NotificationsService] Error loading unread count:', err);
      }
    });
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: number, userId: number): void {
    this.api.markAsRead(notificationId).subscribe({
      next: (updatedNotification) => {
        // Update the notification in the list
        const currentNotifications = this.notifications();
        const index = currentNotifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          currentNotifications[index] = updatedNotification;
          this.notifications.set([...currentNotifications]);
          this.updateUnreadCount();
        }
      },
      error: (err) => {
        console.error('[NotificationsService] Error marking notification as read:', err);
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: number): void {
    this.api.markAllAsRead(userId).subscribe({
      next: () => {
        // Reload notifications to get updated state
        this.loadNotifications(userId);
      },
      error: (err) => {
        console.error('[NotificationsService] Error marking all as read:', err);
      }
    });
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: number, userId: number): void {
    this.api.delete(notificationId).subscribe({
      next: () => {
        // Remove from local state
        const currentNotifications = this.notifications();
        this.notifications.set(currentNotifications.filter(n => n.id !== notificationId));
        this.updateUnreadCount();
      },
      error: (err: Error) => {
        console.error('[NotificationsService] Error deleting notification:', err);
      }
    });
  }

  /**
   * Refresh notifications
   */
  refresh(userId: number): void {
    this.loadNotifications(userId);
    this.loadUnreadCount(userId);
    this.refreshSubject.next();
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications().filter(n => !n.isRead);
  }

  /**
   * Get read notifications
   */
  getReadNotifications(): Notification[] {
    return this.notifications().filter(n => n.isRead);
  }

  /**
   * Update unread count based on current notifications
   */
  private updateUnreadCount(): void {
    const unread = this.notifications().filter(n => !n.isRead).length;
    this.unreadCount.set(unread);
  }
}
