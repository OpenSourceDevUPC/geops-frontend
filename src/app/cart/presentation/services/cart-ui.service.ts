import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartUiService {
  private openCartSubject = new Subject<void>();
  private resetPaymentSubject = new Subject<void>();

  openCart$ = this.openCartSubject.asObservable();
  resetPayment$ = this.resetPaymentSubject.asObservable();

  /**
   * Opens the cart sidebar
   */
  openCart(): void {
    this.openCartSubject.next();
  }

  /**
   * Signals to reset the payment flow (when items are added to cart)
   */
  resetPaymentFlow(): void {
    this.resetPaymentSubject.next();
  }
}
