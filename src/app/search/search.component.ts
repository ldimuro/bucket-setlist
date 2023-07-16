import { Component, OnInit } from '@angular/core';
import { Album, Artist, ErrorMessage, Track } from '../song-model';
import { Router } from '@angular/router';
import { SpotifyService } from '../spotify/spotify.service';
import { BucketSetlistService } from '../bucket-setlist.service';
import { first } from 'rxjs/operators';

export enum Tabs {
  Track = 'track',
  Artist = 'artist',
  Album = 'album',
  Error = 'error'
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit {

  total_tracks/*: Song[]*/ = [];
  total_artists/*: Artist[]*/ = [];
  total_albums/*: Album[] */ = [];
  confirmation_modal_open = false;
  search_val;
  current_tab: Tabs | string = Tabs.Track;
  audio_player;
  error: ErrorMessage;
  transaction_valid;
  isTxnProcessing: boolean;

  constructor(
    private router: Router,
    private spotifySvc: SpotifyService,
    private mainSvc: BucketSetlistService
  ) { }

  async ngOnInit() {
    // const songJSONData = await this.httpClient.get('assets/spotify-simulation-data.json', { responseType: 'json' }).toPromise();
    // const songs: Song[] = songJSONData['data'];

    // Clicking "Cancel" inside Track Confirmation Modal
    this.mainSvc.closeTrackConfirmationModal.subscribe(val => {
      if (val) {
        this.confirmation_modal_open = false;

        const searchComponent = document.getElementById(`searchComponent`);
        if (searchComponent) {
          document.getElementById(`searchComponent`).classList.remove('blur-background_in');
        }
      }
    });

    // If any errors occur in the app, redirect to Search page and display error message
    this.mainSvc.toError
      .pipe(first())
      .subscribe(val => {
        if (val) {
          this.transaction_valid = false;
          this.current_tab = Tabs.Error;
          this.isTxnProcessing = false;

          this.error = {
            status: val['status'],
            message: val['message'],
            component: val['component'],
            function: val['function']
          }

          console.error(`ERROR IN ${val['component']} ${val['function']}: ${val['message']}`);
        }
      });
  }

  search() {
    this.clearSearch();

    this.isTxnProcessing = true;

    if (this.current_tab === Tabs.Error || !this.search_val) {
      this.current_tab = Tabs.Track;
    }

    let search_result;
    this.spotifySvc.callSpotifySearch(this.spotifySvc.getAccessToken(), this.search_val, this.current_tab).then(val => {

      search_result = val;
      if (search_result['error']) {
        this.mainSvc.toError.next({ status: search_result['error']['status'], message: search_result['error']['message'], component: 'ArtistComponent', function: 'getData()' });
        this.router.navigate(['/search']);
      }
      else if (search_result) {
        this.transaction_valid = true;

        // Parse Tracks
        if (search_result.tracks) {
          search_result.tracks.items.forEach(track => {
            let trackObj: Track = {
              track_name: track.name,
              album: track.album.name,
              cover_art: track.album.images[0].url,
              duration: track.duration_ms,
              preview_audio: track.preview_url,
              id: track.id
            }

            // Add all artists in a comma separated list
            let artists = '';
            track.artists.forEach((artist, index) => {
              artists += artist.name;
              if (index !== track.artists.length - 1) {
                artists += ', ';
              }
            });
            trackObj.artist = artists;

            this.total_tracks.push(trackObj);
          });
        }

        // Parse Artists
        if (search_result.artists) {
          search_result.artists.items.forEach(artist => {
            let obj: Artist = {
              artist_name: artist.name,
              id: artist.id
            }

            // If Artist does not have an associated profile image, use placeholder
            if (artist.images.length > 0) {
              obj.profile_image = artist.images[0].url;
            }
            else {
              obj.profile_image = '/assets/placeholder.jpeg';
            }

            this.total_artists.push(obj);
          });
        }

        // Parse Albums
        if (search_result.albums) {
          search_result.albums.items.forEach(album => {
            let obj: Album = {
              album_name: album.name,
              album_type: album.album_type,
              release_date: album.release_date,
              release_date_precision: album.release_date_precision,
              total_tracks: album.total_tracks,
              id: album.id
            };

            const artists = [];
            album.artists.forEach(artist => {
              let artistObj = {
                artist_name: artist.name,
                id: artist.id
              }
              artists.push(artistObj);
            });
            obj.artists = artists;

            // If Artist does not have an associated profile image, use placeholder
            if (album.images.length > 0) {
              obj.cover_art = album.images[0].url;
            }
            else {
              obj.cover_art = '/assets/placeholder.jpeg';
            }

            this.total_albums.push(obj);
          });
        }
      }
    }).finally(() => {
      this.isTxnProcessing = false;
    });
  }

  // Makes Spotify API call every keystroke update in the Search Bar
  searchValueChanged($event: any) {
    if ($event.target.value !== '') {
      this.search();
    }
    else {
      this.clearSearch(true);
    }
  }

  trackClicked(song: any) {
    console.log('SONG CLICKED: ', song);
    this.mainSvc.toTrackConfirmationModal.next(song);
    this.confirmation_modal_open = true;

    document.getElementById(`searchComponent`).classList.add('blur-background_in');
  }

  artistClicked(artist: Artist) {
    this.router.navigate(['/artist'], { queryParams: { artistid: artist.id } });
  }

  albumClicked(album: Album) {
    this.router.navigate(['/artist'], { queryParams: { artistid: album.artists[0].id, albumid: album.id } });
  }

  clearSearch(resetTabs?: boolean) {
    this.total_tracks = [];
    this.total_artists = [];
    this.total_albums = [];

    if (resetTabs) {
      this.current_tab = Tabs.Track;
    }
  }

  tabChanged(tab: Tabs | string) {
    this.current_tab = tab;
  }

  public get SomeEnum() {
    return Tabs;
  }
}
