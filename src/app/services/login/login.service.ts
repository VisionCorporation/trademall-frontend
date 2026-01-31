import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginData } from '../../interfaces/login.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.restoreSession();
  }

  public login(loginData: LoginData): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/user/login`, loginData);
  }

  saveSession(response: any) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  public restoreSession(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  public logout(): void {
    localStorage.clear();
    this.userSubject.next(null);
  }

  public getToken() {
    return localStorage.getItem('token');
  }

  public isLoggedIn() {
    return !!this.getToken();
  }
}
