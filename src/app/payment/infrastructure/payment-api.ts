import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, BehaviorSubject } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Payment } from '../domain/model/payment.entity';
import { PaymentApiEndpoint } from './payment-api-endpoint';
import { PaymentMethod, PaymentStatus } from '../domain/model/payment-method.enum';

export interface CreatePaymentRequest {
  userId: string;
  cartId: string;
  amount: number;
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

  constructor(http: HttpClient) {
    super();
    this.paymentEndpoint = new PaymentApiEndpoint(http);
  }

  /**
   * Creates a new payment
   * @param request - Payment creation request
   */
  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    // Generate a payment code for tracking
    const paymentCode = this.generatePaymentCode(request.paymentMethod);

    const newPayment: Omit<Payment, 'id'> = {
      userId: request.userId,
      cartId: request.cartId,
      amount: request.amount,
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
      })
    );
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
