import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Campaign } from '../domain/model/campaign.entity';
import { CampaignOffer } from '../domain/model/offer.entity';
import {
  CampaignResource,
  CampaignResponse,
  CreateCampaignResource,
  UpdateCampaignResource,
  OfferResource,
  OfferResponse,
  CreateOfferResource,
  UpdateOfferResource
} from './campaign-response';

/**
 * Campaign Assembler
 *
 * Converts between Campaign entities and API resources.
 * Implements the BaseAssembler interface for type safety.
 */
export class CampaignAssembler implements BaseAssembler<Campaign, CampaignResource, CampaignResponse> {

  /**
   * Converts API resource to domain entity
   */
  toEntityFromResource(resource: CampaignResource): Campaign {
    return {
      id: resource.id,
      userId: resource.userId,
      name: resource.name,
      description: resource.description,
      startDate: resource.startDate,
      endDate: resource.endDate,
      status: resource.status as 'ACTIVE' | 'INACTIVE' | 'EXPIRED',
      estimatedBudget: resource.estimatedBudget,
      totalImpressions: resource.totalImpressions,
      totalClicks: resource.totalClicks,
      CTR: resource.CTR,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };
  }

  /**
   * Converts domain entity to API resource
   */
  toResourceFromEntity(entity: Campaign): CampaignResource {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
      startDate: entity.startDate,
      endDate: entity.endDate,
      status: entity.status,
      estimatedBudget: entity.estimatedBudget,
      totalImpressions: entity.totalImpressions,
      totalClicks: entity.totalClicks,
      CTR: entity.CTR,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Converts API response to array of domain entities
   */
  toEntitiesFromResponse(response: CampaignResponse): Campaign[] {
    if (!Array.isArray(response.data)) {
      return [this.toEntityFromResource(response.data)];
    }
    return response.data.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts create command to API resource
   */
  toCreateResource(entity: Partial<Campaign>): CreateCampaignResource {
    return {
      userId: entity.userId!,
      name: entity.name!,
      description: entity.description!,
      startDate: entity.startDate!,
      endDate: entity.endDate!,
      status: entity.status || 'INACTIVE',
      estimatedBudget: entity.estimatedBudget || 0
    };
  }

  /**
   * Converts update command to API resource
   */
  toUpdateResource(entity: Partial<Campaign>): UpdateCampaignResource {
    const resource: UpdateCampaignResource = {};

    if (entity.name !== undefined) resource.name = entity.name;
    if (entity.description !== undefined) resource.description = entity.description;
    if (entity.startDate !== undefined) resource.startDate = entity.startDate;
    if (entity.endDate !== undefined) resource.endDate = entity.endDate;
    if (entity.status !== undefined) resource.status = entity.status;
    if (entity.estimatedBudget !== undefined) resource.estimatedBudget = entity.estimatedBudget;
    if (entity.totalImpressions !== undefined) resource.totalImpressions = entity.totalImpressions;
    if (entity.totalClicks !== undefined) resource.totalClicks = entity.totalClicks;
    if (entity.CTR !== undefined) resource.ctr = entity.CTR;

    return resource;
  }
}

/**
 * Offer Assembler
 *
 * Converts between Offer entities and API resources.
 */
export class OfferAssembler implements BaseAssembler<CampaignOffer, OfferResource, OfferResponse> {

  /**
   * Converts API resource to domain entity
   */
  toEntityFromResource(resource: OfferResource): CampaignOffer {
    return {
      id: resource.id,
      campaignId: resource.campaignId,
      title: resource.title,
      partner: resource.partner,
      price: resource.price,
      originalPrice: resource.originalPrice,
      description: resource.description,
      category: resource.category,
      location: resource.location,
      latitude: resource.latitude,
      longitude: resource.longitude,
      imageUrl: resource.imageUrl,
      validUntil: resource.validUntil,
      codePrefix: resource.codePrefix,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    };
  }

  /**
   * Converts domain entity to API resource
   */
  toResourceFromEntity(entity: CampaignOffer): OfferResource {
    return {
      id: entity.id,
      campaignId: entity.campaignId,
      title: entity.title,
      partner: entity.partner,
      price: entity.price,
      originalPrice: entity.originalPrice,
      description: entity.description,
      category: entity.category,
      location: entity.location,
      latitude: entity.latitude,
      longitude: entity.longitude,
      imageUrl: entity.imageUrl,
      validUntil: entity.validUntil,
      codePrefix: entity.codePrefix,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  /**
   * Converts API response to array of domain entities
   */
  toEntitiesFromResponse(response: OfferResponse): CampaignOffer[] {
    if (!Array.isArray(response.data)) {
      return [this.toEntityFromResource(response.data)];
    }
    return response.data.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts create command to API resource
   */
  toCreateResource(entity: Partial<CampaignOffer>): CreateOfferResource {
    return {
      campaignId: entity.campaignId!,
      title: entity.title!,
      partner: entity.partner!,
      price: entity.price!,
      originalPrice: entity.originalPrice,
      description: entity.description,
      category: entity.category,
      location: entity.location,
      latitude: entity.latitude,
      longitude: entity.longitude,
      imageUrl: entity.imageUrl,
      validUntil: entity.validUntil,
      codePrefix: entity.codePrefix
    };
  }

  /**
   * Converts update command to API resource
   */
  toUpdateResource(entity: Partial<CampaignOffer>): UpdateOfferResource {
    const resource: UpdateOfferResource = {};

    if (entity.title !== undefined) resource.title = entity.title;
    if (entity.partner !== undefined) resource.partner = entity.partner;
    if (entity.price !== undefined) resource.price = entity.price;
    if (entity.originalPrice !== undefined) resource.originalPrice = entity.originalPrice;
    if (entity.description !== undefined) resource.description = entity.description;
    if (entity.category !== undefined) resource.category = entity.category;
    if (entity.location !== undefined) resource.location = entity.location;
    if (entity.latitude !== undefined) resource.latitude = entity.latitude;
    if (entity.longitude !== undefined) resource.longitude = entity.longitude;
    if (entity.imageUrl !== undefined) resource.imageUrl = entity.imageUrl;
    if (entity.validUntil !== undefined) resource.validUntil = entity.validUntil;
    if (entity.codePrefix !== undefined) resource.codePrefix = entity.codePrefix;

    return resource;
  }
}
