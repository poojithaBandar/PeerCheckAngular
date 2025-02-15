import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.mustMatch('password', 'confirmPassword'),
      }
    );
  }

  ngOnInit() {
    // Check if token exists and redirect
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Custom validator to check if password and confirm password match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      // if (matchingControl.errors && !matchingControl.errors[if (matchingControl.errors && !matchingControl.errors['mustMatch']) {]) {
      //   return;
      // }
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.apiService.register(this.registerForm.value).subscribe(
      (data) => {
        console.log('Registration successful', data);
        Swal.fire({
          title: 'Registration Successful!',
          text: 'You have successfully registered. Please log in.',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
          },
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      (error) => {
        console.error('Registration error', error);
        Swal.fire({
          title: 'Registration Failed!',
          text: error.error.error || 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'custom-swal-popup',
          },
        });
      }
    );
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
