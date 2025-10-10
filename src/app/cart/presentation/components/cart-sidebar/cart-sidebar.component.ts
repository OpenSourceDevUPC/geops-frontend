import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartApi } from '../../../infrastructure/cart-api';
import { Cart } from '../../../domain/model/cart.entity';
import { CartItem } from '../../../domain/model/cart-item.entity';
import { PaymentApi, CreatePaymentRequest } from '../../../../payment/infrastructure/payment-api';
import { PaymentMethod } from '../../../../payment/domain/model/payment-method.enum';
import { Payment } from '../../../../payment/domain/model/payment.entity';
import { CartUiService } from '../../services/cart-ui.service';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';

export type CartView = 'cart' | 'checkout' | 'confirmation';
export type PaymentStep = 'methods' | 'card-form' | 'confirmation';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
  ],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.css',
})
export class CartSidebarComponent implements OnInit {
  private readonly cartApi = inject(CartApi);
  private readonly paymentApi = inject(PaymentApi);
  private readonly fb = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  private readonly cartUiService = inject(CartUiService);

  // Signals
  isOpen = signal(false);
  cart = signal<Cart | null>(null);
  isLoading = signal(false);
  currentView = signal<CartView>('cart');
  completedPayment = signal<Payment | null>(null);

  // Payment state
  paymentStep: PaymentStep = 'methods';
  selectedPaymentMethod = signal<PaymentMethod | null>(null);
  isProcessingPayment = signal(false);

