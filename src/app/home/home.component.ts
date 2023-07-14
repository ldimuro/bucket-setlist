import { Component, OnDestroy, OnInit } from '@angular/core';
import { BucketSetlistService } from '../bucket-setlist.service';
import { first } from 'rxjs/operators';
import { SpotifyService, getAccessToken } from '../spotify/spotify.service';

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
      .subscribe(async val => {
        if (val) {
          this.chosen_track = val;
          console.log('CHOSEN TRACK: ', this.chosen_track);

          const refreshedToken = await this.spotifySvc.refreshAccessToken();

          this.addSongToPlaylist(refreshedToken, this.chosen_track.id);
        }
    });

    this.profile = this.spotifySvc.getProfile();
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
