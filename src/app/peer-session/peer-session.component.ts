import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

interface AudioRecord {
  id: number;
  file_path: string;
  transcription: string;
  keywords_detected: string;
  status: string;
  duration: number;
  showFull?: boolean;
  newKeywords?: string;
}

@Component({
  selector: 'app-peer-session',
  templateUrl: './peer-session.component.html',
  styleUrls: ['./peer-session.component.css'],
})
export class PeerSessionComponent implements OnInit {
  isRecording = false;
  isProcessing = false;
  keywords = '';
  recordedAudioURL: string | null = null;
  detectedPrompts: any[] = [];
  audioFileData: any = null;
  segments: string[] = [];
  errorMessage: string = '';
  searchTerm: string = '';
  fetchErrorMessage: string = '';
  filteredAudioRecords: AudioRecord[] = [];
  showAudioProcess: boolean = false;
  sessionId: string = 'PS-' + Math.random().toString(36).substr(2, 9);

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.showAudioProcess = data['autoStart'] || false;
    });
  }

  startPeerSession() {
    this.showAudioProcess = true;
  }

  startRecording() {
    this.isRecording = true;
    // Implement recording logic
  }

  stopRecording() {
    this.isRecording = false;
    this.isProcessing = true;
    // Implement stop recording and processing logic
  }

  toggleViewMore(index: number, show: boolean) {
    this.filteredAudioRecords[index].showFull = show;
  }

  reanalyzeAudio(record: AudioRecord) {
    if (record.newKeywords) {
      // Implement reanalysis logic
    }
  }
}
