import { BaseAssembler } from '../../../shared/infrastructure/base-assembler';
import { User } from '../../domain/model/user.entity';
import { UserResource, UsersResponse } from './users-response';

/**
 * Assembler for converting between User entities and resources.
 */
export class UsersAssembler implements BaseAssembler<User, UserResource, UsersResponse> {
  toEntityFromResource(r: UserResource): User {
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      password: r.password ?? '',
      role: r.role,
      plan: r.plan,
      phone: r.phone,

      // Legacy fields
      business: r.business,
      favorites: r.favorites,
      home: r.home,
      work: r.work,
      university: r.university,
      locationPermission: r.locationPermission,

      // New fields
      detailsConsumer: r.detailsConsumer,
      detailsSupplier: r.detailsSupplier,
      createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined
    };
  }

  toResourceFromEntity(e: User): UserResource {
    return {
      id: e.id,
      name: e.name,
      email: e.email,
      password: e.password,
      role: e.role,
      plan: e.plan,
      phone: e.phone,

      // Legacy fields
      business: e.business,
      favorites: e.favorites,
      home: e.home,
      work: e.work,
      university: e.university,
      locationPermission: e.locationPermission,

      // New fields
      detailsConsumer: e.detailsConsumer,
      detailsSupplier: e.detailsSupplier,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    };
  }

  toEntitiesFromResponse(_resp: UsersResponse): User[] {
    return [];
  }
}
