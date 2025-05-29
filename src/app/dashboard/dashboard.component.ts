import { Component } from '@angular/core';

declare var bootstrap: any;

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

interface Sop {
  id: number;
  name: string;
  version: string;
  steps: {
    number: number;
    instruction: string;
    keywords: string;
  }[];
}

interface AudioFile {
  id: number;
  name: string;
  url: string;
  transcription: string;
  keywords: string[];
  showFull?: boolean;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  userRole: string = 'admin';
  users: User[] = [
    { id: 1, username: 'alice', email: 'alice@example.com', name: 'Alice', role: 'admin', isActive: true },
    { id: 2, username: 'bob', email: 'bob@example.com', name: 'Bob', role: 'operator', isActive: true },
    { id: 3, username: 'carol', email: 'carol@example.com', name: 'Carol', role: 'reviewer', isActive: false }
  ];
  sops: Sop[] = [
    {
      id: 1,
      name: 'Safety SOP',
      version: '1.0',
      steps: [
        { number: 1, instruction: 'Check environment', keywords: 'check,env' },
        { number: 2, instruction: 'Start machine', keywords: 'start' }
      ]
    }
  ];
  audioFiles: AudioFile[] = [
    {
      id: 1,
      name: 'meeting1.wav',
      url: '',
      transcription: 'Hello world. This is a sample transcript line one. More text here.',
      keywords: ['hello', 'world']
    },
    {
      id: 2,
      name: 'meeting2.wav',
      url: '',
      transcription: 'Another transcript example line one. Next line here. And more text.',
      keywords: ['example', 'transcript']
    }
  ];

  searchTerm = '';
  page = 1;
  pageSize = 5;

  showUserList = false;
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  selectedUser?: User;
  newUser: any = {};

  constructor() {}

  get pagedUsers(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  listUsers() {
    this.showUserList = true;
  }

  openCreateUser() {
    this.selectedUser = undefined;
    this.newUser = {};
    const modal: any = document.getElementById('userModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
    this.newUser = { ...user };
    const modal: any = document.getElementById('userModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  saveUser() {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.role || !this.newUser.name || (!this.selectedUser && !this.newUser.password)) {
      this.alertType = 'danger';
      this.alertMessage = 'Please fill out all fields.';
      return;
    }

    if (this.selectedUser) {
      Object.assign(this.selectedUser, this.newUser);
    } else {
      const nextId = Math.max(0, ...this.users.map(u => u.id)) + 1;
      this.users.push({ id: nextId, username: this.newUser.username, email: this.newUser.email, name: this.newUser.name, role: this.newUser.role, isActive: true });
    }

    this.alertType = 'success';
    this.alertMessage = 'User saved successfully.';

    const modalElement: any = document.getElementById('userModal');
    if (modalElement) bootstrap.Modal.getInstance(modalElement)?.hide();
  }

  confirmDelete(user: User) {
    if (confirm('Delete user ' + user.username + '?')) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.alertType = 'success';
      this.alertMessage = 'User deleted.';
    }
  }
}
