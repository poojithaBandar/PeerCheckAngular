import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ThemeService } from '../services/theme.service';

interface UserDetails {
  username: string;
  email: string;
  lastLogin: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  userDetails: UserDetails = {
    username: '',
    email: '',
    lastLogin: '',
  };

  isSaving: boolean = false;
  saveMessage: string = '';

  constructor(
    private apiService: ApiService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Get user details from localStorage
    this.userDetails.username = localStorage.getItem('username') || '';
    this.userDetails.email = localStorage.getItem('email') || '';
    this.userDetails.lastLogin =
      localStorage.getItem('lastLogin') || new Date().toISOString();
  }
}
