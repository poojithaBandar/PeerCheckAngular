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
export class DashboardComponent  {
  audioRecords: AudioRecord[] = [];
  loading: boolean = true;
  error: string = '';
  searchTerm: string = '';

  constructor(private apiService: ApiService, private router: Router) {}
}
