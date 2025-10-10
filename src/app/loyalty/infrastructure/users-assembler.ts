// src/app/identity/infrastructure/users/users-assembler.ts
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { UserResource, UsersResponse } from './users-response';

export class UsersAssembler implements BaseAssembler<User, UserResource, UsersResponse> {
  toEntityFromResource(r: UserResource): User {
    return { ...r };
  }
  toResourceFromEntity(e: User): UserResource {
    return { ...e };
  }
  toEntitiesFromResponse(_resp: UsersResponse): User[] {
    return [];
  }
}
