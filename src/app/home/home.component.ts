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

          /*
            This is kind of like a paradox because firebase is constantly cycling and replacing the old refresh token with the new one, but there has to be an original token.
            So this is what I did and what we'll have to do if the cycle breaks:
            1) Comment out the firebase get/set
            2) Log into the bucket setlist web app as Clou Diller to have Spotify generate a new refresh_token
            3) Uncomment the firebase setter
            3) Have Spotify generate a new refresh token for Clou Diller (we can do this by having Clou make any kind of call to the api) and it will be stored in firebase
            4) Uncomment the firebase getter and now the cycle should be set
          */


          let storeRefreshToken;
          await this.firebaseSvc.getRefreshToken().then(data => {
            console.log('GOT REFRESH TOKEN: ', data);
            storeRefreshToken = data;
          });
          const { access_token, refresh_token } = await this.spotifySvc.refreshAccessToken(storeRefreshToken);

          console.log("New Refresh Token: " + refresh_token);

          await this.firebaseSvc.updateRefreshToken(refresh_token);

          await this.addSongToPlaylist(access_token, this.chosen_track.id);
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
