import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Local
  private backendUrl = 'http://127.0.0.1:8000';
  // Server
  // private backendUrl = 'https://api.hask.app';

  // Local
  private baseUrl = this.backendUrl + '/api/'; // Replace with your backend UR
  public mediaURL = this.backendUrl + '/media/'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  // Process Audio API
  processAudio(formData: FormData): Observable<any> {
    // const formData = new FormData();
    // formData.append('file', file);

    return this.http.post(`${this.baseUrl}process-audio/`, formData);
  }

  // Submit Feedback API
  submitFeedback(feedback: string): Observable<any> {
    return this.http.post(`${this.baseUrl}submit-feedback/`, { feedback });
  }

  fetchAudioRecords(): Observable<any> {
    return this.http.get(`${this.baseUrl}audio-records/`);
  }

  // Method to save prompts
  savePrompts(prompts: {
    startPrompt: string;
    endPrompt: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}save-prompts`, prompts);
  }

  addAudioRecord(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}add-audio-record/`, formData);
  }

  reanalyzeAudio(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}reanalyze-audio/`, formData);
  }
}
