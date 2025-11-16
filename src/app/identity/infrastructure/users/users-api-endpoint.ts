import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { map, Observable } from 'rxjs';
import { User } from '../../domain/model/user.entity';
import { UserResource, UsersResponse } from './users-response';
import { UsersAssembler } from './users-assembler';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
/**
 * API endpoint service for user-related operations.
 * Extends BaseApiEndpoint to provide CRUD and custom user methods.
 */
export class UsersApiEndpoint extends BaseApiEndpoint<
  User,
  UserResource,
  UsersResponse,
  UsersAssembler
> {
  /**
   * Initializes the UsersApiEndpoint with the base URL and assembler.
   * @param http Angular HttpClient for HTTP requests
   */
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderUserEndpointPath}`, new UsersAssembler());
  }

  /**
   * Retrieves users filtered by role.
   * @param role User role to filter by ('OWNER' or 'CONSUMER')
   * @returns Observable with an array of User entities
   */
  getByRole(role: 'OWNER' | 'CONSUMER'): Observable<User[]> {
    return this.http
      .get<UserResource[]>(`${this.endpointUrl}?role=${encodeURIComponent(role)}`)
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }

  /**
   * Registers a new user using the authentication endpoint.
   * @param user User entity to register
   * @returns Observable with the created UserResource
   */
  register(user: User): Observable<UserResource> {
    return this.http.post<UserResource>(`${environment.platformProviderApiBaseUrl}/authentication/sign-up`, user);
  }

  /**
   * Login user with email and password using POST request.
   * @param email User's email
   * @param password User's password
   * @returns Observable with the found UserResource or undefined if not found
   */
  login(email: string, password: string): Observable<UserResource | undefined> {
    const loginBody = { email, password };
    return this.http
      .post<UserResource>(`${environment.platformProviderApiBaseUrl}/authentication/sign-in`, loginBody)
      .pipe(
        map(user => user || undefined)
      );
  }

  /**
   * Updates an existing user entity.
   * @param entity User entity to update
   * @param id User ID
   * @returns Observable with the updated User entity
   */
  override update(entity: User, id: number): Observable<User> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<UserResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      // catchError is available from rxjs/operators, useful for error handling
      // If you have handleError in the parent, you can call it like this:
      // catchError(this.handleError('Failed to update user'))
    );
  }

  /**
   * Updates an existing user (returns UserResource).
   * @param user User entity to update
   * @returns Observable with the updated UserResource
   */
  updateUser(user: User): Observable<UserResource> {
    return this.http.put<UserResource>(
      `${this.endpointUrl}/${encodeURIComponent(user.id)}`,
      user
    );
  }
}
