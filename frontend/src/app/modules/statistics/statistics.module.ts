// src/app/modules/statistics/statistics.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { StatisticsComponent } from './statistics/statistics.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    StatisticsComponent
  ],
  imports: [
    CommonModule,
    StatisticsRoutingModule,
    MatCardModule,
    MatButtonModule
  ]
})
export class StatisticsModule { }
