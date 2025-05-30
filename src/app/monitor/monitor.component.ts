import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css'
})
export class MonitorComponent {

  logs: any[] = [];
  selectedLog: any = null;
  details: any = {};

  constructor(private apiService: ApiService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.apiService.getLogs().subscribe({
      next: (data: any) => {
        this.logs = data.results;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  openDetailsModal(log: any,detailsModal: any): void {
    this.selectedLog = log;
    this.details = log.details;
    this.modalService.open(detailsModal, { centered: true });
  }
}

