import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-supplier-help',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './supplier-help.component.html',
  styleUrls: ['./supplier-help.component.css']
})
export class SupplierHelpComponent {
  businessName = 'Aruma';

  faqItems: FaqItem[] = [
    {
      id: 1,
      question: '¿Cómo creo una campaña?',
      answer: 'Para crear una campaña, ve a la sección "Crear" en el menú principal. Haz clic en el botón "Crear", completa el formulario con el nombre de la campaña, selecciona la segmentación (Ciudades/Regiones o Radio), define las fechas de inicio y fin, y establece tu presupuesto. Finalmente, haz clic en "Guardar".',
      isOpen: false
    },
    {
      id: 2,
      question: '¿Cómo pauso o reactivo?',
      answer: 'Para pausar o reactivar una campaña, ve a la sección "Campañas". Busca la campaña que deseas modificar y haz clic en el botón "Pausar" si está activa, o "Reanudar" si está pausada. Los cambios se aplicarán inmediatamente.',
      isOpen: false
    },
    {
      id: 3,
      question: '¿Por qué no veo métricas?',
      answer: 'Las métricas pueden tardar hasta 24 horas en actualizarse después de crear una campaña. Si después de este tiempo sigues sin ver métricas, verifica que tu campaña esté activa y que el presupuesto no se haya agotado. También puedes revisar la sección "Reportes" para obtener datos más detallados.',
      isOpen: false
    }
  ];

  toggleFaq(item: FaqItem) {
    item.isOpen = !item.isOpen;
  }
}

