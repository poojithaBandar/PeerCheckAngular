import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { DatePipe } from '@angular/common'; // Add this import
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AudioProcessComponent } from './audio-process/audio-process.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AddRecordComponent } from './add-record/add-record.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { MenubarComponent } from './menubar/menubar.component';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { PeerSessionComponent } from './peer-session/peer-session.component'; // Add this import
import { HeaderComponent } from './header/header.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// theme-toggle\theme-toggle.component

@NgModule({
  declarations: [
    AppComponent,
    AudioProcessComponent,
    FeedbackComponent,
    AddRecordComponent,
    RegisterComponent,
    LoginComponent,
    MenubarComponent,
    PeerSessionComponent, // Add PeerSessionComponent
    HeaderComponent,
    ThemeToggleComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    CommonModule, // Add CommonModule
  ],
  providers: [
    provideClientHydration(),
    DatePipe, // Add DatePipe to providers
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
