import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loadingRequests = 0;
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading$.asObservable();

  show(): void {
    this.loadingRequests++;
    if (this.loadingRequests === 1) {
      this._isLoading$.next(true);
    }
  }

  hide(): void {
    if (this.loadingRequests > 0) {
      this.loadingRequests--;
    }
    if (this.loadingRequests === 0) {
      this._isLoading$.next(false);
    }
  }

  reset(): void {
    this.loadingRequests = 0;
    this._isLoading$.next(false);
  }
}
