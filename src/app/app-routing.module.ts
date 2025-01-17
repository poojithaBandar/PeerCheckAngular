import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioProcessComponent } from './audio-process/audio-process.component';
import { FeedbackComponent } from './feedback/feedback.component';

const routes: Routes = [
  { path: 'process-audio', component: AudioProcessComponent },
  { path: 'submit-feedback', component: FeedbackComponent },
  { path: '', redirectTo: '/process-audio', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
