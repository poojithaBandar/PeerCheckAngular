import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.css'],
})
export class AddRecordComponent {
  selectedFile: File | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private apiService: ApiService, private router: Router, private toastr: ToastrService) {}

  // File selection logic
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.successMessage = null; // Clear previous messages
    this.errorMessage = null;
  }

  // Form submission logic
  submitRecord(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file before submitting.';
      this.toastr.error('Failed to create item.', 'Error');
      return;
    }

    const formData = new FormData();
    formData.append('audio', this.selectedFile);

    this.apiService.addAudioRecord(formData).subscribe({
      next: () => {
        this.successMessage = 'File uploaded successfully!';
        this.errorMessage = null;
        this.toastr.success('File created successfully!', 'Success');
        setTimeout(() => this.router.navigate(['/process-audio']), 2000); // Redirect after 2 seconds
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        this.errorMessage = 'Failed to upload the file. Please try again.';
        this.successMessage = null;
        this.toastr.error('Failed to create item.', 'Error');
      },
    });
  }
}
