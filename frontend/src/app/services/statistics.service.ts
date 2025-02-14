// src/app/services/statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8000/statistics';

  constructor(private http: HttpClient) {}

  // Получить статистику по книгам
  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
