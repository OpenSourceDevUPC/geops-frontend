import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { User } from '../../../domain/model/user.entity';
import { MatIconModule } from '@angular/material/icon';

type Plan = 'PREMIUM' | 'BASIC';
type LocationPermission = 'ASK' | 'ALWAYS';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
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

  readonly ALL_CATEGORIES: string[] = [
    'Infantil','Ofertas','Viajes','Sushi','Moda','Tecnología','Belleza','Salud','Deporte'
  ];

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Rehidratar desde AuthService (que a su vez lee localStorage)
    const u = this.authService.getCurrentUser();
    this.user = u ? this.normalizeUser(u) : null; // mantener valores en UI [web:71]
  }

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

  get avatar(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '';
  }

  toggleEdit(key: string): void {
    this.editState[key] = !this.editState[key];
  }

  onCategoryChange(evt: Event, cat: string): void {
    if (!this.user) return;
    const checked = (evt.target as HTMLInputElement).checked;
    const favs = new Set<string>(this.user.favorites ?? []);
    checked ? favs.add(cat) : favs.delete(cat);
    this.user.favorites = Array.from(favs);
  }

  guardar(): void {
    if (!this.user) return;
    this.cargando = true;
    this.mensaje = '';

    const snapshot = { ...this.user }; // para rollback optimista [web:47]

    this.authService.updateUser(this.user).subscribe({
      next: (updated) => {
        // Mezclar respuesta y snapshot por si la API devuelve parcial o 204
        const merged = updated && Object.keys(updated).length
          ? { ...snapshot, ...updated }
          : snapshot;

        this.user = this.normalizeUser(merged); // mantiene UI consistente [web:47]
        this.cargando = false;
        this.mensaje = '¡Usuario actualizado correctamente!';
        setTimeout(() => (this.mensaje = ''), 3000);
      },
      error: () => {
        this.user = snapshot; // rollback
        this.cargando = false;
        this.mensaje = 'Error al actualizar usuario';
      }
    });
  }

  cancelar(): void {
    // Releer el último estado persistido
    const u = this.authService.getCurrentUser();
    this.user = u ? this.normalizeUser(u) : null; // no usar reset vacío [web:47]
    this.mensaje = '';
    Object.keys(this.editState).forEach(k => (this.editState[k] = false));
  }

  actualizarPassword(): void {
    if (!this.user) return;

    if ((this.user.password ?? '') !== this.passwordActual) {
      this.mensaje = 'La contraseña actual no es correcta';
      return;
    }
    if (this.newPassword.trim().length < 6) {
      this.mensaje = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.mensaje = 'Las contraseñas nuevas no coinciden';
      return;
    }

    // Actualizar en memoria; si quieres persistir, llama a guardar() o a un endpoint específico
    this.user.password = this.newPassword;
    this.mensaje = 'Contraseña actualizada correctamente';

    this.passwordActual = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.editState['passwordActual'] = false;
    this.editState['newPassword'] = false;
    this.editState['confirmPassword'] = false;
  }
}
