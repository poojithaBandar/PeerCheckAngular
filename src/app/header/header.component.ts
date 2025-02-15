import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  username: string | null = null;
  constructor(private router: Router) {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.username = localStorage.getItem('username');
    }
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.clear();
    
    this.router.navigate(['/login']);
  }

  isAuthPage(): boolean {

    return this.router.url === '/login' || this.router.url === '/register';
  }
}
