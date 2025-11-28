import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * CrearCampañasComponent
 *
 * Vista para crear una nueva campaña.
 * Muestra instrucción y botón para abrir el editor.
 */
@Component({
  selector: 'app-crear-campañas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './crear-campañas.component.html',
  styleUrls: ['./crear-campañas.component.css']
})
export class CrearCampañasComponent {
  /**
   * Abre el editor de campañas
   */
  onOpenEditor(): void {
    console.log('[CrearCampañas] Abriendo editor de campaña');
  }
}

