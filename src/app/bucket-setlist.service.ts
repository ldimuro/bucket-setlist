import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BucketSetlistService {

  constructor() { }

  toTrackConfirmationModal = new BehaviorSubject(undefined);
  closeTrackConfirmationModal = new BehaviorSubject(undefined);
  toHomePage = new BehaviorSubject(undefined);
  toError = new BehaviorSubject(undefined);
}
