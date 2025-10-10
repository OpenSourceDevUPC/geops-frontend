import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscriptions-response';
import { SubscriptionsAssembler } from './subscriptions-assembler';

@Injectable({ providedIn: 'root' })
export class SubscriptionsApiEndpoint extends BaseApiEndpoint<
  Subscription,
  SubscriptionResource,
  SubscriptionsResponse,
  SubscriptionsAssembler
> {
  /**
   * Creates an instance of the SubscriptionsApiEndpoint service
   * @param http - Angular HTTP client
   */
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3001/subscriptions', new SubscriptionsAssembler());
  }
}
