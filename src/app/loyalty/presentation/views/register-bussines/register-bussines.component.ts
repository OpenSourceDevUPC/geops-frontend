import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- nuevo import
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-bussines',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-bussines.component.html',
  styleUrls: ['./register-bussines.component.css']
})
export class RegisterBussinesComponent {
  business: any = {
    businessName: '',
    businessType: '',
    taxId: ''
  };
  submitting = false;
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit() {
    this.submitting = true;
    // 1. Obtén el usuario OWNER más reciente (puedes guardar el email en localStorage desde el registro)
    const email = localStorage.getItem('register-owner-email');
    this.http.get<any[]>(`http://localhost:3000/users?email=${email}`).subscribe({
      next: (users) => {
        if (!users.length) {
          this.errorMessage = 'Usuario no encontrado';
          this.submitting = false;
          return;
        }
        const user = users[0];
        // 2. Actualiza user con PATCH o PUT
        const id = user.id;
        this.http.patch(`http://localhost:3000/users/${id}`, {
          business: this.business
        }).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/home']);
          },
          error: err => {
            this.errorMessage = 'Error al guardar negocio';
            this.submitting = false;
          }
        });
      },
      error: err => {
        this.errorMessage = 'Error buscando usuario';
        this.submitting = false;
      }
    });
  }
}
