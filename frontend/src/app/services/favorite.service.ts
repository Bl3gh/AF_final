// src/app/services/favorite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'http://localhost:8000/favorites';

  constructor(private http: HttpClient) {}

  // Добавить книгу в избранное
  addFavorite(user_id: number, book_id: number): Observable<any> {
    const body = { user_id, book_id };
    return this.http.post<any>(`${this.apiUrl}`, body);
  }

  // Получить список избранных книг для пользователя
  getFavorites(user_id: number): Observable<any[]> {
    const params = new HttpParams().set('user_id', user_id.toString());
    return this.http.get<any[]>(`${this.apiUrl}`, { params });
  }

  // Удалить книгу из избранного
  removeFavorite(user_id: number, book_id: number): Observable<any> {
    let params = new HttpParams();
    params = params.set('user_id', user_id.toString()).set('book_id', book_id.toString());
    return this.http.delete<any>(`${this.apiUrl}`, { params });
  }
}
