import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search/search.component';
import { ReactiveFormsModule } from '@angular/forms';

// Импорт Angular Material модулей для красивого UI (по необходимости)
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';


@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule
  ]
})
export class SearchModule { }
