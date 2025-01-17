import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent {
  feedback: string = '';
  submissionResult: string | null = null;

  constructor(private apiService: ApiService) {}

  submitFeedback(): void {
    this.apiService.submitFeedback(this.feedback).subscribe({
      next: (response) => {
        this.submissionResult = 'Feedback submitted successfully!';
        this.feedback = '';
      },
      error: (err) => {
        console.error('Error submitting feedback:', err);
      },
    });
  }
}
