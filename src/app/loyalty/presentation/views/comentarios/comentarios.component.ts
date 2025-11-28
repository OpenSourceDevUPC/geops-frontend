import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

/**
 * ComentariosComponent
 *
 * Vista de comentarios y reseñas de clientes.
 * Muestra comentarios con campos para responder.
 */
@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent {
  /** Comentarios de clientes */
  comments = [
    {
      id: 1,
      author: 'Andrea T.',
      date: '2025-09-14',
      text: 'Me llegó la notificación correo o son usuarios, ¿algún dt.',
      reply: '',
      showReplyInput: false
    },
    {
      id: 2,
      author: 'Carla V.',
      date: '2025-09-12',
      text: 'Buen descuento en vitamina, para las algún un productos 🥰',
      reply: '',
      showReplyInput: false
    },
    {
      id: 3,
      author: 'Paola B.',
      date: '2025-09-10',
      text: 'La promo 2d de labiales 🎁 El combo ha registrado en caja.',
      reply: '',
      showReplyInput: false
    }
  ];

  /**
   * Abre el campo de respuesta
   */
  onOpenReply(index: number): void {
    this.comments[index].showReplyInput = true;
  }

  /**
   * Envía la respuesta
   */
  onSendReply(index: number): void {
    if (this.comments[index].reply.trim()) {
      console.log(`[Comentarios] Respondiendo a ${this.comments[index].author}:`, this.comments[index].reply);
      this.comments[index].showReplyInput = false;
      this.comments[index].reply = '';
    }
  }

  /**
   * Cancela la respuesta
   */
  onCancelReply(index: number): void {
    this.comments[index].showReplyInput = false;
    this.comments[index].reply = '';
  }
}

