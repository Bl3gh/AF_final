import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { FavoriteService } from '../../../services/favorite.service';
import { Router } from '@angular/router';

export function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const newPassword = control.get('new_password');
  const confirmPassword = control.get('confirm_password');
  if (!newPassword || !confirmPassword) return null;
  return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
}

export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password: string = control.value;
    if (!password) return null;
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[\W_]/.test(password);
    const valid = hasMinLength && hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    return !valid ? { passwordComplexity: true } : null;
  };
}

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
    this.loadProfile();
    this.loadFavorites();

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      new_password: ['']
    });

    this.profileForm.get('new_password')?.valueChanges.subscribe(value => {
      if (value && value.trim().length > 0) {
        if (!this.profileForm.contains('confirm_password')) {
          this.profileForm.addControl('confirm_password', this.fb.control('', Validators.required));
          this.profileForm.setValidators(passwordMatchValidator);
          this.profileForm.get('new_password')?.setValidators([Validators.required, passwordComplexityValidator()]);
          this.profileForm.updateValueAndValidity();
        }
      } else {
        if (this.profileForm.contains('confirm_password')) {
          this.profileForm.removeControl('confirm_password');
          this.profileForm.clearValidators();
          this.profileForm.get('new_password')?.clearValidators();
          this.profileForm.updateValueAndValidity();
        }
      }
    });
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          new_password: ''
        });
      },
      error: () => {
        this.errorMessage = 'Ошибка получения данных пользователя';
      }
    });
  }

  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (data: any[]) => {
        this.favorites = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    const payload = {
      name: this.profileForm.get('name')?.value,
      new_password: this.profileForm.get('new_password')?.value || null
    };
    this.authService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.successMessage = 'Профиль успешно обновлен';
        this.user = res;
        this.loadFavorites();
      },
      error: (err: any) => {
        this.errorMessage = err.error.detail || 'Ошибка обновления профиля';
      }
    });
  }

  onResetPassword(): void {
    alert('Запрос на смену пароля отправлен на вашу почту');
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }
}
