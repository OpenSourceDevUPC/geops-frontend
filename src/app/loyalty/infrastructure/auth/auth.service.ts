import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../domain/model/user.entity';
import { UsersApiEndpoint } from '../users/users-api-endpoint';
import { UserResource } from '../users/users-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private usersApi: UsersApiEndpoint) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
        console.log('[AuthService] Usuario cargado desde localStorage:', user.id);
      } catch (e) {
        console.error('[AuthService] Error al parsear usuario:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user?.id ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  login(email: string, password: string): Observable<User | null> {
    return this.usersApi.login(email, password).pipe(
      map(userResource => {
        if (!userResource) return null;
        const user: User = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        console.log('[AuthService] Login exitoso. Usuario ID:', user.id);
        return user;
      })
    );
  }

  register(userData: Omit<User, 'id'>): Observable<User> {
    return this.usersApi.register(userData as User).pipe(
      map(userResource => {
        const user: User = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        console.log('[AuthService] Registro exitoso. Usuario ID:', user.id);
        return user;
      })
    );
  }

  logout(): void {
    console.log('[AuthService] Cerrando sesión');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private mapResourceToUser(resource: UserResource): User {
    return {
      id: resource.id,
      name: resource.name,
      email: resource.email,
      password: resource.password,
      role: resource.role,
      plan: resource.plan,
      phone: resource.phone,
      business: resource.business,
      favorites: resource.favorites ?? [],
      home: resource.home ?? '',
      work: resource.work ?? '',
      university: resource.university ?? '',
      locationPermission: resource.locationPermission ?? 'ASK'
    };
  }


  // --- CÓDIGO CORREGIDO ABAJO ---
  updateUser(user: User): Observable<User> {
    return this.usersApi.update(user, user.id).pipe(
      map((userResource: any) => {
        const updated = this.mapResourceToUser(userResource);
        this.setCurrentUser(updated);
        return updated;
      })
    );
  }
}
