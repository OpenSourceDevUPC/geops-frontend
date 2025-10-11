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

  /**
   * Loads the user saved in localStorage
   */
  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
        console.log('[AuthService] User loaded from localStorage:', user.id);
      } catch (e) {
        console.error('[AuthService] Error parsing user:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Gets the current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Gets the current user's ID
   */
  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user?.id ?? null;
  }

  /**
   * Checks if there is an authenticated user
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Logs in with email and password
   */
  login(email: string, password: string): Observable<User | null> {
    return this.usersApi.login(email, password).pipe(
      map(userResource => {
        if (!userResource) return null;

        const user: User = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        console.log('[AuthService] Successful login. User ID:', user.id);
        return user;
      })
    );
  }

  /**
   * Registers a new user
   */
  register(userData: Omit<User, 'id'>): Observable<User> {
    return this.usersApi.register(userData as User).pipe(
      map(userResource => {
        const user: User = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        console.log('[AuthService] Successful registration. User ID:', user.id);
        return user;
      })
    );
  }

  /**
   * Logs out
   */
  logout(): void {
    console.log('[AuthService] Logging out');
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  /**
   * Sets the current user and saves it in localStorage
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Converts UserResource to User
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
      business: resource.business,
      favorites: resource.favorites ?? [],
      home: resource.home ?? '',
      work: resource.work ?? '',
      university: resource.university ?? '',
      locationPermission: resource.locationPermission ?? 'ASK'
    };
  }

  // --- CORRECTED CODE BELOW ---
  updateUser(user: User): Observable<User> {
    return this.usersApi.update(user, user.id).pipe(
      map((userResource: any) => {
        const updated = this.mapResourceToUser(userResource);
        this.setCurrentUser(updated);
        return updated;
      })
    );
  }

  /**
   * Refresh current user from API
   * Useful if user data might have changed
   */
  refreshCurrentUser(): Observable<User | null> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('[AuthService] No authenticated user to refresh');
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }
    return this.usersApi.getById(userId).pipe(
      map(userResource => {
        if (!userResource) return null;
        const user = this.mapResourceToUser(userResource);
        this.setCurrentUser(user);
        console.log('[AuthService] User refreshed. ID:', user.id);
        return user;
      })
    );
  }
}
