import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Artist, Song } from '../song-model';
import { Router } from '@angular/router';
import { SpotifyService } from '../spotify/spotify.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  total_songs/*: Song[]*/ = [];
  total_artists/*: Artist[]*/ = [];
  confirmation_modal_open = false;
  selected_song;
  search_val;
  filter_val = 'track';
  is_audio_playing: boolean = false;
  audio_player;
  testing = 'track';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private spotifyService: SpotifyService
  ) { }

  async ngOnInit() {
    const songJSONData = await this.httpClient.get('assets/spotify-simulation-data.json', { responseType: 'json' }).toPromise();
    const songs: Song[] = songJSONData['data'];
    // this.total_songs = songs;

    // console.log('DATA: ', songs);

    this.audio_player = new Audio();

  }

  searchButtonClicked() {
    this.total_songs = [];
    this.total_artists = [];

    let search_result;
    this.spotifyService.callSpotifySearch(this.spotifyService.getAccessToken(), this.search_val, this.filter_val).then(val => {
      console.log(val);
      search_result = val;

      // Parse Tracks
      if (search_result['tracks']) {
        search_result['tracks']['items'].forEach(track => {
          this.total_songs.push({
            song_name: track['name'],
            artist: track['artists'][0]['name'],
            album: track['album']['name'],
            cover_art: track['album']['images'][0]['url'],
            length: track['duration_ms'],
            preview_audio: track['preview_url']
          });
        });
      }

      // Parse Artists
      if (search_result['artists']) {
        search_result['artists']['items'].forEach(artist => {
          let obj: Artist = {
            artist_name: artist['name'],
            id: artist['id']
          }

          // If Artist does not have an associated profile image, use placeholder
          if (artist['images'].length > 0) {
            obj.profile_image = artist['images'][0]['url'];
          }
          else {
            obj.profile_image = '/assets/placeholder.jpeg';
          }

          this.total_artists.push(obj);
        });

        console.log(this.total_artists);
      }

      // Parse Albums
      if (search_result['albums']) {
        search_result['albums']['items'].forEach(track => {
          // this.total_songs.push({
          //   song_name: track['name'],
          //   artist: track['artists'][0]['name'],
          //   album: track['album']['name'],
          //   cover_art: track['album']['images'][0]['url'],
          //   length: track['duration_ms']
          // });
        });
      }
    });
  }

  songClicked(song: any) {
    console.log('SONG CLICKED: ', song);
    this.selected_song = song;
    this.confirmation_modal_open = true;

    document.getElementById(`searchComponent`).classList.add('blur-background_in');
  }

  artistClicked(artist: Artist) {
    this.spotifyService.toArtistPage.next(artist);
    this.router.navigate(['/artist']);
  }

  /**
   *  SONG CONFIRMATION MODAL FUNCTIONS
   */

  // If user accepts the song, take them to main Bucket Setlist page
  confirmSong() {
    document.getElementById(`searchComponent`).classList.remove('blur-background_in');
    this.router.navigate(['/home']);

  }

  // Click to play a 30 second sample of track, click again to stop
  playPreviewAudio(audio_file: any) {
    if (audio_file) {
      if (!this.is_audio_playing) {
        this.audio_player.src = audio_file;
        this.audio_player.load();
        this.audio_player.play();
        this.is_audio_playing = true;
      }
      else {
        this.audio_player.pause();
        this.audio_player.currentTime = 0;
        this.is_audio_playing = false;
      }

      this.audio_player.addEventListener('ended', () => {
        this.audio_player.currentTime = 0;
        this.is_audio_playing = false;
      });
    }
  }

  cancel() {
    this.selected_song = null;
    this.confirmation_modal_open = false;
    document.getElementById(`searchComponent`).classList.remove('blur-background_in');
  }

}
