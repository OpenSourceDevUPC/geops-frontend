import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, switchMap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartApi } from '../../cart/infrastructure/cart-api';

/**
 * Campaign Cart Cleanup Service
 *
 * Infrastructure service responsible for removing offers from all user carts
 * when a campaign changes to a non-active status (PAUSED or FINALIZED).
 *
 * This service is part of the infrastructure layer and can be reused across
 * multiple presentation components (campaigns, resumen, edit-campaign).
 */
@Injectable({
  providedIn: 'root'
})
export class CampaignCartCleanupService {
  private readonly http = inject(HttpClient);
  private readonly cartApi = inject(CartApi);

  /**
   * Remove all offers associated with a campaign from all user carts
   *
   * @param campaignId - The ID of the campaign whose offers should be removed
   * @returns Observable that completes when all cart items are removed
   *
   * Process:
   * 1. Fetch all offers belonging to the campaign
   * 2. Fetch all carts in the system
   * 3. For each cart, identify items that match the campaign's offers
   * 4. Remove matching items from each cart
   */
  removeOffersFromAllCarts(campaignId: number): Observable<any> {
    console.log('[CampaignCartCleanup] Starting cart cleanup for campaign:', campaignId);

    // 1. Get all offers from this campaign
    return this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/offers/campaign/${campaignId}`).pipe(
      switchMap(offers => {
        if (!offers || offers.length === 0) {
          console.log('[CampaignCartCleanup] No offers found for campaign:', campaignId);
          return of(null);
        }

        const offerIds = offers.map(o => o.id);
        console.log('[CampaignCartCleanup] Found offers to remove from carts:', offerIds);

        // 2. Get all carts
        return this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/carts`).pipe(
          switchMap(carts => {
            if (!carts || carts.length === 0) {
              console.log('[CampaignCartCleanup] No carts found');
              return of(null);
            }

            // 3. For each cart, remove items that match the offer IDs
            const removeOperations = carts
              .filter(cart => cart.items && cart.items.length > 0)
              .map(cart => {
                const itemsToRemove = cart.items.filter((item: any) => offerIds.includes(item.offerId));

                if (itemsToRemove.length === 0) {
                  return of(null);
                }

                console.log(`[CampaignCartCleanup] Removing ${itemsToRemove.length} items from cart ${cart.userId}`);

                // Remove each item from the cart
                const removeRequests = itemsToRemove.map((item: any) =>
                  this.cartApi.removeItemFromCart(cart.userId, item.offerId).pipe(
                    catchError(err => {
                      console.warn(`[CampaignCartCleanup] Error removing offer ${item.offerId} from cart ${cart.userId}:`, err);
                      return of(null);
                    })
                  )
                );

                return forkJoin(removeRequests);
              });

            if (removeOperations.length === 0) {
              console.log('[CampaignCartCleanup] No items to remove from any cart');
              return of(null);
            }

            return forkJoin(removeOperations);
          }),
          catchError(err => {
            console.error('[CampaignCartCleanup] Error fetching carts:', err);
            return of(null);
          })
        );
      }),
      catchError(err => {
        console.error('[CampaignCartCleanup] Error fetching offers:', err);
        return of(null);
      })
    );
  }
}
