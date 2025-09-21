import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  form: FormGroup;
  loading = false;          // ← boolean, no es función
  errorMsg = '';

  // Credenciales fijas (demo)
  private readonly FIXED_USER = 'admin';
  private readonly FIXED_PASS = '1234';

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const { username, password } = this.form.value;

    if (username === this.FIXED_USER && password === this.FIXED_PASS) {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/home']);   // cambia la ruta si necesitas
    } else {
      this.errorMsg = 'Usuario o contraseña inválidos.';
    }

    this.loading = false;
  }

  error() {
    return this.errorMsg;
  }
}
