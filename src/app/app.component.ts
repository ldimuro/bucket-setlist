import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Track } from './song-model';
import { SpotifyService } from './spotify/spotify.service';
import { FirebaseService } from './firebase/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'bucket-setlist';

  constructor(
    private spotifyService: SpotifyService,
    private firebaseSvc: FirebaseService
  ){}

  async ngOnInit(): Promise<void> {

    // const profile = this.spotifyService.authorizeSpotifyProfile();
    await this.spotifyService.authorizeSpotifyProfile();

    await this.firebaseSvc.initializeFirebase();

    
  }
}