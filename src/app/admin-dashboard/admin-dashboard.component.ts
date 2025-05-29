import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ThemeService } from '../services/theme.service';

interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isDarkTheme = false;
  kpis = [
    { label: 'Total Users', count: 120, bg: 'bg-primary' },
    { label: 'Total SOPs', count: 45, bg: 'bg-success' },
    { label: 'Active Sessions', count: 8, bg: 'bg-info' },
    { label: 'Pending Reviews', count: 3, bg: 'bg-warning' }
  ];

  users: User[] = [
    { username: 'admin', email: 'admin@example.com', name: 'Admin', role: 'Admin', status: 'Active' },
    { username: 'operator', email: 'op@example.com', name: 'Operator', role: 'Operator', status: 'Active' }
  ];
  showUserTable = false;

  constructor(private modalService: NgbModal, private themeService: ThemeService) {
    this.themeService.currentTheme$.subscribe(t => {
      this.isDarkTheme = t === 'dark';
    });
  }

  openCreateUser(content: any) {
    this.modalService.open(content, { centered: true });
  }

  toggleUserTable() {
    this.showUserTable = !this.showUserTable;
  }
}
