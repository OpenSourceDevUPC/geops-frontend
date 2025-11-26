import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { User } from '../../domain/model/user.entity';
import { UsersApiEndpoint } from '../users/users-api-endpoint';
import { AuthenticationApiEndpoint } from './authentication-api-endpoint';
import { DetailsConsumerApiEndpoint } from '../users/details-consumer-api-endpoint';
import { DetailsSupplierApiEndpoint } from '../users/details-supplier-api-endpoint';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private usersApi: UsersApiEndpoint,
    private authApi: AuthenticationApiEndpoint,
    private consumerDetailsApi: DetailsConsumerApiEndpoint,
    private supplierDetailsApi: DetailsSupplierApiEndpoint
  ) {
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
   * Gets the current user's role
   */
  getCurrentUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user?.role ?? null;
  }

  /**
   * Checks if there is an authenticated user
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Checks if current user is a CONSUMER
   */
  isConsumer(): boolean {
    return this.getCurrentUserRole() === 'CONSUMER';
  }

  /**
   * Checks if current user is an OWNER
   */
  isOwner(): boolean {
    return this.getCurrentUserRole() === 'OWNER';
  }

  /**
   * Logs in with email and password using new authentication endpoint
   */
  login(email: string, password: string): Observable<User | null> {
    return this.authApi.signIn({ email, password }).pipe(
      switchMap(authResponse => {
        // Get full user details
        return this.usersApi.getById(authResponse.id).pipe(
          switchMap(user => this.loadUserDetails(user)),
          map(user => {
            this.setCurrentUser(user);
            console.log('[AuthService] Successful login. User ID:', user.id, 'Role:', user.role);
            return user;
          })
        );
      }),
      catchError(error => {
        console.error('[AuthService] Login error:', error);
        return of(null);
      })
    );
  }

  /**
   * Registers a new user using new authentication endpoint
   */
  register(name: string, email: string, phone: string, password: string): Observable<User | null> {
    return this.authApi.signUp({ name, email, phone, password }).pipe(
      switchMap(authResponse => {
        // Get full user details
        return this.usersApi.getById(authResponse.id).pipe(
          switchMap(user => this.loadUserDetails(user)),
          map(user => {
            this.setCurrentUser(user);
            console.log('[AuthService] Successful registration. User ID:', user.id, 'Role:', user.role);
            return user;
          })
        );
      }),
      catchError(error => {
        console.error('[AuthService] Registration error:', error);
        return of(null);
      })
    );
  }

  /**
   * Loads user-specific details based on role (Consumer or Supplier)
   */
  private loadUserDetails(user: User): Observable<User> {
    if (user.role === 'CONSUMER') {
      return this.consumerDetailsApi.getByUserId(user.id).pipe(
        map(details => {
          user.detailsConsumer = this.consumerDetailsApi.toEntity(details);
          user.detailsSupplier = null;
          return user;
        }),
        catchError(() => {
          // If no details exist yet, return user without details
          user.detailsConsumer = null;
          user.detailsSupplier = null;
          return of(user);
        })
      );
    } else if (user.role === 'OWNER') {
      return this.supplierDetailsApi.getByUserId(user.id).pipe(
        map(details => {
          user.detailsSupplier = this.supplierDetailsApi.toEntity(details);
          user.detailsConsumer = null;
          return user;
        }),
        catchError(() => {
          // If no details exist yet, return user without details
          user.detailsSupplier = null;
          user.detailsConsumer = null;
          return of(user);
        })
      );
    }

    // For other roles (ADMIN, etc.), return user as-is
    return of(user);
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
   * Update current user
   */
  updateUser(user: User): Observable<User> {
    return this.usersApi.update(user, user.id).pipe(
      switchMap(updatedUser => this.loadUserDetails(updatedUser)),
      map(updatedUser => {
        this.setCurrentUser(updatedUser);
        return updatedUser;
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
      return of(null);
    }

    return this.usersApi.getById(userId).pipe(
      switchMap(user => this.loadUserDetails(user)),
      map(user => {
        this.setCurrentUser(user);
        return user;
      }),
      catchError(error => {
        console.error('[AuthService] Error refreshing user:', error);
        return of(null);
      })
    );
  }
}
