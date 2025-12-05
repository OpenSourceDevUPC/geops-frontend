import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NewCampaignModalComponent } from '../../components/new-campaign-modal/new-campaign-modal.component';

@Component({
  selector: 'app-supplier-create',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NewCampaignModalComponent],
  templateUrl: './supplier-create.component.html',
  styleUrls: ['./supplier-create.component.css']
})
export class SupplierCreateComponent {
  businessName = 'Aruma';
  showNewCampaignModal = false;

  onCreateCampaign() {
    this.showNewCampaignModal = true;
  }

  closeNewCampaignModal() {
    this.showNewCampaignModal = false;
  }

  onSaveCampaign(campaignData: any) {
    console.log('Campaña guardada:', campaignData);
    // Aquí se procesará la información de la campaña
  }
}

