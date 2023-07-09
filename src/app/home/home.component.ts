import { Component, OnDestroy, OnInit } from '@angular/core';
import { BucketSetlistService } from '../bucket-setlist.service';
import { first } from 'rxjs/operators';
import { SpotifyService } from '../spotify/spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  chosen_track;
  profile;

  constructor(
    private mainSvc: BucketSetlistService,
    private spotifySvc: SpotifyService
  ) { }

  ngOnInit() {
    this.mainSvc.toHomePage
      .pipe(first())
      .subscribe(val => {
        if (val) {
          this.chosen_track = val;
          console.log('CHOSEN TRACK: ', this.chosen_track);
        }
    });

    this.profile = this.spotifySvc.getProfile();
  }

  ngOnDestroy(): void {
  }



}
