import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Payment } from '../domain/model/payment.entity';
import { PaymentResource, PaymentResponse } from './payment-response';
import { PaymentAssembler } from './payment-assembler';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentApiEndpoint extends BaseApiEndpoint<Payment, PaymentResource, PaymentResponse, PaymentAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderPaymentEndpointPath}`, new PaymentAssembler());
  }
}
