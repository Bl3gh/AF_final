// src/app/modules/books/books-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { BooksListComponent } from './books-list/books-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookUploadComponent } from './book-upload/book-upload.component';
import { CombinedBooksComponent } from './combine-books-component/combine-books-component.component';

const routes: Routes = [
  { path: '', component: CombinedBooksComponent },
  { path: 'upload', component: BookUploadComponent },
  { path: ':id', component: BookDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BooksRoutingModule { }
