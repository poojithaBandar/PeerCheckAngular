import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
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
          localStorage.setItem('username', response.data[0].username);
          localStorage.setItem('email', response.data[0].email);
          localStorage.setItem('lastLogin', response.data[0].last_login);

          this.router.navigate(['/dashboard']);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
