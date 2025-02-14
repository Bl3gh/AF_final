// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  registration_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) {}

  // Регистрация пользователя
  register(userData: { email: string; name: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Верификация аккаунта с помощью кода, отправленного на email
  verify(email: string, code: string): Observable<any> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);
    return this.http.post(`${this.apiUrl}/verify`, formData);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>('http://localhost:8000/auth/me');
  }

  // Вход в систему (используем email и код, как пароль)
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Обновление профиля: смена имени и/или пароля
  updateProfile(data: { user_id: string; name?: string; new_password?: string }): Observable<any> {
    // Передаём данные как JSON
    return this.http.put(`${this.apiUrl}/update_profile`, data);
  }

  // (Опционально) Проверка доступности email
  checkEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-email?email=${email}`);
  }
}
