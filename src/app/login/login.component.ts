import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
    if (this.loginForm.invalid) {
      return;
    }

    this.apiService.login(this.loginForm.value).subscribe(
      (response) => {
        if (response.message === 'Login Successful' && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('email', response.data.email);
          localStorage.setItem('lastLogin', response.data.last_login);
          if (response.data.role) {
            localStorage.setItem('userRole', response.data.role);
            this.authService.setUserRole(response.data.role);
          }
          // Update auth status
          this.authService.updateAuthStatus(true);
          const role = localStorage.getItem('userRole') || 'operator';
          this.router.navigate([role === 'admin' ? '/dashboard' : '/peer-session']);
        }
      },
      (error) => {
        console.log(error);
        Swal.fire({
          title: 'Login Failed!',
          text:
            error.error?.message || 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
          },
        });
      }
    );
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
}
