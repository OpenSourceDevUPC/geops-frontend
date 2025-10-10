import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-register-bussines',
  standalone: true,
  imports: [FormsModule, TranslateModule, LanguageSwitcher,
    MatButtonToggleModule],
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
    const email = localStorage.getItem('register-owner-email');
    this.http.get<any[]>(`http://localhost:3000/users?email=${email}`).subscribe({
      next: (users) => {
        if (!users.length) {
          this.errorMessage = 'Usuario no encontrado';
          this.submitting = false;
          return;
        }
        const user = users[0];
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
