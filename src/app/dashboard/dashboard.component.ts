import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface AudioRecord {
  id: number;
  file_path: string;
  transcription: string;
  keywords_detected: string;
  status: string;
  duration: number;
  created_at: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  audioRecords: AudioRecord[] = [];
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.fetchAudioRecords();
  }

  fetchAudioRecords() {
    this.loading = true;
    this.apiService.fetchAudioRecords().subscribe(
      (data: any) => {
        this.audioRecords = data.audio_records;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error fetching records:', error);

        if (error.error?.message === 'Invalid Token') {
          Swal.fire({
            title: 'Session Expired!',
            text: 'Your session has expired. Please log in again.',
            icon: 'warning',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'custom-swal-popup',
            },
          }).then(() => {
            localStorage.clear(); // Clear stored token
            this.router.navigate(['/login']); // Redirect to login page
          });
        } else {
          this.error = 'Failed to load audio records. Please try again later.';
        }
      }
    );
  }

  get filteredRecords() {
    return this.audioRecords.filter(
      (record) =>
        record.transcription
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        record.keywords_detected
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
    );
  }
}
