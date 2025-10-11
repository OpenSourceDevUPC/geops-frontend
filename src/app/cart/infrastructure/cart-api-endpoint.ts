import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Cart } from '../domain/model/cart.entity';
import { CartResource, CartResponse } from './cart-response';
import { CartAssembler } from './cart-assembler';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartApiEndpoint extends BaseApiEndpoint<Cart, CartResource, CartResponse, CartAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}/cart`, new CartAssembler());
  }
}
