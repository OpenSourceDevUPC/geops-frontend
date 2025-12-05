import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-campaign-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-campaign-modal.component.html',
  styleUrls: ['./new-campaign-modal.component.css']
})
export class NewCampaignModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCampaign = new EventEmitter<any>();

  // Modelo del formulario
  campaignName = '';
  segmentationType: 'ciudades' | 'radio' = 'ciudades';
  cities = '';
  startDate = '';
  endDate = '';
  budget = '';

  onClose() {
    this.closeModal.emit();
  }

  onCancel() {
    this.onClose();
  }

  onSave() {
    const campaignData = {
      name: this.campaignName,
      segmentationType: this.segmentationType,
      cities: this.cities,
      startDate: this.startDate,
      endDate: this.endDate,
      budget: this.budget
    };

    console.log('Guardando campaña:', campaignData);
    this.saveCampaign.emit(campaignData);
    this.onClose();
  }

  selectSegmentation(type: 'ciudades' | 'radio') {
    this.segmentationType = type;
  }
}

