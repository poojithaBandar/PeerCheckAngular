import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  toggleTheme() {
      throw new Error('Method not implemented.');
  }
  private currentTheme = new BehaviorSubject<'light' | 'dark'>('light');
  currentTheme$ = this.currentTheme.asObservable();

  isDarkTheme = false;

  constructor() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
 
  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme.next(theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme.value;
  }
}
