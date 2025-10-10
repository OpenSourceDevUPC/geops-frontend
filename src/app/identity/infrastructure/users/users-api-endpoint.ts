// src/app/identity/infrastructure/users/users-api-endpoint.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { map, Observable } from 'rxjs';
import { User } from '../../domain/model/user.entity';
import { UserResource, UsersResponse } from './users-response';
import { UsersAssembler } from './users-assembler';

@Injectable({ providedIn: 'root' })
export class UsersApiEndpoint extends BaseApiEndpoint<
  User,
  UserResource,
  UsersResponse,
  UsersAssembler
> {
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/users', new UsersAssembler());
  }

  // Filtro por rol
  getByRole(role: 'OWNER' | 'CONSUMER'): Observable<User[]> {
    return this.http
      .get<UserResource[]>(`${this.endpointUrl}?role=${encodeURIComponent(role)}`)
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }

  // Registro de usuario (solo guarda en db.json)
  register(user: User): Observable<UserResource> {
    return this.http.post<UserResource>('http://localhost:3000/users', user);
  }

  // Login simulado (busca usuario por email y password)
  login(email: string, password: string): Observable<UserResource | undefined> {
    return this.http
      .get<UserResource[]>(`http://localhost:3000/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
      .pipe(
        map(users => users.length ? users[0] : undefined)
      );
  }

  override update(entity: User, id: number): Observable<User> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<UserResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      // catchError viene de rxjs/operators, útil para manejo de errores
      // Si tienes handleError en el padre, puedes llamarlo así:
      // catchError(this.handleError('Failed to update user'))
    );
  }


  // Actualiza un usuario existente
  updateUser(user: User): Observable<UserResource> {
    return this.http.put<UserResource>(
      `${this.endpointUrl}/${encodeURIComponent(user.id)}`,
      user
    );
  }
}
