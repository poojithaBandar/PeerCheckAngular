import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  id: number;
  selected : boolean ;
}

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
  keywords: string = '';
  recordedAudioURL: string | null = null;
  detectedPrompts: any[] = [];
  mediaURL: string = '';

  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  transcription: any[] = [];
  newTag: string = '';
  tags: string[] = [];
  sops: any[] = [];
  selectedSOPID!: number;
  users: User[] = [];
  selectedUserIds:number[] = []
  constructor(private ngZone: NgZone,private apiService: ApiService, private router: Router, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchAudioRecords();
    this.fetchUsers();
    this.fetchSOP();    
  }

  updateSelectedUsers(): void {
    let selectedUsers = this.users.filter(user => user.selected);
    this.selectedUserIds = selectedUsers.map(user => user.id);
  }

  fetchUsers(){
    this.apiService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data.results;
      },
      error: (err) => {
        console.error(err);
      },
    })
  }

  fetchSOP(){
    this.apiService.getSOPs().subscribe({
      next: (data: any) => {
        this.sops = data.results;
      },
      error: (err) => {
        console.error(err);
      },
    })
  }

  addTag(): void {
    if (this.newTag.trim()) {
      this.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  // Fetch audio records
  fetchAudioRecords(): void {
    this.apiService.fetchAudioRecords().subscribe({
      next: (response) => {
        this.audioRecords = response.results.map((record: any) => {
          const parsed = Array.isArray(record.transcription)
            ? record.transcription
            : [];
          const text = parsed.map((p:any) => p.text).join(' ');
          return {
            ...record,
            parsedTranscription: parsed,
            transcriptionText: text,
            showFull: false,
          };
        });
        this.changeDetector.detectChanges();
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
    const lower = this.searchTerm.toLowerCase();
    return this.audioRecords.filter(
      (record) =>
        record.file_path.toLowerCase().includes(lower) ||
        record.transcriptionText.toLowerCase().includes(lower)
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

  private resetStateAfterProcessing(): void {
    this.startPrompt = '';
    this.endPrompt = '';
    this.isRecording = false;
    this.isProcessing = false;
     this.changeDetector.detectChanges();  // Ensures buttons are reset correctly
  }

  // Process audio
  processAudio(isFileUpload ? :boolean): void {
    if (this.selectedFile) {
      if(!isFileUpload){
        this.isProcessing = true;
      }
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('start_prompt', this.startPrompt);
      formData.append('end_prompt', this.endPrompt);
      formData.append('keywords', this.keywords);
      formData.append('session_user_ids',JSON.stringify({'userIds':this.selectedUserIds}) );
      formData.append('sop_id', this.selectedSOPID.toString());

      this.apiService.processAudio(formData).subscribe({
        next: (response) => {
          this.audioFileData = response.audio_file;
          this.transcription = response.transcription;
          this.detectedPrompts = response.detected_prompts;
          this.keywords = response.keywords;
          this.segments = response.extracted_text;
          this.fetchAudioRecords();
          Swal.fire(
            'Success!',
            'Audio file processed successfully!',
            'success'
          ).then(() => {
            this.resetStateAfterProcessing();
          });
        },
        error: (error) => {
          // this.errorMessage = 'Error processing audio. Please try again.';
          // this.isProcessing = false;
          // console.error(err);
          // Swal.fire('Error!', this.errorMessage, 'error');
          this.resetStateAfterProcessing();
          if (
            error.error.error === 'Start or End Prompt not found in the audio.'
          ) {
            console.log(
              'Could not find the specified prompts in the audio. Please verify your prompts and try again.'
            );
            this.errorMessage =
              'Could not find the specified prompts in the audio. Please verify your prompts and try again.';
            Swal.fire('Error!', this.errorMessage, 'error').then(() => {
              // Clear the prompts after processing
              this.startPrompt = '';
              this.endPrompt = '';
              window.location.reload(); // Reload the page after success
            });
          } else {
            console.log('Failed to process audio. Please try again.');
            this.errorMessage = 'Failed to process audio. Please try again.';
            Swal.fire('Error!', this.errorMessage, 'error').then(() => {
              // Clear the prompts after processing
              this.resetStateAfterProcessing();// Reload the page after success
            });
          }
        },
      });
    }
  }

  // Start recording logic
  startRecording(): void {
    // if (!this.startPrompt || !this.endPrompt) {
    //   Swal.fire(
    //     'Warning!',
    //     'Please provide both Start Prompt and End Prompt.',
    //     'warning'
    //   );
    //   return;
    // }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=pcm',
            audioBitsPerSecond: 128000,
          });
          this.recordedChunks = [];

          console.log(this.mediaRecorder);
          console.log(this.mediaRecorder.state);
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.recordedChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            this.ngZone.run(() => { 
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            // const audioBlob = new Blob(this.recordedChunks, { type: 'audio/wav' });
            this.recordedAudioURL = URL.createObjectURL(blob);
            this.convertToWav(blob);
            this.isRecording = false;
            this.isProcessing = true;
            this.startPrompt = '';
            this.endPrompt = '';
            });
          };

          this.mediaRecorder.start();
          this.isRecording = true;
          this.isProcessing = false;
          console.log('Recording started...');
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
          Swal.fire(
            'Error!',
            'Could not access your microphone. Please ensure microphone access is allowed.',
            'error'
          );
        });
    }
  }

  // Stop recording logic
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isProcessing = true;
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
        const file = new File([wavBlob], 'recorded-audio.wav', {
          type: 'audio/wav',
        });
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

    const wavBuffer = new ArrayBuffer(
      44 + audioBuffer.length * numChannels * (bitDepth / 8)
    );
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
    this.selectedFile = file;
  }

  // Toggle View More/View Less
  toggleViewMore(index: number, showFull: boolean): void {
    this.audioRecords[index].showFull = showFull;
  }

  reanalyzeAudio(record: any): void {
    if (!record.newKeywords || record.newKeywords.trim() === '') {
      alert('Please enter keywords to analyze.');
      return;
    }

    const formData = new FormData();
    formData.append('file_path', record.file_path); // Sending existing file path
    formData.append('new_keywords', record.newKeywords);
    formData.append('id', record.id);

    this.apiService.reanalyzeAudio(formData).subscribe(
      (response) => {
        record.transcription = response.transcription;
        record.parsedTranscription = Array.isArray(response.transcription)
        ? response.transcription
        : [];
      record.transcriptionText = record.parsedTranscription
        .map((p: any) => p.text)
        .join(' ');
        record.detected_prompts = response.detected_prompts;
        record.keywords_detected = response.detected_keywords;
        Swal.fire(
          'Success!',
          'Audio reprocessed with new keywords!',
          'success'
        );
      },
      (error) => {
        console.error('Error analyzing audio:', error);
        Swal.fire('Error!', 'Error processing audio.', 'error');
      }
    );
  }

  // formatFilePath(filePath: string): string {
  //   this.mediaURL = this.apiService.mediaURL;

  //   if (!filePath) {
  //     return '';
  //   }

  //   // Normalize the file path by replacing both types of slashes with a consistent one (e.g., `/`)
  //   const normalizedPath = filePath.replace(/\\/g, '/');

  //   // Handle the case where the path starts with 'uploads/' or 'uploads\'
  //   if (normalizedPath.startsWith('uploads/')) {
  //     return `${this.mediaURL}/${normalizedPath.replace(/^uploads\//, '')}`;
  //   }

  //   return `${this.mediaURL}/${normalizedPath}`;
  // }

  // toggleViewKeywords(index: number, show: boolean): void {
  //   this.filteredAudioRecords[index].showKeywords = show;
  // }
}
