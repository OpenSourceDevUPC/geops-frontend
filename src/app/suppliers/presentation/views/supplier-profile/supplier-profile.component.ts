import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SupplierProfile {
  businessName: string;
  plan: string;
  email: string;
  phone: string;
  address: string;
  schedule: string;
  website: string;
  description: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-supplier-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-profile.component.html',
  styleUrls: ['./supplier-profile.component.css']
})
export class SupplierProfileComponent {
  businessName = 'Aruma';
  isEditMode = false;

  profile: SupplierProfile = {
    businessName: 'Aruma',
    plan: 'Plan Premium',
    email: 'marketing@aruma.pe',
    phone: '+51 999 999 999',
    address: 'Av. Larco 1918, Miraflores, Lima',
    schedule: 'Lun-Dom 10:00 - 21:00',
    website: 'https://www.aruma.pe',
    description: 'Cadena de belleza y cuidado personal. Promos estacionales y beneficios para miembros.'
  };

  profileCopy: SupplierProfile = { ...this.profile };

  toggleEditMode() {
    if (this.isEditMode) {
      // Cancelar edición
      this.profileCopy = { ...this.profile };
    } else {
      // Iniciar edición
      this.profileCopy = { ...this.profile };
    }
    this.isEditMode = !this.isEditMode;
  }

  saveProfile() {
    // Validar contraseñas si se están cambiando
    if (this.profileCopy.newPassword || this.profileCopy.confirmPassword) {
      if (this.profileCopy.newPassword !== this.profileCopy.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      if (!this.profileCopy.currentPassword) {
        alert('Debes ingresar tu contraseña actual');
        return;
      }
    }

    // Guardar cambios
    this.profile = { ...this.profileCopy };
    this.isEditMode = false;

    // Limpiar campos de contraseña
    delete this.profileCopy.currentPassword;
    delete this.profileCopy.newPassword;
    delete this.profileCopy.confirmPassword;

    alert('Perfil actualizado correctamente');
  }

  cancelEdit() {
    this.profileCopy = { ...this.profile };
    this.isEditMode = false;

    // Limpiar campos de contraseña
    delete this.profileCopy.currentPassword;
    delete this.profileCopy.newPassword;
    delete this.profileCopy.confirmPassword;
  }
}

