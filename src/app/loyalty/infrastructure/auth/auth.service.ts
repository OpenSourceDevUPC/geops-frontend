import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../../domain/model/user.entity';
import { UsersApiEndpoint } from '../users-api-endpoint';
import { UserResource } from '../users-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private usersApi: UsersApiEndpoint) {
    this.loadUserFromStorage();
  }

  /**
   * Carga el usuario guardado en localStorage
   */
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

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user?.id ?? null;
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Inicia sesión con email y password
   */
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

  /**
   * Registra un nuevo usuario
   */
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

  /**
   * Cierra sesión
   */
  logout(): void {
    console.log('[AuthService] Cerrando sesión');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  /**
   * Establece el usuario actual y lo guarda en localStorage
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Convierte UserResource a User
   */
  private mapResourceToUser(resource: UserResource): User {
    return {
      id: resource.id,
      name: resource.name,
      email: resource.email,
      password: resource.password,
      role: resource.role,
      plan: resource.plan,
      phone: resource.phone,
      business: resource.business
    };
  }
}
