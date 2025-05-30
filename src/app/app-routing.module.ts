import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioProcessComponent } from './audio-process/audio-process.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AddRecordComponent } from './add-record/add-record.component'; // Import your component
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { MenubarComponent } from './menubar/menubar.component'; // Add this import
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { SettingsComponent } from './settings/settings.component';
import { PeerSessionComponent } from './peer-session/peer-session.component';
import { MonitorComponent } from './monitor/monitor.component';
// import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '*', component: AudioProcessComponent },
  { path: 'process-audio', component: AudioProcessComponent },
  { path: 'submit-feedback', component: FeedbackComponent },
  { path: 'add-record', component: AddRecordComponent }, // Add this route
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'menu', component: MenubarComponent }, // Add menubar route
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'monitor', component: MonitorComponent },
  {
    path: 'peer-session',
    component: PeerSessionComponent,
    data: { autoStart: false },
  },
  {
    path: 'peer-session/start',
    component: PeerSessionComponent,
    data: { autoStart: true },
  },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  // { path: '/login', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
