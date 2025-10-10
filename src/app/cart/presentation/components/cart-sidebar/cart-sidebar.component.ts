import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartApi } from '../../../infrastructure/cart-api';
import { Cart } from '../../../domain/model/cart.entity';
import { CartItem } from '../../../domain/model/cart-item.entity';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.css'
})
export class CartSidebarComponent implements OnInit {
  private readonly cartApi = inject(CartApi);
  private readonly translateService = inject(TranslateService);

  // Signals
  isOpen = signal(false);
  cart = signal<Cart | null>(null);
  isLoading = signal(false);

  ngOnInit() {
    // Subscribe to cart changes
    this.cartApi.cart$.subscribe(cart => {
      this.cart.set(cart);
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
    // Using hardcoded user ID for now - in real app would come from auth service
    this.cartApi.getCartByUserId('f255').subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Update item quantity
   * @param item - Cart item to update
   * @param quantity - New quantity
   */
  updateQuantity(item: CartItem, quantity: number) {
    this.cartApi.updateItemQuantity('f255', item.offerId, quantity).subscribe({
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  /**
   * Remove item from cart
   * @param item - Cart item to remove
   */
  removeItem(item: CartItem) {
    this.cartApi.removeItemFromCart('f255', item.offerId).subscribe({
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cartApi.clearCart('f255').subscribe({
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  /**
   * Proceed to checkout (placeholder)
   */
  proceedToCheckout() {
    // TODO: Implement checkout logic
    console.log('Proceeding to checkout...');
    this.close();
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
}
