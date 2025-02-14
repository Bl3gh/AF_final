// src/app/modules/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminBooksComponent } from './admin-books/admin-books.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

// Импорт Angular Material модулей для красивого UI
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';



@NgModule({
  declarations: [
    AdminBooksComponent,
    AdminUsersComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatCardModule,
    MatTableModule,
    MatListModule,
    MatButtonModule,
  ]
})
export class AdminModule { }
