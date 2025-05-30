import { animate, keyframes, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { timeStamp } from 'console';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  id: number;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  animations: [
    // KPI Cards Animation
    trigger('kpiAnimation', [
      transition(':enter', [
        query('.kpi-card', [
          style({ 
            opacity: 0, 
            transform: 'translateY(30px) scale(0.9)' 
          }),
          stagger(150, [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              })
            )
          ])
        ], { optional: true })
      ])
    ]),

    // Individual KPI Card Hover
   
  ],
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  isDarkTheme = false;
  createUserForm: FormGroup;
  sopForm: FormGroup;
  sessionForm: FormGroup;
  kpis = [
    { count: 0, label: 'Total Users', bg: 'bg-primary', hovered: true ,icon:"fas fa-users" },
    { count: 0, label: 'Active Sessions', bg: 'bg-success', hovered: true ,icon:"fas fa-bolt" },
    { count: 0, label: 'Total SOPs', bg: 'bg-info', hovered: true ,icon:"fas fa-file-alt" },
    { count: 0, label: 'Pending Reviews', bg: 'bg-warning', hovered: true ,icon:"fas fa-tasks" }
  ];
  sops: any[] = [];
  showDetails: { [key: number]: boolean } = {};

  users: User[] = [];
  showUserTable = false;
  showSOPTable: boolean = false;
  showSessionTable: boolean = false;
  submitted: boolean = false;
  sessionSubmitted: boolean = false;
  isEditing: boolean = false;
  editingUserId!: number | null ;
  editingSOPId!: number | null;
  isSOPEditing: boolean = false;
  isSessionEditing: boolean = false;
  editingSessionId!: number | null;

  sessions: any[] = [];
  audioFiles: any[] = [];

  constructor(private modalService: NgbModal, private themeService: ThemeService,private apiService: ApiService,private fb: FormBuilder,private toasterService:ToastrService,public authService : AuthService) {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]]
    });
    this.sopForm = this.fb.group({
      name: ['', Validators.required],
      version: ['', Validators.required],
      steps: this.fb.array([])
    });
    this.sessionForm = this.fb.group({
      name: ['', Validators.required],
      sop_id: [null, Validators.required],
      status: ['active', Validators.required],
      audio_file_ids: [[], Validators.required]
    });
    this.themeService.currentTheme$.subscribe(t => {
      this.isDarkTheme = t === 'dark';
    });
  }

  onKpiHover(kpi: any, isHovered: boolean) {
    kpi.hovered = isHovered;
  }

  openCreateUser(content: any) {
    this.modalService.open(content, { centered: true });
  }

  toggleUserTable() {
    this.showUserTable = !this.showUserTable;
  }

  toggleSOPTable() {
    this.showSOPTable = !this.showSOPTable;
  }

  trackByKpi(index: number, kpi: any): any {
    return kpi.label;
  }

  trackByUser(index: number, user: any): any {
    return user.username;
  }

  ngOnInit(){
    if(this.authService.getUserRole() == 'admin'){
      this.fetchDashboardSummary();
    }
  }

  fetchDashboardSummary(){
    this.apiService.getDashboardSummary().subscribe({
      next: (data: any) => {
        this.kpis[0].count = data.total_users;
        this.kpis[1].count = data.active_sessions;
        this.kpis[2].count = data.total_sops;
        this.kpis[3].count = data.pending_reviews;
        // this.toasterService.success('Data loaded successfully!', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toasterService.error('Failed to load data.', 'Error');
      },
    })
  }

  
  fetchUsers(){
    this.apiService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data.results;
        // this.toasterService.success('Data loaded successfully!', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toasterService.error('Failed to load data.', 'Error');
      },
    })
  }

  fetchSOP(){
    this.apiService.getSOPs().subscribe({
      next: (data: any) => {
        this.sops = data.results;
        // this.toasterService.success('Data loaded successfully!', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.toasterService.error('Failed to load data.', 'Error');
      },
    })
  }

  editUser(userId : number,createUserModal: any){
    this.apiService.getUserById(userId).subscribe(data => {
      this.createUserForm.patchValue(data);
      this.createUserForm.controls['password'].disable(); // Disable the password field
      this.modalService.open(createUserModal, { centered: true });
      this.isEditing = true;
      this.editingUserId = userId; 
    });
  }

  
  editSOP(sopId : number,createSOPModal: any){
    this.apiService.getSOPById(sopId).subscribe((data:any) => {
      this.sopForm.patchValue(data);
      this.steps.clear();
      data.steps.forEach((step: any) => this.addStep(step));
      this.isSOPEditing = true;
      this.editingSOPId = sopId; 
      this.modalService.open(createSOPModal, { centered: true });
    });
  }

  openDeleteModal(content: any, userId: number) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'Confirm') {
          this.apiService.deleteUser(userId).subscribe({
            next: (data: any) => {
              this.toasterService.success('User deleted successfully!', 'Success');
            },
            error: (err) => {
              console.error(err);
              this.toasterService.error('Failed to delete item.', 'Error');
            },
          })
        }
      },
      (reason) => {
        console.log('Deletion canceled');
      }
    );
  }

  openSOPDeleteModal(content: any, sopId: number) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'Confirm') {
          this.apiService.deleteSOP(sopId).subscribe({
            next: (data: any) => {
              this.toasterService.success('SOP deleted successfully!', 'Success');
            },
            error: (err) => {
              console.error(err);
              this.toasterService.error('Failed to delete item.', 'Error');
            },
          })
        }
      },
      (reason) => {
        console.log('Deletion canceled');
      }
    );
  }
  

  onSubmit(modal: any): void {
    if (this.createUserForm.valid) {
      const formValue = this.createUserForm.getRawValue(); // Get form values including disabled fields
      if(this.isEditing  && this.editingUserId !== null){
        this.apiService.updateUser(this.editingUserId,formValue).subscribe({
          next: (data: any) => {
            this.fetchUsers();
            this.isEditing = false;
            this.editingUserId = null;
            modal.dismiss();
            this.toasterService.success('User updated successfully!', 'Success');
            this.createUserForm.reset();
          },
          error: (err) => {
            console.error(err);
            this.toasterService.error('Failed to update item.', 'Error');
          },
        })
      } else {
      this.apiService.register(formValue).subscribe({
        next: (data: any) => {
          if(this.showUserTable){
            this.fetchUsers();
            this.fetchDashboardSummary();
          }
          modal.dismiss();
          this.toasterService.success('User created successfully!', 'Success');
          this.createUserForm.reset();
        },
        error: (err) => {
          console.error(err);
          this.toasterService.error('Failed to create item.', 'Error');
        },
      })
    }
      console.log(this.createUserForm.value);
      // Handle form submission
    }
  }

  get steps(): FormArray {
    return this.sopForm.get('steps') as FormArray;
  }

  addStep(stepData: any = null) {
    const step = this.fb.group({
      step_number: [stepData?.step_number || this.steps.length + 1, Validators.required],
      instruction_text: [stepData?.instruction_text || '', Validators.required],
      expected_keywords: [stepData?.expected_keywords || '', Validators.required]
    });
    this.steps.push(step);
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  resetSOPSteps(){
    while (this.steps.length !== 0) {
      this.steps.removeAt(0);
    }
  }

  onSOPSubmit(modal: any) {
    this.submitted = true;
    if (this.sopForm.valid) {
      if(this.isSOPEditing  && this.editingSOPId !== null){
        this.apiService.updateSOP(this.editingSOPId,this.sopForm.value).subscribe({
          next: (data: any) => {
            this.fetchSOP();
            this.isSOPEditing = false;
            this.editingSOPId = null;
            modal.dismiss();
            this.toasterService.success('SOP updated successfully!', 'Success');
            this.sopForm.reset();
            this.resetSOPSteps();
          },
          error: (err) => {
            console.error(err);
            this.toasterService.error('Failed to update.', 'Error');
          },
        })
      } else {
      this.apiService.saveSOP(this.sopForm.value).subscribe({
        next: (data: any) => {
          modal.dismiss();
          if(this.showSOPTable){
            this.fetchSOP();
            this.fetchDashboardSummary();
          }
          this.submitted = false;
          this.sopForm.reset();
          this.resetSOPSteps();
          this.toasterService.success('SOP created successfully!', 'Success');
        },
        error: (err) => {
          console.error(err);
          this.toasterService.error('Failed to create.', 'Error');
        },
      })
    }
    }
  }

  toggleDetails(sopId: number): void {
    this.showDetails[sopId] = !this.showDetails[sopId];
  }

  toggleSessionTable() {
    this.showSessionTable = !this.showSessionTable;
  }

  fetchSessions() {
    this.apiService.getSessions().subscribe({
      next: (data: any) => {
        this.sessions = data.results;
      },
      error: (err) => {
        console.error(err);
        this.toasterService.error('Failed to load data.', 'Error');
      }
    });
  }

  fetchAudioFiles() {
    this.apiService.fetchAudioRecords().subscribe({
      next: (data: any) => {
        this.audioFiles = data.results;
      },
      error: (err) => {
        console.error(err);
        this.toasterService.error('Failed to load data.', 'Error');
      }
    });
  }

  openCreateSession(content: any) {
    this.sessionForm.reset({ status: 'active', audio_file_ids: [] });
    this.isSessionEditing = false;
    this.editingSessionId = null;
    this.fetchSOP();
    this.fetchAudioFiles();
    this.modalService.open(content, { centered: true });
  }

  editSession(sessionId: number, content: any) {
    this.apiService.getSessionById(sessionId).subscribe((data: any) => {
      this.sessionForm.patchValue({
        name: data.name,
        sop_id: data.sop_details.id,
        status: data.status,
        audio_file_ids: data.audio_file_ids
      });
      this.isSessionEditing = true;
      this.editingSessionId = sessionId;
      this.fetchSOP();
      this.fetchAudioFiles();
      this.modalService.open(content, { centered: true });
    });
  }

  onSessionSubmit(modal: any) {
    this.sessionSubmitted = true;
    if (this.sessionForm.valid) {
      if (this.isSessionEditing && this.editingSessionId !== null) {
        this.apiService.updateSession(this.editingSessionId, this.sessionForm.value).subscribe({
          next: () => {
            this.fetchSessions();
            this.isSessionEditing = false;
            this.editingSessionId = null;
            modal.dismiss();
            this.toasterService.success('Session updated successfully!', 'Success');
            this.sessionForm.reset();
          },
          error: (err) => {
            console.error(err);
            this.toasterService.error('Failed to update.', 'Error');
          }
        });
      } else {
        this.apiService.createSession(this.sessionForm.value).subscribe({
          next: () => {
            if (this.showSessionTable) {
              this.fetchSessions();
              this.fetchDashboardSummary();
            }
            modal.dismiss();
            this.sessionSubmitted = false;
            this.sessionForm.reset();
            this.toasterService.success('Session created successfully!', 'Success');
          },
          error: (err) => {
            console.error(err);
            this.toasterService.error('Failed to create.', 'Error');
          }
        });
      }
    }
  }

  openSessionDeleteModal(content: any, sessionId: number) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'Confirm') {
          this.apiService.deleteSession(sessionId).subscribe({
            next: () => {
              this.fetchSessions();
              this.toasterService.success('Session deleted successfully!', 'Success');
            },
            error: (err) => {
              console.error(err);
              this.toasterService.error('Failed to delete item.', 'Error');
            }
          });
        }
      },
      () => {}
    );
  }
}