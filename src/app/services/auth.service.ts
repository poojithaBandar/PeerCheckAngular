import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();
  private userRole: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.authStatusSubject.next(!!token);
    }
  }   
  
  setUserRole(role: string): void {
    this.userRole = role;
    localStorage.setItem('userRole', role);
  }

  getUserRole(): string | null {
    return this.userRole ? this.userRole : localStorage.getItem('userRole');
  }
  
  updateAuthStatus(status: boolean) {
    this.authStatusSubject.next(status);
  }

  logOut(){
    localStorage.removeItem('userRole');
    this.userRole = null;
  }
}
