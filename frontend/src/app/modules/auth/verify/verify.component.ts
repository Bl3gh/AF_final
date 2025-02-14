import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify',
  standalone: false,
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  verifyForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Предзаполняем email, если он передан в query-параметрах
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    this.verifyForm = this.fb.group({
      email: [emailFromQuery || '', [Validators.required, Validators.email]],
      code: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) return;

    const formData = new FormData();
    formData.append('email', this.verifyForm.get('email')?.value);
    formData.append('code', this.verifyForm.get('code')?.value);

    this.authService.verify(this.verifyForm.get('email')?.value, this.verifyForm.get('code')?.value).subscribe({
      next: (res: any) => {
        this.successMessage = 'Верификация успешна! Теперь вы можете войти в систему.';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err: { error: { detail: string; }; }) => {
        this.errorMessage = err.error.detail || 'Ошибка верификации';
      }
    });
  }
}
