import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { MatDialog } from '@angular/material/dialog';
import { BookUploadComponent } from '../book-upload/book-upload.component';
import { FavoriteService } from '../../../services/favorite.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-combined-books',
  standalone: false,
  templateUrl: './combine-books-component.component.html',
  styleUrls: ['./combine-books-component.component.scss']
})
export class CombinedBooksComponent implements OnInit {
  books$!: Observable<any[]>;
  selectedBook: any = null;
  isFavorite: boolean = false;
  accessToken: string | null = null;
  favorites: any[] = [];

  constructor(
    private bookService: BookService, 
    private dialog: MatDialog,
    private favoriteService: FavoriteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.accessToken = localStorage.getItem('access_token');
    console.log('Access Token:', this.accessToken);
    this.loadBooks();
  }

  loadBooks(): void {
    this.books$ = this.bookService.getBooks();
  }

  goToDetail(bookId: number): void {
    this.bookService.getBookById(bookId.toString()).subscribe((book: any) => {
      this.selectedBook = book;
      if (this.accessToken) {
        this.checkFavoriteStatus();
      }
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

  checkFavoriteStatus(): void {
    // Получаем избранное для текущего пользователя через токен (FavoriteService должен использовать токен из Local Storage)
    this.favoriteService.getFavorites().subscribe((favorites: any[]) => {
      this.favorites = favorites;
      this.isFavorite = favorites.some(fav => fav.id === this.selectedBook.id);
    });
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.selectedBook.id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (err: any) => console.error(err)
      });
    } else {
      this.favoriteService.addFavorite(this.selectedBook.id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (err: any) => console.error(err)
      });
    }
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(BookUploadComponent, {
      width: '80%',
      maxWidth: '800px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.loadBooks();
    });
  }
}
