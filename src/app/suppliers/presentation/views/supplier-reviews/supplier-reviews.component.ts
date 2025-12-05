import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Review {
  id: number;
  userName: string;
  date: string;
  comment: string;
  response: string;
}

@Component({
  selector: 'app-supplier-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './supplier-reviews.component.html',
  styleUrls: ['./supplier-reviews.component.css']
})
export class SupplierReviewsComponent {
  businessName = 'Aruma';

  reviews: Review[] = [
    {
      id: 1,
      userName: 'Andrea T.',
      date: '2025-09-14',
      comment: 'Me llegó la notificación cerca a San Isidro, súper útil.',
      response: ''
    },
    {
      id: 2,
      userName: 'Carla V.',
      date: '2025-09-12',
      comment: 'Buen descuento en skincare, pero se agotó un producto 😕',
      response: ''
    },
    {
      id: 3,
      userName: 'Paola R.',
      date: '2025-09-10',
      comment: 'La promo 3x1 de labiales 💄 El canje fue rapidísimo en caja.',
      response: ''
    }
  ];

  onRespond(review: Review) {
    if (review.response.trim()) {
      console.log(`Respuesta enviada para ${review.userName}:`, review.response);
      // Aquí se enviaría la respuesta al backend
      alert(`Respuesta enviada a ${review.userName}`);
    }
  }
}

