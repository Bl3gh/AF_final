// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient) {}

  // Получить информацию о текущем пользователе
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  // Получить список всех пользователей (для администратора)
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Получить данные пользователя по ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Обновить данные пользователя (например, имя и пароль)
  updateUser(id: number, data: { name: string; password: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Удалить пользователя по ID
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
