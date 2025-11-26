import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Sign-up request body
 */
export interface SignUpRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Sign-in request body
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Authentication response from backend
 */
export interface AuthenticationResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  plan: string;
  message?: string;
  // If backend returns token in the future
  token?: string;
}

/**
 * API Endpoint for authentication operations (sign-up, sign-in)
 */
@Injectable({ providedIn: 'root' })
export class AuthenticationApiEndpoint {
  private baseUrl = `${environment.platformProviderApiBaseUrl}/authentication`;

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   * POST /api/v1/authentication/sign-up
   */
  signUp(body: SignUpRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/sign-up`, body);
  }

  /**
   * Authenticate a user
   * POST /api/v1/authentication/sign-in
   */
  signIn(body: SignInRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/sign-in`, body);
  }
}
