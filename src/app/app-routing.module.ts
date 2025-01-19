import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioProcessComponent } from './audio-process/audio-process.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AddRecordComponent } from './add-record/add-record.component'; // Import your component

const routes: Routes = [
  { path: 'process-audio', component: AudioProcessComponent },
  { path: 'submit-feedback', component: FeedbackComponent },
  { path: 'add-record', component: AddRecordComponent }, // Add this route
  { path: '', redirectTo: '/process-audio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