  // Form
  cardForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  userId = 'a512'; // In real app would come from auth service

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userId = String(user.id);
    } else {
      console.warn('[Layout] No hay usuario autenticado');
    }
    // Subscribe to cart changes
    this.cartApi.cart$.subscribe((cart) => {
      const previousCart = this.cart();
      this.cart.set(cart);

      // Reset payment flow when cart contents change significantly
      const cartContentsChanged = this.hasCartContentsChanged(previousCart, cart);

      if (
        cartContentsChanged &&
        this.paymentStep !== 'methods' &&
        this.paymentStep !== 'confirmation'
      ) {
        this.resetPaymentFlow();
      }
    });

    // Subscribe to payment reset signals
    this.cartUiService.resetPayment$.subscribe(() => {
      this.resetPaymentState();
    });

    // Load cart for user (hardcoded for now)
    this.loadCart();
  }

  /**
   * Toggle sidebar visibility
   */
  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  /**
   * Open sidebar
   */
  open() {
    this.isOpen.set(true);
    this.currentView.set('cart'); // Always start with cart view
  }

  /**
   * Close sidebar
   */
  close() {
    this.isOpen.set(false);
  }

  /**
   * Load cart for current user
   */
  private loadCart() {
    this.isLoading.set(true);
    this.cartApi.getCartByUserId(this.userId).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Update item quantity
   * @param item - Cart item to update
   * @param quantity - New quantity
   */
  updateQuantity(item: CartItem, quantity: number) {
    this.cartApi.updateItemQuantity(this.userId, item.offerId, quantity).subscribe({
      next: () => {
        // Reset payment flow when quantities are updated
        if (this.paymentStep !== 'methods' && this.paymentStep !== 'confirmation') {
          this.resetPaymentFlow();
        }
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      },
    });
  }

  /**
   * Remove item from cart
   * @param item - Cart item to remove
   */
  removeItem(item: CartItem) {
    this.cartApi.removeItemFromCart(this.userId, item.offerId).subscribe({
      next: () => {
        // Reset payment flow when items are removed
        if (this.paymentStep !== 'methods' && this.paymentStep !== 'confirmation') {
          this.resetPaymentFlow();
        }
      },
      error: (error) => {
        console.error('Error removing item:', error);
      },
    });
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cartApi.clearCart(this.userId).subscribe({
      error: (error) => {
        console.error('Error clearing cart:', error);
      },
    });
  }

  /**
   * Get total items count
   */
  get totalItems(): number {
    return this.cart()?.totalItems || 0;
  }

  /**
   * Get total amount
   */
  get totalAmount(): number {
    return this.cart()?.totalAmount || 0;
  }

  /**
   * Check if cart is empty
   */
  get isEmpty(): boolean {
    return this.totalItems === 0;
  }

  /**
   * Select payment method (but don't process yet)
   */
  selectPaymentMethod(method: string) {
    const paymentMethod = method as PaymentMethod;
    this.selectedPaymentMethod.set(paymentMethod);
    // Just select the method, don't process payment yet
  }

  /**
   * Process payment based on selected method
   */
  processPayment() {
    const method = this.selectedPaymentMethod();
    if (!method) return;

    if (method === PaymentMethod.CARD) {
      this.paymentStep = 'card-form';
    } else {
      // For Yape and Plin, process payment immediately
      this.processInstantPayment(method);
    }
  }

  /**
   * Go back to payment methods
   */
  goBackToMethods() {
    this.paymentStep = 'methods';
    this.selectedPaymentMethod.set(null);
    this.cardForm.reset();
  }

  /**
   * Process card payment
   */
  processCardPayment() {
    if (this.cardForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isProcessingPayment.set(true);

    const formValue = this.cardForm.value;
    const request: CreatePaymentRequest = {
      userId: this.userId,
      cartId: this.cart()?.id?.toString() || '',
      amount: this.totalAmount,
      paymentMethod: PaymentMethod.CARD,
      customerEmail: formValue.email,
      customerFirstName: formValue.firstName,
      customerLastName: formValue.lastName,
      cvv: formValue.cvv,
    };

    this.paymentApi.createPayment(request).subscribe({
      next: (payment) => {
        this.isProcessingPayment.set(false);
        this.onPaymentCompleted(payment);
      },
      error: (error) => {
        this.isProcessingPayment.set(false);
        console.error('Payment failed:', error);
      },
    });
  }

  /**
   * Process instant payment (Yape/Plin)
   */
  private processInstantPayment(method: PaymentMethod) {
    this.isProcessingPayment.set(true);

    const request: CreatePaymentRequest = {
      userId: this.userId,
      cartId: this.cart()?.id?.toString() || '',
      amount: this.totalAmount,
      paymentMethod: method,
      customerEmail: `user-${this.userId}@temp.com`,
      customerFirstName: 'Usuario',
      customerLastName: 'Temporal',
    };

    this.paymentApi.createPayment(request).subscribe({
      next: (payment) => {
        this.isProcessingPayment.set(false);
        this.onPaymentCompleted(payment);
      },
      error: (error) => {
        this.isProcessingPayment.set(false);
        console.error('Payment failed:', error);
      },
    });
  }

  /**
   * Override payment completed to update step
   */
  onPaymentCompleted(payment: Payment) {
    this.completedPayment.set(payment);
    this.paymentStep = 'confirmation';
    // Clear the cart after successful payment
    this.clearCart();
  }

  /**
   * Override close confirmation to reset payment state (but keep sidebar open)
   */
  closeConfirmation() {
    this.completedPayment.set(null);
    this.paymentStep = 'methods';
    this.selectedPaymentMethod.set(null);
    this.cardForm.reset();
    // Don't close the sidebar - let user continue shopping
  }

  /**
   * Reset payment flow to initial state
   */
  private resetPaymentFlow() {
    this.paymentStep = 'methods';
    this.selectedPaymentMethod.set(null);
    this.isProcessingPayment.set(false);
    this.completedPayment.set(null);
    this.cardForm.reset();
  }

  /**
   * Public method to reset payment flow (can be called externally)
   */
  public resetPaymentState() {
    if (this.paymentStep !== 'methods' && this.paymentStep !== 'confirmation') {
      this.resetPaymentFlow();
    }
  }

  /**
   * Check if cart contents have changed significantly
   */
  private hasCartContentsChanged(previousCart: Cart | null, currentCart: Cart | null): boolean {
    // If we're going from no cart to having a cart, or vice versa
    if (!previousCart && currentCart) return true;
    if (previousCart && !currentCart) return true;
    if (!previousCart && !currentCart) return false;

    // If total items count changed
    if (previousCart!.totalItems !== currentCart!.totalItems) return true;

    // If total amount changed (could indicate price or quantity changes)
    if (previousCart!.totalAmount !== currentCart!.totalAmount) return true;

    // If the number of unique items changed
    const prevItemCount = previousCart!.items?.length || 0;
    const currItemCount = currentCart!.items?.length || 0;
    if (prevItemCount !== currItemCount) return true;

    // For performance, if we reach here, assume no significant change
    // (we could do deeper comparison but the above catches most cases)
    return false;
  }

  /**
   * Mark all form fields as touched
   */
  private markAllFieldsAsTouched() {
    Object.keys(this.cardForm.controls).forEach((key) => {
      this.cardForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Check if form is valid for debugging
   */
  get isFormValid(): boolean {
    return this.cardForm.valid;
  }

  /**
   * Get form errors for debugging
   */
  get formErrors(): any {
    const errors: any = {};
    Object.keys(this.cardForm.controls).forEach((key) => {
      const control = this.cardForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
