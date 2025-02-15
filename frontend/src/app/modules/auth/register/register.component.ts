import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        this.successMessage = 'Регистрация успешна! Проверьте почту для получения кода верификации.';
        setTimeout(() => {
          // Переход на страницу верификации с передачей email через query-параметр
          this.router.navigate(['/auth/verify'], { queryParams: { email: this.registerForm.get('email')?.value } });
        }, 2000);
      },
      error: (err: { error: { detail: string; }; }) => {
        this.errorMessage = err.error.detail || 'Ошибка регистрации';
      }
    });
  }
}
