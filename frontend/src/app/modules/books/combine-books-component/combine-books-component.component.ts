import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { MatDialog } from '@angular/material/dialog';
import { BookUploadComponent } from '../book-upload/book-upload.component';

@Component({
  selector: 'app-combined-books',
  standalone: false,
  templateUrl: './combine-books-component.component.html',
  styleUrls: ['./combine-books-component.component.scss']
})
export class CombinedBooksComponent implements OnInit {
  books$!: Observable<any[]>;
  selectedBook: any = null;

  constructor(private bookService: BookService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.books$ = this.bookService.getBooks();
  }

  goToDetail(bookId: number): void {
    // Получаем детали книги по id
    this.bookService.getBookById(bookId.toString()).subscribe((book: any) => {
      this.selectedBook = book;
    });
  }

  closeDetail(): void {
    this.selectedBook = null;
  }

  downloadPdf(bookId: number): void {
    this.bookService.downloadPdf(bookId).subscribe((blob: Blob | MediaSource) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(BookUploadComponent, {
      width: '80%',      // например, 80% от ширины экрана
      maxWidth: '800px', // максимальная ширина
      // Можно задать и height, если требуется:
      // height: 'auto'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      // Если загрузка прошла успешно, обновляем список книг
      this.loadBooks();
    });
  }
  
}
