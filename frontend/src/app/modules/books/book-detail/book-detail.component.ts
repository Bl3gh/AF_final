import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../../../services/book.service';
import { FavoriteService } from '../../../services/favorite.service';

@Component({
  selector: 'app-book-detail',
  standalone: false,
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  book: any;
  isFavorite: boolean = false;
  accessToken: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private bookService: BookService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.accessToken = localStorage.getItem('access_token');
    console.log('Access Token:', this.accessToken); // Добавьте эту строку для отладки
    const bookId = this.route.snapshot.paramMap.get('id')!;
    this.bookService.getBookById(bookId).subscribe((data: any) => {
      this.book = data;
      if (this.accessToken) {
        this.checkFavoriteStatus();
      }
    });
  }
  

  downloadPdf(): void {
    this.bookService.downloadPdf(this.book.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  checkFavoriteStatus(): void {
    // Получаем избранное текущего пользователя через токен
    this.favoriteService.getFavorites().subscribe((favorites: any[]) => {
      this.isFavorite = favorites.some(fav => fav.id === this.book.id);
    });
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      // Удаляем книгу из избранного
      this.favoriteService.removeFavorite(this.book.id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: err => console.error(err)
      });
    } else {
      // Добавляем книгу в избранное
      this.favoriteService.addFavorite(this.book.id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: err => console.error(err)
      });
    }
  }
}
