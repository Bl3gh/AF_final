import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BookService } from '../../../services/book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-upload',
  standalone: false,
  templateUrl: './book-upload.component.html',
  styleUrls: ['./book-upload.component.scss']
})
export class BookUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  // Список доступных жанров (массив)
  genres: string[] = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Horror', 'Biography'];
  // Отдельная переменная для хранения выбранного PDF-файла
  selectedPdf: File | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Инициализируем форму для метаданных книги
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      // Авторы как динамический список
      authors: this.fb.array([this.fb.control('', Validators.required)]),
      description: [''],
      // Жанры выбираются через мультиселект – ожидается массив
      genres: [[], Validators.required]
    });
  }

  // Геттер для динамического массива авторов
  get authors(): FormArray {
    return this.uploadForm.get('authors') as FormArray;
  }

  addAuthor(): void {
    this.authors.push(this.fb.control('', Validators.required));
  }

  removeAuthor(index: number): void {
    if (this.authors.length > 1) {
      this.authors.removeAt(index);
    }
  }

  // Обработка выбора PDF-файла
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedPdf = event.target.files[0];
    }
  }

  // Отправка формы
  onSubmit(): void {
    if (this.uploadForm.invalid) return;

    // Собираем метаданные книги
    const metadata = {
      title: this.uploadForm.get('title')?.value,
      // Объединяем имена авторов через запятую (в соответствии с бэкендом)
      authors: this.authors.value.join(', '),
      description: this.uploadForm.get('description')?.value,
      genres: this.uploadForm.get('genres')?.value  // ожидается массив жанров
    };

    // Сначала создаём книгу (метаданные отправляются как JSON)
    this.bookService.uploadBook(metadata).subscribe({
      next: (book: { id: any; }) => {
        console.log('Книга создана', book);
        const bookId = book.id;
        // Если выбран PDF-файл, загружаем его отдельно
        if (this.selectedPdf) {
          const formData = new FormData();
          // Обратите внимание: имя поля должно совпадать с тем, что ожидает бэкенд (например, pdf_file)
          formData.append('pdf_file', this.selectedPdf);
          this.bookService.uploadPdf(bookId, this.selectedPdf).subscribe({
            next: (res: any) => {
              console.log('PDF загружен', res);
              this.router.navigate(['/books']);
            },
            error: (err: any) => {
              console.error('Ошибка загрузки PDF', err);
            }
          });
        } else {
          this.router.navigate(['/books']);
        }
      },
      error: (err: any) => {
        console.error('Ошибка создания книги', err);
      }
    });
  }
}
