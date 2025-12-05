import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plans-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans-modal.component.html',
  styleUrls: ['./plans-modal.component.css']
})
export class PlansModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }

  onStartBasic() {
    console.log('Iniciando plan básico');
    this.onClose();
  }

  onTryPremium() {
    console.log('Probando plan premium');
    this.onClose();
  }
}

