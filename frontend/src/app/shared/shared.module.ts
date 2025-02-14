import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { MatIconModule } from '@angular/material/icon';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { CustomHighlightDirective } from './custom-highlight.directive';



@NgModule({
  declarations: [MainLayoutComponent,  CustomHighlightDirective],
  imports: [
    CommonModule,
    RouterModule,       
    MatToolbarModule,
    MatIconModule
  ],
  exports: [MainLayoutComponent,  CustomHighlightDirective] 
})
export class SharedModule { }
