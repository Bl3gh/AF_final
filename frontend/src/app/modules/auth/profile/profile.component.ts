import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { FavoriteService } from '../../../services/favorite.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  favorites: any[] = [];
  user: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Получаем текущего пользователя (предполагается, что AuthService имеет метод getCurrentUser)
    this.authService.getCurrentUser().subscribe({
      next: (user: { name: any; }) => {
        this.user = user;
        this.profileForm = this.fb.group({
          name: [user.name, Validators.required],
          new_password: ['']
        });
      },
      error: () => {
        this.errorMessage = 'Ошибка получения данных пользователя';
      }
    });

    this.loadFavorites();
  }

  loadFavorites(): void {
    // Получаем список избранного (FavoriteService должен реализовывать данный метод)
    this.favoriteService.getFavorites(this.user.user_id).subscribe({
      next: (data: any[]) => {
        this.favorites = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    
    // Собираем данные в виде JSON-объекта
    const payload = {
      user_id: this.user.id, // Убедитесь, что user.id имеет тип string (или преобразуйте его в строку, если необходимо)
      name: this.profileForm.get('name')?.value,
      new_password: this.profileForm.get('new_password')?.value
    };
  
    this.authService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.successMessage = 'Профиль успешно обновлен';
        this.user = res; // Обновляем данные пользователя
      },
      error: (err: any) => {
        this.errorMessage = err.error.detail || 'Ошибка обновления профиля';
      }
    });
  }

  // Метод для запроса смены пароля 
  onResetPassword(): void {
    alert('Запрос на смену пароля отправлен на вашу почту');
  }
}
