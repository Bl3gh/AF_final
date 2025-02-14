// src/app/modules/books/books.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksRoutingModule } from './books-routing.module';
import { BooksListComponent } from './books-list/books-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookUploadComponent } from './book-upload/book-upload.component';
import { ReactiveFormsModule } from '@angular/forms';

// Импорт Angular Material модулей для красивого UI
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// Для адаптивного дизайна
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    BooksListComponent,
    BookDetailComponent,
    BookUploadComponent
  ],
  imports: [
    CommonModule,
    BooksRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FlexLayoutModule
  ]
})
export class BooksModule { }
