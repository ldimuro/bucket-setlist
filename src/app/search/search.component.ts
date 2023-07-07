import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Song } from '../song-model';
import { Router } from '@angular/router';
import { SpotifyService } from '../spotify/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  total_songs: Song[] = [];
  confirmation_modal_open = false;
  selected_song;
  search_val;
  filter_val = 'track';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private spotifyService: SpotifyService
  ) { }

  async ngOnInit() {
    const songJSONData = await this.httpClient.get('assets/spotify-simulation-data.json', { responseType: 'json' }).toPromise();
    const songs: Song[] = songJSONData['data'];
    this.total_songs = songs;

    console.log('DATA: ', songs);

    
  }

  searchButtonClicked() {
    const search_result = this.spotifyService.callSpotifySearch(this.spotifyService.getAccessToken(), this.search_val, this.filter_val);
    console.log(search_result);
  }

  songClicked(song: any) {
    console.log('SONG CLICKED: ', song);
    this.selected_song = song;
    this.confirmation_modal_open = true;

    document.getElementById(`searchComponent`).classList.add('blur-background_in');

    
  }

  // If user accepts the song, take them to main Bucket Setlist page
  confirmSong() {
    document.getElementById(`searchComponent`).classList.remove('blur-background_in');
    this.router.navigate(['/home']);

  }

  cancel() {
    this.selected_song = null;
    this.confirmation_modal_open = false;
    document.getElementById(`searchComponent`).classList.remove('blur-background_in');
  }

}
