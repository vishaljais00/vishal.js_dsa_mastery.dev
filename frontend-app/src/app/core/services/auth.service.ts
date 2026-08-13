import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  name: string;
  role?: 'user' | 'admin';
  avatarUrl: string;
  lastLoginDate?: string;
  loginStreak?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  public currentUserSignal = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadSavedSession();
  }

  private loadSavedSession() {
    const savedUser = localStorage.getItem('dsa_user');
    if (savedUser) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch {
        this.currentUserSignal.set(null);
      }
    } else {
      this.currentUserSignal.set(null); // Default to logged out (Guest)
    }
  }

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res: { token: string; user: User }) => {
        this.currentUserSignal.set(res.user);
        localStorage.setItem('dsa_user', JSON.stringify(res.user));
      })
    );
  }

  register(username: string, email: string, password: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/register`, { username, email, password }).pipe(
      tap((res: { token: string; user: User }) => {
        this.currentUserSignal.set(res.user);
        localStorage.setItem('dsa_user', JSON.stringify(res.user));
      })
    );
  }

  loginWithGoogle(googleToken: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/google`, { token: googleToken }).pipe(
      tap((res: { token: string; user: User }) => {
        this.currentUserSignal.set(res.user);
        localStorage.setItem('dsa_user', JSON.stringify(res.user));
      })
    );
  }


  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem('dsa_user');
  }

  forgotPassword(emailOrUsername: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/forgot-password`, { emailOrUsername });
  }

  resetPassword(emailOrUsername: string, otpCode: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/reset-password`, { emailOrUsername, otpCode, newPassword });
  }
}
