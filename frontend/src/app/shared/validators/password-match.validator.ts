import { AbstractControl } from '@angular/forms';

export function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword) {
    return null;
  }
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}
