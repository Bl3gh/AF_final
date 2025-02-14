import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8000/books';

  constructor(private http: HttpClient) {}

  getBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getBookById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  searchBooks(keyword: string, category: string, author: string): Observable<any[]> {
    let params = new HttpParams();
    if (keyword) { params = params.set('keyword', keyword); }
    if (category) { params = params.set('category', category); }
    if (author) { params = params.set('author', author); }
    return this.http.get<any[]>(`${this.apiUrl}`, { params });
  }

  // Метод создания книги (метаданные)
  uploadBook(bookData: any): Observable<{ id: number }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ id: number }>(this.apiUrl, bookData, { headers }).pipe(
      tap((res) => console.log('✅ Книга загружена:', res))
    );
  }

  // Метод загрузки PDF (принимает File)
  uploadPdf(bookId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdf_file', file);
    // Обратите внимание на слеш между apiUrl и bookId:
    return this.http.post(`${this.apiUrl}/${bookId}/upload_pdf`, formData).pipe(
      tap((res) => console.log('✅ PDF загружен:', res))
    );
  }

  updateBook(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
