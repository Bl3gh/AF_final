import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password: string = control.value;
    if (!password) {
      return null;
    }
    // Определяем требования: минимум 8 символов, хотя бы одна заглавная, одна строчная, одна цифра и один спецсимвол
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[\W_]/.test(password);
    
    const valid = hasMinLength && hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    
    return !valid ? { passwordComplexity: { value: control.value } } : null;
  };
}
