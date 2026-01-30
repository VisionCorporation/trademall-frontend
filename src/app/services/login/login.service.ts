import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginData } from '../../interfaces/login.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);

  public login(loginData: LoginData): Observable<Object> {
    return this.http.post<Object>(`${environment.apiBaseUrl}/user/login`, loginData);
  }
}
