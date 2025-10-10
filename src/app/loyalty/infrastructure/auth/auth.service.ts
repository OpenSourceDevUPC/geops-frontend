import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../../domain/model/user.entity';
import { UsersApiEndpoint } from '../users-api-endpoint';
import { UserResource } from '../users-response';

@Injectable({
  providedIn: 'root'
})

/**
 * authentication service
 */

export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private usersApi: UsersApiEndpoint) {
    this.loadUserFromStorage();
  }

  /**
   * loads the saved user to keep the session started when reloading the page
   * @private
   */
  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * gets the current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * gets the id of the current user
   */
  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user?.id ?? null;
  }

  /**
   * checks if there are already authenticated users
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * login
   * @param email
   * @param password
   */
  login(email: string, password: string): Observable<User | null> {
    return this.usersApi.login(email, password).pipe(
      map(userResource => {
        if (!userResource) return null;

        const user: User = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        return user;
      })
    );
  }

  /**
   * register a new user
   * @param userData
   */
  register(userData: Omit<User, 'id'>): Observable<User> {
    return this.usersApi.register(userData as User).pipe(
      map(userResource => {
        const user: User = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        return user;
      })
    );
  }

  /**
   * log out
   */
  logout(): void {
    console.log('[AuthService] Cerrando sesión');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  /**
   * save the current user
   * @param user - authenticated user
   * @private
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * converts userResource (API) to resource
   * @param resource - resource received from the API
   * @private
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
