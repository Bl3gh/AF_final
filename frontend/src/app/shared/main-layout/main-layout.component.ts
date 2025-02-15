import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: false,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isMenuOpen = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkAdmin();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Меню переключено:', this.isMenuOpen);
  }

  checkAdmin(): void {
    // Вызов метода getAdminData() из AuthService,
    // который должен вернуть данные, если пользователь является администратором.
    this.authService.getAdminData().subscribe({
      next: (data: any) => {
        // Если запрос успешен, пользователь — админ.
        this.isAdmin = true;
      },
      error: () => {
        this.isAdmin = false;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }
}
