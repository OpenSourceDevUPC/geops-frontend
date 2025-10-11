import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Cart } from '../domain/model/cart.entity';
import { CartItem } from '../domain/model/cart-item.entity';
import { CartApiEndpoint } from './cart-api-endpoint';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CartApi extends BaseApi {
  private readonly cartEndpoint: CartApiEndpoint;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();
  // Cache in-flight requests per user to avoid duplicate HTTP calls
  private inFlightRequests = new Map<string, Observable<Cart>>();

  constructor(http: HttpClient) {
    super();
    this.cartEndpoint = new CartApiEndpoint(http);
  }

  /**
   * Get cart for a specific user
   * @param userId - User ID
   */
  getCartByUserId(userId: string): Observable<Cart> {
    // If we already have a cart cached for this user, return it synchronously
    const cached = this.cartSubject.value;
    if (cached && cached.userId === userId) {
      return new Observable<Cart>(subscriber => {
        subscriber.next(cached);
        subscriber.complete();
      });
    }

    // If there's an in-flight request for this user, return it
    if (this.inFlightRequests.has(userId)) {
      return this.inFlightRequests.get(userId)!;
    }

    const req$ = this.cartEndpoint.getAll().pipe(
      map((carts: Cart[]) => carts.find(cart => cart.userId === userId)),
      map(cart => {
        if (cart) return cart;
        // Create empty cart if none exists
        return {
          id: 0,
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Cart;
      }),
      tap(cart => this.cartSubject.next(cart))
    );

    // Store in-flight request with share to avoid multiple executions
    const shared$ = req$;
    this.inFlightRequests.set(userId, shared$);

    // Clean up cache when the request completes
    shared$.subscribe({
      next: () => this.inFlightRequests.delete(userId),
      error: () => this.inFlightRequests.delete(userId),
      complete: () => this.inFlightRequests.delete(userId)
    });

    return shared$;
  }

  /**
   * Add item to cart
   * @param userId - User ID
   * @param offerId - Offer ID to add
   * @param offerTitle - Offer title
   * @param offerPrice - Offer price
   * @param offerImageUrl - Offer image URL
   * @param quantity - Quantity to add
   */
  addItemToCart(
    userId: string,
    offerId: string,
    offerTitle: string,
    offerPrice: number,
    offerImageUrl: string,
    quantity: number = 1
  ): Observable<Cart> {
    return this.getCartByUserId(userId).pipe(
      map(cart => {
        const existingItemIndex = cart.items.findIndex(item => item.offerId === offerId);

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          cart.items[existingItemIndex].quantity += quantity;
          cart.items[existingItemIndex].total = cart.items[existingItemIndex].quantity * offerPrice;
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now(), // Simple ID generation
            userId,
            offerId,
            offerTitle,
            offerPrice,
            offerImageUrl,
            quantity,
            total: quantity * offerPrice
          };
          cart.items.push(newItem);
        }

        // Recalculate totals
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.total, 0);
        cart.updatedAt = new Date().toISOString();

        return cart;
      }),
      tap(updatedCart => {
        this.updateCart(updatedCart).subscribe();
        this.cartSubject.next(updatedCart);
      })
    );
  }

  /**
   * Update item quantity in cart
   * @param userId - User ID
   * @param offerId - Offer ID
   * @param quantity - New quantity
   */
  updateItemQuantity(userId: string, offerId: string, quantity: number): Observable<Cart> {
    return this.getCartByUserId(userId).pipe(
      map(cart => {
        const itemIndex = cart.items.findIndex(item => item.offerId === offerId);

        if (itemIndex >= 0) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
          } else {
            // Update quantity and total
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].total = quantity * cart.items[itemIndex].offerPrice;
          }

          // Recalculate totals
          cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
          cart.totalAmount = cart.items.reduce((sum, item) => sum + item.total, 0);
          cart.updatedAt = new Date().toISOString();
        }

        return cart;
      }),
      tap(updatedCart => {
        this.updateCart(updatedCart).subscribe();
        this.cartSubject.next(updatedCart);
      })
    );
  }

  /**
   * Remove item from cart
   * @param userId - User ID
   * @param offerId - Offer ID to remove
   */
  removeItemFromCart(userId: string, offerId: string): Observable<Cart> {
    return this.updateItemQuantity(userId, offerId, 0);
  }

  /**
   * Clear entire cart
   * @param userId - User ID
   */
  clearCart(userId: string): Observable<Cart> {
    return this.getCartByUserId(userId).pipe(
      map(cart => {
        cart.items = [];
        cart.totalItems = 0;
        cart.totalAmount = 0;
        cart.updatedAt = new Date().toISOString();
        return cart;
      }),
      tap(updatedCart => {
        this.updateCart(updatedCart).subscribe();
        this.cartSubject.next(updatedCart);
      })
    );
  }

  /**
   * Update cart in backend
   * @param cart - Cart to update
   */
  private updateCart(cart: Cart): Observable<Cart> {
    if (cart.id === 0) {
      // Create new cart
      return this.cartEndpoint.create(cart);
    } else {
      // Update existing cart
      return this.cartEndpoint.update(cart, cart.id);
    }
  }

  /**
   * Get current cart count
   */
  getCartCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart?.totalItems || 0)
    );
  }
}
