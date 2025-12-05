import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CampaignApi } from '../../infrastructure/campaign-api';
import { Campaign } from '../../domain/model/campaign.entity';
import { CampaignOffer } from '../../domain/model/offer.entity';

/**
 * Campaign Presentation Service
 *
 * Manages UI state and business logic for Campaign bounded context.
 * Coordinates between components and the infrastructure layer.
 * Uses BehaviorSubject pattern for reactive state management.
 */
@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly api = inject(CampaignApi);

  // Expose API observables
  public campaigns$ = this.api.campaigns$;
  public selectedCampaign$ = this.api.selectedCampaign$;
  public campaignOffers$ = this.api.campaignOffers$;

  // ==================== CAMPAIGN OPERATIONS ====================

  /**
   * Load campaigns for a user
   */
  loadCampaignsByUserId(userId: number): void {
    this.api.getCampaignsByUserId(userId).subscribe();
  }

  /**
   * Load a single campaign by ID
   */
  loadCampaignById(id: number): void {
    this.api.getCampaignById(id).subscribe();
  }

  /**
   * Create a new campaign
   */
  createCampaign(campaign: Partial<Campaign>): Observable<Campaign> {
    return this.api.createCampaign(campaign);
  }

  /**
   * Update an existing campaign
   */
  updateCampaign(id: number, campaign: Partial<Campaign>): Observable<Campaign> {
    return this.api.updateCampaign(id, campaign);
  }

  /**
   * Delete a campaign
   */
  deleteCampaign(id: number): Observable<void> {
    return this.api.deleteCampaign(id);
  }

  // ==================== OFFER OPERATIONS ====================

  /**
   * Load offers for a campaign
   */
  loadOffersByCampaignId(campaignId: number): void {
    this.api.getOffersByCampaignId(campaignId).subscribe();
  }

  /**
   * Load a single offer by ID
   */
  loadOfferById(offerId: number): void {
    this.api.getOfferById(offerId).subscribe();
  }

  /**
   * Create a new offer
   */
  createOffer(offer: Partial<CampaignOffer>): Observable<CampaignOffer> {
    return this.api.createOffer(offer);
  }

  /**
   * Update an existing offer
   */
  updateOffer(offerId: number, offer: Partial<CampaignOffer>): Observable<CampaignOffer> {
    return this.api.updateOffer(offerId, offer);
  }

  /**
   * Delete an offer
   */
  deleteOffer(offerId: number): Observable<void> {
    return this.api.deleteOffer(offerId);
  }

  // ==================== STATE MANAGEMENT ====================

  /**
   * Select a campaign
   */
  selectCampaign(campaign: Campaign | null): void {
    this.api.selectCampaign(campaign);
  }

  /**
   * Clear campaigns cache
   */
  clearCampaigns(): void {
    this.api.clearCampaigns();
  }

  /**
   * Clear offers cache
   */
  clearOffers(): void {
    this.api.clearOffers();
  }

  /**
   * Get current campaigns (synchronous)
   */
  getCurrentCampaigns(): Campaign[] {
    return this.api.getCurrentCampaigns();
  }

  /**
   * Get current selected campaign (synchronous)
   */
  getCurrentSelectedCampaign(): Campaign | null {
    return this.api.getCurrentSelectedCampaign();
  }

  /**
   * Get current offers (synchronous)
   */
  getCurrentOffers(): CampaignOffer[] {
    return this.api.getCurrentOffers();
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Calculate campaign statistics
   */
  calculateCampaignMetrics(campaign: Campaign): {
    impressions: number;
    clicks: number;
    ctr: number;
  } {
    return {
      impressions: campaign.totalImpressions,
      clicks: campaign.totalClicks,
      ctr: campaign.CTR,
    };
  }

  /**
   * Check if campaign is active
   */
  isActive(campaign: Campaign): boolean {
    return campaign.status === 'ACTIVE';
  }

  /**
   * Check if campaign has expired
   */
  isExpired(campaign: Campaign): boolean {
    const endDate = new Date(campaign.endDate);
    return endDate < new Date() || campaign.status === 'EXPIRED';
  }

  /**
   * Group campaigns by status
   */
  groupCampaignsByStatus(campaigns: Campaign[]): {
    active: Campaign[];
    inactive: Campaign[];
    expired: Campaign[];
  } {
    return {
      active: campaigns.filter(c => c.status === 'ACTIVE'),
      inactive: campaigns.filter(c => c.status === 'INACTIVE'),
      expired: campaigns.filter(c => c.status === 'EXPIRED')
    };
  }
}
