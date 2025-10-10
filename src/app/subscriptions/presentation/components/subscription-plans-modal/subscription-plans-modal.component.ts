import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from '../../../domain/model/subscription.entity';
import { SubscriptionsApiEndpoint } from '../../../infrastructure/subscriptions-api-endpoint';

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

  constructor(
    private subscriptionsApiEndpoint: SubscriptionsApiEndpoint,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionPlans();
  }

  /**
   * Loads subscription plans from the API and merges with translations
   */
  private loadSubscriptionPlans(): void {
    this.loading.set(true);
    this.subscriptionsApiEndpoint.getAll().subscribe({
      next: (plans) => {
        const plansWithTranslations = plans.map(plan => this.enrichPlanWithTranslations(plan));
        this.subscriptionPlans.set(plansWithTranslations);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading subscription plans:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Enriches a subscription plan with translation data
   * @param plan - The base subscription plan
   * @returns The plan enriched with translations
   */
  private enrichPlanWithTranslations(plan: Subscription): SubscriptionWithTranslations {
    const planKey = `subscriptions.plans.${plan.type}`;

    return {
      ...plan,
      name: this.translateService.instant(`${planKey}.name`),
      description: this.translateService.instant(`${planKey}.description`),
      features: this.translateService.instant(`${planKey}.features`),
      buttonText: this.translateService.instant(`${planKey}.buttonText`),
      currency: this.translateService.instant('subscriptions.currency'),
      interval: this.translateService.instant('subscriptions.interval')
    };
  }

  /**
   * Handles closing the modal
   */
  onClose(): void {
    this.closeModal.emit();
  }

  /**
   * Handles plan selection
   * @param plan - The selected plan
   */
  onPlanSelect(plan: SubscriptionWithTranslations): void {
    this.planSelected.emit(plan);
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
