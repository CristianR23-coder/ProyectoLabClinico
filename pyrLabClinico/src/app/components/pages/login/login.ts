import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../auth/authservice';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    CardModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  providers: [MessageService]
})
export class Login {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(0)]]
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.loading = true;
    const { username, password } = this.form.value;

    try {
      await firstValueFrom(this.auth.login({ username, password }));
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Sesión iniciada correctamente'
      });
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);
    } catch (error: any) {
      console.error('Error en autenticación:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error?.error?.error ?? 'Usuario o contraseña incorrectos'
      });
    } finally {
      this.loading = false;
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength'])
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
