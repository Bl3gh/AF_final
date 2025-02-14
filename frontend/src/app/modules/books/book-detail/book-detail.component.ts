// src/app/modules/books/book-detail/book-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-book-detail',
  standalone: false,
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  book: any;

  constructor(private route: ActivatedRoute, private bookService: BookService) { }

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id')!;
    this.bookService.getBookById(bookId).subscribe((data: any) => {
      this.book = data;
    });
  }

  downloadPdf(): void {
    this.bookService.downloadPdf(this.book.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }
}