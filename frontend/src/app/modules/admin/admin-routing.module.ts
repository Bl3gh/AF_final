// src/app/modules/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AdminBooksComponent } from './admin-books/admin-books.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

const routes: Routes = [
  // Основной маршрут – по умолчанию перенаправляем на страницу управления книгами
  { path: '', component: AdminPanelComponent },
  // Маршрут для управления книгами
  { path: 'books', component: AdminBooksComponent },
  // Маршрут для управления пользователями
  { path: 'users', component: AdminUsersComponent },
  // Если введён несуществующий маршрут – перенаправляем на страницу управления книгами
  { path: '**', redirectTo: 'books' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
