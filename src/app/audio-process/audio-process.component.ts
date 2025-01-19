import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-audio-process',
  templateUrl: './audio-process.component.html',
  styleUrls: ['./audio-process.component.css'],
})
export class AudioProcessComponent implements OnInit {
  selectedFile: File | null = null;
  audioFileData: any = null;
  segments: any[] = [];
  isProcessing: boolean = false;
  errorMessage: string | null = null;

  audioRecords: any[] = [];
  fetchErrorMessage: string | null = null;
  searchTerm: string = '';

  startPrompt: string = '';
  endPrompt: string = '';
  promptsMessage: string | null = null;
  isRecording: boolean = false;

  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.fetchAudioRecords();
  }

  // Fetch audio records
  fetchAudioRecords(): void {
    this.apiService.fetchAudioRecords().subscribe({
      next: (response) => {
        this.audioRecords = response.audio_records;
      },
      error: (err) => {
        this.fetchErrorMessage = 'Failed to fetch audio records.';
        console.error(err);
      },
    });
  }

  // Filter audio records
  get filteredAudioRecords(): any[] {
    if (!this.searchTerm.trim()) return this.audioRecords;
    return this.audioRecords.filter(
      (record) =>
        record.file_path
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        record.transcription
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
    );
  }

  // File selection logic
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (!this.selectedFile || !this.selectedFile.type.startsWith('audio/')) {
      this.errorMessage = 'Please upload a valid audio file.';
      return;
    }
    this.audioFileData = null;
    this.segments = [];
    this.errorMessage = null;
  }

  // Process audio
  processAudio(): void {
    if (this.selectedFile) {
      this.isProcessing = true;
      this.apiService.processAudio(this.selectedFile).subscribe({
        next: (response) => {
          this.audioFileData = response.audio_file;
          this.segments = response.segments;
          this.isProcessing = false;
        },
        error: (err) => {
          this.errorMessage = 'Error processing audio. Please try again.';
          this.isProcessing = false;
          console.error(err);
        },
      });
    }
  }

  // Start recording logic
  startRecording(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=pcm',
            audioBitsPerSecond: 128000,
          });
          this.recordedChunks = [];

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.recordedChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            this.convertToWav(blob);
          };

          this.mediaRecorder.start();
          this.isRecording = true;
          console.log('Recording started...');
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
          alert(
            'Could not access your microphone. Please ensure microphone access is allowed.'
          );
        });
    }
  }

  // Stop recording logic
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Recording stopped.');
    }
  }

  // Convert recorded audio to WAV format
  convertToWav(blob: Blob): void {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
        const wavBuffer = this.encodeWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const file = new File([wavBlob], 'recorded-audio.wav', { type: 'audio/wav' });
        this.uploadRecordedFile(file);
      });
    };
    reader.readAsArrayBuffer(blob);
  }

  // Encode audio buffer to WAV format
  encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const blockAlign = (bitDepth / 8) * numChannels;
    const byteRate = sampleRate * blockAlign;

    const wavBuffer = new ArrayBuffer(44 + audioBuffer.length * numChannels * (bitDepth / 8));
    const view = new DataView(wavBuffer);

    let offset = 0;

    // Write WAV header
    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset + i, s.charCodeAt(i));
      }
    };

    writeString('RIFF');
    offset += 4;
    view.setUint32(offset, 36 + audioBuffer.length * blockAlign, true); // File size
    offset += 4;
    writeString('WAVE');
    offset += 4;
    writeString('fmt ');
    offset += 4;
    view.setUint32(offset, 16, true); // Subchunk1 size
    offset += 4;
    view.setUint16(offset, format, true); // Audio format
    offset += 2;
    view.setUint16(offset, numChannels, true); // Num channels
    offset += 2;
    view.setUint32(offset, sampleRate, true); // Sample rate
    offset += 4;
    view.setUint32(offset, byteRate, true); // Byte rate
    offset += 4;
    view.setUint16(offset, blockAlign, true); // Block align
    offset += 2;
    view.setUint16(offset, bitDepth, true); // Bits per sample
    offset += 2;
    writeString('data');
    offset += 4;
    view.setUint32(offset, audioBuffer.length * blockAlign, true); // Data size
    offset += 4;

    // Write audio samples
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample)) * 32767; // Convert to 16-bit PCM
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return wavBuffer;
  }

  // Upload the recorded file with prompts
  uploadRecordedFile(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_prompt', this.startPrompt);
    formData.append('end_prompt', this.endPrompt);

    this.apiService.processAudio(file).subscribe(
      (response) => {
        this.audioFileData = response;
        alert('Audio file processed successfully!');
      },
      (error) => {
        console.error('Error processing audio:', error);
        alert('Failed to process audio. Please try again.');
      }
    );
  }

  // Toggle View More/View Less
  toggleViewMore(index: number, showFull: boolean): void {
    this.audioRecords[index].showFull = showFull;
  }

  // Navigate to Add Record Page
  openAddRecord(): void {
    this.router.navigate(['/add-record']);
  }

  // Save prompts
  savePrompts(): void {
    const prompts = {
      startPrompt: this.startPrompt,
      endPrompt: this.endPrompt,
    };
    this.apiService.savePrompts(prompts).subscribe({
      next: () => {
        this.promptsMessage = 'Prompts saved successfully!';
      },
      error: (err) => {
        this.promptsMessage = 'Failed to save prompts.';
        console.error(err);
      },
    });
  }
}
