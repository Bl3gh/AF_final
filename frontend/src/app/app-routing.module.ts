import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'books',
    loadChildren: () => import('./modules/books/books.module').then(m => m.BooksModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./modules/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'statistics',
    loadChildren: () => import('./modules/statistics/statistics.module').then(m => m.StatisticsModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  { path: '**', redirectTo: 'books' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
