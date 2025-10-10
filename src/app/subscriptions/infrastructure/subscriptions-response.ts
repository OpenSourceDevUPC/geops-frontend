import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Subscription resource from the API
 */
export interface SubscriptionResource extends BaseResource {
  price: number;
  recommended: boolean;
  type: 'BASIC' | 'PREMIUM';
}

/**
 * API response for multiple subscriptions
 */
export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionResource[];
}
