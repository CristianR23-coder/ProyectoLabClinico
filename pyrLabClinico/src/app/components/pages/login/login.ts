import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { UsersService } from '../../../services/user-service'; // ajusta la ruta si difiere
import { SessionService } from '../../../auth/session-service';  // nuevo import
import { firstValueFrom } from 'rxjs';

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
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private users: UsersService,
    private session: SessionService   // inyectamos SessionService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const { username, password } = this.form.value as {
      username: string;
      password: string;
    };

    try {
      const user = await firstValueFrom(this.users.findByUsername(username));

      if (!user || user.status !== 'ACTIVE' || (user.password && user.password !== password)) {
        this.errorMsg = 'Usuario o contraseña inválidos.';
        this.loading = false;
        return;
      }

      // Guardamos la sesión usando SessionService
      this.session.setSession(null, {
        id: user.id!,
        role: user.role,
        username: user.username
      });

      this.router.navigate(['/home']);
    } catch {
      this.errorMsg = 'Error de autenticación.';
    } finally {
      this.loading = false;
    }
  }

  error() {
    return this.errorMsg;
  }
}
