import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject, of, switchMap, take } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Payment } from '../domain/model/payment.entity';
import { PaymentApiEndpoint } from './payment-api-endpoint';
import { PaymentMethod, PaymentStatus } from '../domain/model/payment-method.enum';
import { CouponsApi } from '../../coupons/infrastructure/coupons-api';
import { CartApi } from '../../cart/infrastructure/cart-api';
import { Cart } from '../../cart/domain/model/cart.entity';
import { CartItem } from '../../cart/domain/model/cart-item.entity';
import { Coupon } from '../../coupons/domain/model/coupon.entity';

// Local helper type for purchased items
// Represent minimal shape needed for payment processing.
export interface PurchaseItem {
  offerId: string;
  price: number;
  quantity?: number;
}

export interface CreatePaymentRequest {
  userId: string;
  cartId: string;
  amount: number;
  productType?: string;
  productId?: string;
  // items indicates what was purchased; we'll generate a coupon per item.offerId
  items?: Array<PurchaseItem>;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  cvv?: string; // Only for card payments, not stored
}

@Injectable({
  providedIn: 'root'
})
export class PaymentApi extends BaseApi {
  private readonly paymentEndpoint: PaymentApiEndpoint;
  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  public payments$ = this.paymentsSubject.asObservable();

  constructor(http: HttpClient, private couponsApi: CouponsApi, private cartApi: CartApi) {
    super();
    this.paymentEndpoint = new PaymentApiEndpoint(http);
  }

  /**
   * Creates a new payment
   * @param request - Payment creation request
   */
  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    // Determine items either from request or from the user's cart
    const items$ = request.items && request.items.length > 0
        ? of(request.items)
        : this.cartApi.getCartByUserId(request.userId).pipe(
            map((cart: Cart) => cart.items.map((i: CartItem) => ({ offerId: i.offerId, price: i.offerPrice, quantity: i.quantity })))
          );

    return items$.pipe(
      take(1),
      switchMap((items) => {
        // Generate a payment code for tracking
        const paymentCode = this.generatePaymentCode(request.paymentMethod);

        // Generate per-item payment codes (one coupon per purchased unit)
        const paymentCodes: { offerId: string; code: string }[] = [];
        if (items && items.length > 0) {
          for (const it of items) {
            const qty = (it.quantity && it.quantity > 0) ? it.quantity : 1;
            for (let k = 0; k < qty; k++) {
              const code = this.generateRandomCouponCode();
              paymentCodes.push({ offerId: it.offerId, code });
            }
          }
        }

        const newPayment: Omit<Payment, 'id'> = {
          userId: request.userId,
          cartId: request.cartId,
          productType: request.productType,
          productId: request.productId,
          amount: request.amount,
          paymentCodes: paymentCodes,
          paymentMethod: request.paymentMethod,
          status: PaymentStatus.COMPLETED, // For demo purposes, always successful
          customerEmail: request.customerEmail,
          customerFirstName: request.customerFirstName,
          customerLastName: request.customerLastName,
          paymentCode: paymentCode,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };

        return this.paymentEndpoint.create(newPayment as Payment).pipe(
          tap(payment => {
            const currentPayments = this.paymentsSubject.value;
            this.paymentsSubject.next([...currentPayments, payment]);

            // After payment persisted, create coupons for each generated payment code
            if (paymentCodes.length > 0) {
              for (const pc of paymentCodes) {
                const couponPayload = {
                  userId: request.userId,
                  paymentId: payment.id,
                  paymentCode: pc.code,
                  productType: request.productType,
                  offerId: pc.offerId,
                  offer: items.find((i) => i.offerId === pc.offerId) as unknown,
                  code: pc.code,
                  createdAt: new Date().toISOString(),
                } as unknown;

                // fire-and-forget; subscribe to ensure request is executed
                this.couponsApi.createCoupon(couponPayload as Coupon).subscribe();
              }
            }
          })
        );
      })
    );
  }

  private generateRandomCouponCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Gets payment by ID
   * @param id - Payment ID
   */
  getPaymentById(id: number): Observable<Payment> {
    return this.paymentEndpoint.getById(id);
  }

  /**
   * Gets payments by user ID
   * @param userId - User ID
   */
  getPaymentsByUser(userId: string): Observable<Payment[]> {
    return this.paymentEndpoint.getAll().pipe(
      map((payments: Payment[]) => payments.filter(payment => payment.userId === userId)),
      tap(userPayments => this.paymentsSubject.next(userPayments))
    );
  }

  /**
   * Gets all payments
   */
  getAllPayments(): Observable<Payment[]> {
    return this.paymentEndpoint.getAll().pipe(
      tap(payments => this.paymentsSubject.next(payments))
    );
  }

  private generatePaymentCode(paymentMethod: PaymentMethod): string {
    let prefix: string;
    switch (paymentMethod) {
      case PaymentMethod.YAPE:
        prefix = 'YAPE';
        break;
      case PaymentMethod.PLIN:
        prefix = 'PLIN';
        break;
      case PaymentMethod.CARD:
      default:
        prefix = 'CARD';
        break;
    }
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${random}`;
  }
}
