import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string | null = null;
  isLoggedIn = false;
  isMobileMenuOpen = false;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService,
    private apiservice: ApiService
  ) {}

  ngOnInit(): void {
    this.initializeUser();
    this.setupAuthSubscription();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private initializeUser(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.username = localStorage.getItem('username');
      this.isLoggedIn = !!this.username;
    }
  }

  private setupAuthSubscription(): void {
    this.authSubscription = this.authService.authStatus$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.username = localStorage.getItem('username');
      }
    });
  }

  get showNavigation(): boolean {
    return !this.isAuthPage && this.isLoggedIn;
  }

  get isAuthPage(): boolean {
    return ['/login', '/register'].includes(this.router.url);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.apiservice.logout().subscribe({
      next: () => {
        this.handleLogoutSuccess();
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.handleLogoutSuccess(); // Fallback to local logout
      },
    });
  }

  private handleLogoutSuccess(): void {
    localStorage.clear();
    this.username = null;
    this.isLoggedIn = false;
    this.isMobileMenuOpen = false;
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
