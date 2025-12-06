import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { Offer } from '../../domain/model/offer.entity';
import { OfferResource, OffersResponse } from './offers-response';
import { OffersAssembler } from './offers-assembler';
import { map, Observable, switchMap, forkJoin, of, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CampaignStore } from '../../../campaign/application/campaign.store';

@Injectable({ providedIn: 'root' })
export class OffersApiEndpoint extends BaseApiEndpoint<
  Offer,
  OfferResource,
  OffersResponse,
  OffersAssembler
> {
  private readonly clickQueue = new Map<number, number>();
  private readonly impressionQueue = new Map<number, number>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly FLUSH_DELAY_MS = 800;

  /**
   * creates an instance of the offersApiEndpoint service
   * @param http - angular http client
   */
  constructor(http: HttpClient, private readonly campaignStore: CampaignStore) {
    super(http, `${environment.platformProviderApiBaseUrl}/offers`, new OffersAssembler());
  }

  /**
   * Override getAll() to filter offers by active campaigns only
   */
  override getAll(): Observable<Offer[]> {
    return this.http.get<OfferResource[]>(this.endpointUrl).pipe(
      switchMap(offers => {
        if (!offers || offers.length === 0) {
          return of([]);
        }

        // Get unique campaign IDs
        const campaignIds = Array.from(new Set(offers.map(o => o.campaignId)));

        // Fetch all campaigns with error handling
        const campaignRequests = campaignIds.map(id =>
          this.http.get<any>(`${environment.platformProviderApiBaseUrl}/campaigns/${id}`).pipe(
            map(campaign => ({ id, status: campaign.status })),
            catchError(err => {
              console.warn(`[OffersApiEndpoint] Campaign ${id} not found or error:`, err);
              return of({ id, status: 'PAUSED' }); // Treat as inactive if error
            })
          )
        );

        return forkJoin(campaignRequests).pipe(
          map(campaigns => {
            // Filter only ACTIVE campaigns
            const activeCampaignIds = campaigns
              .filter(c => c.status === 'ACTIVE')
              .map(c => c.id);

            // Filter offers by active campaigns
            const filteredOffers = offers
              .filter(offer => activeCampaignIds.includes(offer.campaignId))
              .map(r => this.assembler.toEntityFromResource(r));

            return filteredOffers;
          })
        );
      }),
      catchError(err => {
        console.error('[OffersApiEndpoint] Error fetching offers:', err);
        return of([]);
      })
    );
  }

  /**
   * gets a set of offers for its ids
   * Also filters by active campaigns
   * @param ids - list of ids
   */
  getByIds(ids: number[]): Observable<Offer[]> {
    const qs = ids.map(id => `id=${encodeURIComponent(String(id))}`).join('&');
    return this.http
      .get<OfferResource[]>(`${this.endpointUrl}?${qs}`)
      .pipe(
        switchMap(offers => {
          if (!offers || offers.length === 0) {
            return of([]);
          }

          // Get unique campaign IDs
          const campaignIds = Array.from(new Set(offers.map(o => o.campaignId)));

          // Fetch all campaigns with error handling
          const campaignRequests = campaignIds.map(id =>
            this.http.get<any>(`${environment.platformProviderApiBaseUrl}/campaigns/${id}`).pipe(
              map(campaign => ({ id, status: campaign.status })),
              catchError(err => {
                console.warn(`[OffersApiEndpoint] Campaign ${id} not found or error:`, err);
                return of({ id, status: 'PAUSED' }); // Treat as inactive if error
              })
            )
          );

          return forkJoin(campaignRequests).pipe(
            map(campaigns => {
              // Filter only ACTIVE campaigns
              const activeCampaignIds = campaigns
                .filter(c => c.status === 'ACTIVE')
                .map(c => c.id);

              // Filter offers by active campaigns
              const filteredOffers = offers
                .filter(offer => activeCampaignIds.includes(offer.campaignId))
                .map(r => this.assembler.toEntityFromResource(r));


              return filteredOffers;
            })
          );
        }),
        catchError(err => {
          console.error('[OffersApiEndpoint] Error fetching offers by IDs:', err);
          return of([]);
        })
      );
  }

  recordCampaignClick(campaignId?: number): void {
    if (!this.isValidCampaignId(campaignId)) {
      return;
    }
    this.incrementQueue(this.clickQueue, campaignId!, 1);
    this.scheduleFlush();
  }

  recordCampaignImpressions(campaignIds: number[]): void {
    let hasValidIds = false;
    campaignIds.forEach(id => {
      if (this.isValidCampaignId(id)) {
        this.incrementQueue(this.impressionQueue, id, 1);
        hasValidIds = true;
      }
    });

    if (hasValidIds) {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      return;
    }
    this.flushTimer = setTimeout(() => this.flushQueues(), OffersApiEndpoint.FLUSH_DELAY_MS);
  }

  private flushQueues(): void {
    if (!this.clickQueue.size && !this.impressionQueue.size) {
      this.clearFlushTimer();
      return;
    }

    const deltas = new Map<number, { clicks?: number; impressions?: number }>();

    const appendDelta = (campaignId: number, partial: { clicks?: number; impressions?: number }) => {
      const current = deltas.get(campaignId) ?? {};
      deltas.set(campaignId, {
        clicks: (current.clicks ?? 0) + (partial.clicks ?? 0),
        impressions: (current.impressions ?? 0) + (partial.impressions ?? 0)
      });
    };

    this.clickQueue.forEach((value, campaignId) => appendDelta(campaignId, { clicks: value }));
    this.impressionQueue.forEach((value, campaignId) => appendDelta(campaignId, { impressions: value }));

    this.clickQueue.clear();
    this.impressionQueue.clear();

    deltas.forEach((delta, campaignId) => {
      this.campaignStore.applyEngagementDelta(campaignId, delta);
    });

    this.clearFlushTimer();
  }

  private clearFlushTimer(): void {
    if (!this.flushTimer) {
      return;
    }
    clearTimeout(this.flushTimer);
    this.flushTimer = null;
  }

  private incrementQueue(queue: Map<number, number>, campaignId: number, amount: number): void {
    queue.set(campaignId, (queue.get(campaignId) ?? 0) + amount);
  }

  private isValidCampaignId(id?: number): id is number {
    return typeof id === 'number' && id > 0;
  }
}
