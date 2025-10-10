import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { User } from '../../../domain/model/user.entity';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

type Plan = 'PREMIUM' | 'BASIC';
type LocationPermission = 'ASK' | 'ALWAYS';

/**
 * SettingsComponent allows users to view and update their profile settings,
 * including personal information, password, and favorite categories.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User | null = null;

  mensaje = '';
  cargando = false;

  passwordActual = '';
  newPassword = '';
  confirmPassword = '';

  /** List of all available categories for favorites */
  readonly ALL_CATEGORIES: string[] = [
    'Infantil','Ofertas','Viajes','Sushi','Moda','Tecnología','Belleza','Salud','Deporte'
  ];

  /** Tracks which fields are in edit mode */
  editState: Record<string, boolean> = {
    name: false,
    email: false,
    phone: false,
    home: false,
    work: false,
    university: false,
    passwordActual: false,
    newPassword: false,
    confirmPassword: false
  };

  /**
   * Initializes SettingsComponent with AuthService.
   * @param authService Service for user authentication and updates
   */
  constructor(private authService: AuthService) {}

  /**
   * Loads and normalizes the current user on component initialization.
   */
  ngOnInit(): void {
    // Rehydrate from AuthService (which reads from localStorage)
    const u = this.authService.getCurrentUser();
    this.user = u ? this.normalizeUser(u) : null;
  }

  /**
   * Normalizes user data for UI consistency.
   * @param u User object to normalize
   * @returns Normalized User object
   */
  private normalizeUser(u: User): User {
    return {
      ...u,
      favorites: Array.isArray(u.favorites) ? [...u.favorites] : [],
      plan: (u.plan as Plan) ?? 'BASIC',
      locationPermission: (u.locationPermission as LocationPermission) ?? 'ASK',
      home: u.home ?? '',
      work: u.work ?? '',
      university: u.university ?? ''
    } as User;
  }

  /**
   * Returns the first letter of the user's name in uppercase for avatar display.
   */
  get avatar(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '';
  }

  /**
   * Toggles edit mode for a given field.
   * @param key Field name to toggle
   */
  toggleEdit(key: string): void {
    this.editState[key] = !this.editState[key];
  }

  /**
   * Handles changes to favorite categories.
   * @param evt Event from the checkbox
   * @param cat Category name
   */
  onCategoryChange(evt: Event, cat: string): void {
    if (!this.user) return;
    const checked = (evt.target as HTMLInputElement).checked;
    const favs = new Set<string>(this.user.favorites ?? []);
    checked ? favs.add(cat) : favs.delete(cat);
    this.user.favorites = Array.from(favs);
  }

  /**
   * Saves the updated user profile.
   * Performs optimistic update and handles rollback on error.
   */
  guardar(): void {
    if (!this.user) return;
    this.cargando = true;
    this.mensaje = '';

    const snapshot = { ...this.user }; // for optimistic rollback

    this.authService.updateUser(this.user).subscribe({
      next: (updated) => {
        // Merge response and snapshot in case API returns partial or 204
        const merged = updated && Object.keys(updated).length
          ? { ...snapshot, ...updated }
          : snapshot;

        this.user = this.normalizeUser(merged);
        this.cargando = false;
        this.mensaje = 'User updated successfully!';
        setTimeout(() => (this.mensaje = ''), 3000);
      },
      error: () => {
        this.user = snapshot; // rollback
        this.cargando = false;
        this.mensaje = 'Error updating user';
      }
    });
  }

  /**
   * Cancels editing and reloads the last persisted user state.
   */
  cancelar(): void {
    const u = this.authService.getCurrentUser();
    this.user = u ? this.normalizeUser(u) : null;
    this.mensaje = '';
    Object.keys(this.editState).forEach(k => (this.editState[k] = false));
  }

  /**
   * Updates the user's password after validation.
   * Resets password fields and edit states on success.
   */
  actualizarPassword(): void {
    if (!this.user) return;

    if ((this.user.password ?? '') !== this.passwordActual) {
      this.mensaje = 'Current password is incorrect';
      return;
    }
    if (this.newPassword.trim().length < 6) {
      this.mensaje = 'The new password must be at least 6 characters';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.mensaje = 'New passwords do not match';
      return;
    }

    // Update in memory; to persist, call guardar() or a specific endpoint
    this.user.password = this.newPassword;
    this.mensaje = 'Password updated successfully';

    this.passwordActual = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.editState['passwordActual'] = false;
    this.editState['newPassword'] = false;
    this.editState['confirmPassword'] = false;
  }
}
