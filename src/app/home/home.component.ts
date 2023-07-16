import { Component, OnDestroy, OnInit } from '@angular/core';
import { BucketSetlistService } from '../bucket-setlist.service';
import { first } from 'rxjs/operators';
import { SpotifyService, getAccessToken } from '../spotify/spotify.service';
import { FirebaseService } from '../firebase/firebase.service';

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
    private spotifySvc: SpotifyService,
    private firebaseSvc: FirebaseService
  ) { }

  async ngOnInit() {
    this.mainSvc.toHomePage
      .pipe(first())
      .subscribe(async val => {
        if (val) {
          this.chosen_track = val;
          console.log('CHOSEN TRACK: ', this.chosen_track);

          const refreshedToken = await this.spotifySvc.refreshAccessToken().then(data => {
            console.log(data);
          });


          await this.firebaseSvc.setRefreshToken('test123');

          await this.firebaseSvc.getRefreshToken().then(data => {
            console.log('GOT REFRESH TOKEN: ', data);
          });

          // this.addSongToPlaylist(refreshedToken, this.chosen_track.id);
        }
    });

    this.profile = await this.spotifySvc.getProfile();
  }

  async addSongToPlaylist(token: string, trackID: string)
  {
    const spotifyEndpoint: string = 'https://api.spotify.com/v1/playlists/';
    //make sure that the playlist in home.component.html matches this one
    const playlistID: string = '5eJvHzeYF2BTaPGqfOoukM/';
    const trackToAdd: string = 'tracks?uris=spotify%3Atrack%3A' + trackID;
    const urlToFetch: string = spotifyEndpoint + playlistID + trackToAdd;

    const result = await fetch(urlToFetch, {
      method: "POST", headers: {Authorization: `Bearer ${token}`}
    });

  }

  ngOnDestroy(): void {
  }



}
