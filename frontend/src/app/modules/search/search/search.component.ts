import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BookService } from '../../../services/book.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  searchResults: any[] = [];
  
  // Список категорий для выбора
  categories: string[] = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Horror', 'Biography', 'History', 'Poetry', 'Adventure', 'Thriller', 'Self-Help'];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      category: [''], // значение для выпадающего списка будет использоваться как выбранный жанр
      author: ['']
    });
  
    this.searchForm.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    switchMap(formValue => {
      const { keyword, category, author } = formValue;
      
      // Проверяем, что хотя бы одно поле заполнено
      if (!keyword.trim() && !category.trim() && !author.trim()) {
        return of([]);
      }

      // Также добавляем проверку для поля keyword
      if (keyword && keyword.trim() === '') {
        return of([]);
      }

      return this.bookService.searchBooks(keyword, category, author);
    })
  )
  .subscribe(results => {
    const formValue = this.searchForm.value;
    const selectedGenre = formValue.category ? formValue.category.trim().toLowerCase() : '';
    const authorFilter = formValue.author ? formValue.author.trim().toLowerCase() : '';
    const keywordFilter = formValue.keyword ? formValue.keyword.trim().toLowerCase() : '';

    this.searchResults = results.filter(book => {
      let matchesGenre = true;
      let matchesAuthor = true;
      let matchesKeyword = true;

      if (selectedGenre) {
        matchesGenre = book.genres && book.genres.some((g: string) => g.toLowerCase() === selectedGenre);
      }

      if (authorFilter) {
        matchesAuthor = book.authors && book.authors.toLowerCase().includes(authorFilter);
      }

      if (keywordFilter) {
        matchesKeyword = book.title.toLowerCase().includes(keywordFilter) || 
                         book.description.toLowerCase().includes(keywordFilter);
      }

      return matchesGenre && matchesAuthor && matchesKeyword;
    });

    console.log('Результаты поиска после фильтрации:', this.searchResults);
  });

  }
  

  goToDetail(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }
}