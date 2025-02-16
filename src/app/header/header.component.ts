// header.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  username: string | null = null;
  isLoggedIn = false;

  constructor(private router: Router, private authService: AuthService) {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.username = localStorage.getItem('username');
    }

    this.authService.authStatus$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.username = localStorage.getItem('username');
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.clear();
    this.username = null;
    this.router.navigate(['/login']);
  }

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }

  showNavigation(): boolean {
    return !this.isAuthPage() && this.isLoggedIn;
  }
}
