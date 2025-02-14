import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: { access_token: string; }) => {
        localStorage.setItem('access_token', res.access_token);
        this.router.navigate(['/books']);
      },
      error: (err: { error: { detail: string; }; }) => {
        this.errorMessage = err.error.detail || 'Ошибка входа';
      }
    });
  }
}
