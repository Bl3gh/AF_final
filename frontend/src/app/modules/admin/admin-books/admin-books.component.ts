// src/app/modules/admin/admin-books/admin-books.component.ts
import { Component, OnInit } from '@angular/core';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-admin-books',
  standalone: false,
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.scss']
})
export class AdminBooksComponent implements OnInit {
  books: any[] = [];

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data: any[]) => this.books = data);
  }

  deleteBook(id: number): void {
    this.bookService.deleteBook(id).subscribe(() => {
      this.books = this.books.filter(book => book.id !== id);
    });
  }
}
