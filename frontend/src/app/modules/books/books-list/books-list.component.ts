// src/app/modules/books/books-list/books-list.component.ts
import { Component, OnInit } from '@angular/core';
import { BookService } from '../../../services/book.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-books-list',
  standalone: false,
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss']
})
export class BooksListComponent implements OnInit {
  books$!: Observable<any[]>;  

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit(): void {
    console.log('📚 BooksListComponent загружен!');
    this.books$ = this.bookService.getBooks();
    this.books$.subscribe({
      next: (books) => console.log('📚 Данные книг:', books),
      error: (err) => console.error('❌ Ошибка загрузки книг:', err)
    });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/books', id]);
  }
}
