import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionsApi } from '../../../infrastructure/subscriptions-api';
import { UsersApi } from '../../../../shared/infrastructure/users-api';

/**
 * Extended subscription interface with translation data
 */
export interface SubscriptionWithTranslations extends Subscription {
  name: string;
  description: string;
  features: string[];
  buttonText: string;
  currency: string;
  interval: string;
}

@Component({
  selector: 'app-subscription-plans-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscription-plans-modal.component.html',
  styleUrls: ['./subscription-plans-modal.component.css']
})
export class SubscriptionPlansModalComponent implements OnInit {
  /**
   * Controls whether the modal is visible
   */
  @Input() isVisible = false;

  /**
   * Event emitted when the modal should be closed
   */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Event emitted when a plan is selected
   */
  @Output() planSelected = new EventEmitter<SubscriptionWithTranslations>();

  /**
   * Signal that contains the subscription plans with translations
   */
  subscriptionPlans = signal<SubscriptionWithTranslations[]>([]);

  /**
   * Signal that indicates if data is being loaded
   */
  loading = signal(false);

  /**
   * Signal that indicates if a plan is being selected/updated
   */
  updating = signal(false);

  /**
   * Current user ID (this should be injected from a user service in a real app)
   */
  private currentUserId = 'a512'; // Using the ID from db.json for demo

  constructor(
    private SubscriptionsApi: SubscriptionsApi,
    private translateService: TranslateService,
    private usersApi: UsersApi
  ) {}

  ngOnInit(): void {
    // Wait for translations to load before loading plans
    this.translateService.onLangChange.subscribe(() => {
      if (this.subscriptionPlans().length > 0) {
        this.loadSubscriptionPlans();
      }
    });
    this.loadSubscriptionPlans();
  }

  /**
   * Loads subscription plans from the API and merges with translations
   */
  private loadSubscriptionPlans(): void {
    this.loading.set(true);
    this.SubscriptionsApi.getSubscriptions().subscribe({
      next: (plans) => {
        const plansWithTranslations = plans.map((plan) => this.enrichPlanWithTranslations(plan));
        this.subscriptionPlans.set(plansWithTranslations);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Enriches a subscription plan with translation data
   * @param plan - The base subscription plan
   * @returns The plan enriched with translations
   */
  private enrichPlanWithTranslations(plan: Subscription): SubscriptionWithTranslations {
    const planKey = `subscriptions.plans.${plan.type.toLowerCase()}`;

    // Get translations
    const name = this.translateService.instant(`${planKey}.name`);
    const description = this.translateService.instant(`${planKey}.description`);
    const features = this.translateService.instant(`${planKey}.features`);
    const buttonText = this.translateService.instant(`${planKey}.buttonText`);
    const currency = this.translateService.instant('subscriptions.currency');
    const interval = this.translateService.instant('subscriptions.interval');

    return {
      ...plan,
      name: name || plan.type.toLowerCase(), // Fallback to type if translation fails
      description: description || '',
      features: Array.isArray(features) ? features : [],
      buttonText: buttonText || 'Select',
      currency: currency || 'S/',
      interval: interval || 'month',
    };
  }

  /**
   * Handles closing the modal
   */
  onClose(): void {
    this.closeModal.emit();
  }

  /**
   * Handles plan selection and updates the user's plan
   * @param plan - The selected plan
   */
  onPlanSelect(plan: SubscriptionWithTranslations): void {
    this.updating.set(true);

    // TODO:Convert string ID to number for the API call
    const userId = this.currentUserId || "1";

    this.usersApi.updateUserPlan(userId, plan.type).subscribe({
      next: (updatedUser) => {
        console.log('User plan updated successfully:', updatedUser);
        this.updating.set(false);

        // Show success message or notification here
        alert(`¡Plan ${plan.name} seleccionado exitosamente!`);

        // Emit the plan selection event
        this.planSelected.emit(plan);

        // Close the modal
        this.onClose();
      },
      error: (error) => {
        console.error('Error updating user plan:', error);
        this.updating.set(false);

        // Show error message
        alert('Error al actualizar el plan. Por favor, inténtelo de nuevo.');
      }
    });
  }

  /**
   * Handles backdrop click to close modal
   * @param event - The click event
   */
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
