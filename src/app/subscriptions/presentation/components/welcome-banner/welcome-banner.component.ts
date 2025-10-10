import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionPlansModalComponent, SubscriptionWithTranslations } from '../subscription-plans-modal/subscription-plans-modal.component';

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule, SubscriptionPlansModalComponent],
  templateUrl: './welcome-banner.component.html',
  styleUrls: ['./welcome-banner.component.css']
})
export class WelcomeBannerComponent {
  /**
   * Signal that indicates if the plans modal is visible
   */
  showPlansModal = signal(false);

  /**
   * Shows the plans modal
   */
  showPlans(): void {
    this.showPlansModal.set(true);
  }

  /**
   * Hides the plans modal
   */
  closePlans(): void {
    this.showPlansModal.set(false);
  }

  /**
   * Handles the premium button click
   */
  onPremiumClick(): void {
    // Here you could implement logic to show only the premium plan
    // or redirect directly to purchase
    console.log('Premium button clicked');
  }

  /**
   * Handles plan selection
   * @param plan - The selected plan
   */
  onPlanSelect(plan: SubscriptionWithTranslations): void {
    console.log('Plan selected:', plan);
    // Here you would implement the logic to process the plan selection
    this.closePlans();
  }
}
