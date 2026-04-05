import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginData } from '../../interfaces/login.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  private sessionLoadedSubject = new BehaviorSubject<boolean>(false);
  sessionLoaded$ = this.sessionLoadedSubject.asObservable();

  constructor() {
    this.restoreSession();
  }

  public restoreSession(): void {
    this.http.get<any>(`${environment.apiBaseUrl}/user/me`).subscribe({
      next: (response) => {
        this.userSubject.next(response.user);
        this.sessionLoadedSubject.next(true);
      },
      error: () => {
        this.userSubject.next(null);
        this.sessionLoadedSubject.next(true);
      },
    });
  }

  public login(loginData: LoginData): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/user/login`, loginData).pipe(
      tap((response) => {
        this.userSubject.next(response.user);
      }),
    );
  }

  public logout(): void {
    this.http.post(`${environment.apiBaseUrl}/user/logout`, {}).subscribe({
      complete: () => this.userSubject.next(null),
    });
  }

  public getCurrentUser() {
    return this.userSubject.value;
  }

  public isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }
}
