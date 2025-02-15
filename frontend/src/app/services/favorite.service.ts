// src/app/services/favorite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'http://127.0.0.1:8000/favorites';

  constructor(private http: HttpClient) {}

  // Добавить книгу в избранное; бэкенд определяет пользователя по токену
  addFavorite(book_id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.post<any>(`${this.apiUrl}/add`, { token, book_id });
  }

  // Получить список избранных книг; бэкенд извлекает user_id из токена
  getFavorites(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    return this.http.post<any[]>(`${this.apiUrl}/profile`, { token });
  }

  // Удалить книгу из избранного; бэкенд использует токен для определения пользователя
  removeFavorite(book_id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    // Если ваш бэкенд реализован как DELETE, то можно передать параметры как query,
    // но лучше, если он принимает тело запроса.
    return this.http.request<any>('delete', `${this.apiUrl}/remove`, { body: { token, book_id } });
  }
}
