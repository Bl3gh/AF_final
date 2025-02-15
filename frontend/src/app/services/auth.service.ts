// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  verify(data: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify`, data);
  }

  login(data: any): Observable<any> {
    // Преобразуем данные в формат x-www-form-urlencoded
    const body = new HttpParams()
      .set('username', data.email)
      .set('password', data.code);
    return this.http.post(`${this.baseUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  // Получение профиля с отправкой токена в теле запроса (POST /auth/profile)
  getProfile(): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }
    return this.http.post(`${this.baseUrl}/profile`, { token });
  }

  // Обновление профиля с отправкой токена в теле запроса (PUT /auth/update_profile)
  updateProfile(payload: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const data = { token, ...payload };
    return this.http.put(`${this.baseUrl}/update_profile`, data);
  }
}
