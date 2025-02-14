import { Component } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // Здесь можно добавить дополнительную логику для отображения/скрытия меню
    console.log('Меню переключено:', this.isMenuOpen);
  }
}