// src/app/modules/statistics/statistics-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';

const routes: Routes = [
  { path: '', component: StatisticsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticsRoutingModule { }
