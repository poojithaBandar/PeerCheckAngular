import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-audio-process',
  templateUrl: './audio-process.component.html',
  styleUrls: ['./audio-process.component.css'],
})
export class AudioProcessComponent implements OnInit {
  selectedFile: File | null = null;
  audioFileData: any = null; // To store the audio_file key fetchAudioRecords
  segments: any[] = []; // To store segments from the API response
  isProcessing: boolean = false; // Flag to track processing state
  errorMessage: string | null = null; // For error messages

  // New properties for GetAudioRecords functionality
  audioRecords: any[] = []; // To store the list of audio records
  fetchErrorMessage: string | null = null; // Error message for fetching records

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchAudioRecords(); // Fetch audio records on initialization
  }

  // Method to fetch audio records
  fetchAudioRecords(): void {
    this.apiService.fetchAudioRecords().subscribe({
      next: (response) => {
        this.audioRecords = response.audio_records; // Store the fetched audio records
      },
      error: (err) => {
        console.error('Error fetching audio records:', err);
        this.fetchErrorMessage = 'Failed to load audio records.';
      },
    });
  }

  // File selection logic
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.audioFileData = null; // Clear previous result
    this.segments = [];
    this.errorMessage = null; // Clear error message
  }

  // Audio processing logic
  processAudio(): void {
    if (this.selectedFile) {
      this.isProcessing = true; // Set loading state
      this.apiService.processAudio(this.selectedFile).subscribe({
        next: (response) => {
          this.audioFileData = response.audio_file; // Set audio_file data
          this.segments = response.segments; // Set segments data
          this.isProcessing = false; // Reset loading state
        },
        error: (err) => {
          console.error('Error processing audio:', err);
          this.errorMessage =
            'An error occurred while processing the audio. Please try again.';
          this.isProcessing = false; // Reset loading state
        },
      });
    }
  }

  // Method to toggle View More/View Less
  toggleViewMore(index: number, showFull: boolean): void {
    this.audioRecords[index].showFull = showFull;
  }
}
