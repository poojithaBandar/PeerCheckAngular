import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ApiService } from '../api.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string | null = null;
  isLoggedIn = false;
  isMobileMenuOpen = false;
  isDarkTheme = false;
  userRole: string | null = null;
  private authSubscription?: Subscription;
  private themeSub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiservice: ApiService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.initializeUser();
    this.setupAuthSubscription();
    this.themeSub = this.themeService.currentTheme$.subscribe(t => {
      this.isDarkTheme = t === 'dark';
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }

  private initializeUser(): void {
    if (typeof window !== 'undefined' && localStorage) {
      this.username = localStorage.getItem('username');
      this.userRole = localStorage.getItem('userRole');
      this.isLoggedIn = !!this.username;
    }
  }

  private setupAuthSubscription(): void {
    this.authSubscription = this.authService.authStatus$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.username = localStorage.getItem('username');
        this.userRole = localStorage.getItem('userRole');
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
    this.router.navigate(['/login']);
  }
}
