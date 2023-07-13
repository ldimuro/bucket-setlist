import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify/spotify.service';
import { Album, Artist, Track } from '../song-model';
import { BucketSetlistService } from '../bucket-setlist.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit, OnDestroy {

  artist: Artist;
  albums: Album[] = [];
  selected_album;
  confirmation_modal_open = false;

  artistID;
  albumID;

  private subscriptions = [];

  constructor(
    private spotifySvc: SpotifyService,
    private mainSvc: BucketSetlistService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {

    // Retrieve artistID and albumID from URL
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      if (params['artistid']) {
        this.artistID = params['artistid'];
      }
      if (params['albumid']) {
        this.albumID = params['albumid'];
      }
    }));

    // Clicking "Cancel" inside Track Confirmation Modal
    this.subscriptions.push(this.mainSvc.closeTrackConfirmationModal.subscribe(val => {
      if (val) {
        this.confirmation_modal_open = false;

        const artistComponent = document.getElementById(`artistComponent`);
        if (artistComponent) {
          artistComponent.classList.remove('blur-background_in');
        }
      }
    }));

    await this.getData();

    // If user selected an album, jump to that album in the page
    this.waitForElm(`.album_${this.albumID}`).then((elm: HTMLElement) => {
      elm.scrollIntoView(true);
    });
  }

  async getData() {
    this.artist = await this.getArtist(this.artistID);

    // GET ALL ALBUM DATA
    this.albums = await this.getAllAlbums(this.artistID);
    console.log(`ALBUMS OF ${this.artist.artist_name}: `, this.albums);

    // Sort all releases by release_date
    this.albums.sort(function(a, b) {
      var keyA = new Date(a.release_date),
        keyB = new Date(b.release_date);
      // Compare the 2 dates
      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });

    this.albums.forEach(async (album: Album) => {
      const tracks = await this.getAllTracks(album);

      // If album has 'tracks' value, that means that they have been recursively added, and just need to add in tracks from the final call
      if (album.tracks) {
        album.tracks = album.tracks.concat(tracks);

        // Track listings with more than 50 tracks will be out of order, so order by track_number
        album.tracks.sort((a, b) => a.track_number - b.track_number)
      }
      else {
        album.tracks = tracks;
      }

      // Calculate runtime of each album, and format each track runtime
      let total_ms: any = 0;
      album.tracks.forEach((track: Track) => {
        const temp_duration = track.duration;
        total_ms += temp_duration;
        track.duration = this.msToTime(temp_duration);
      });
      album.runtime = this.msToTimeLong(total_ms);

      // Format release_date correctly
      const temp_date = album.release_date;
      album.release_date = this.formatDate(temp_date, album.release_date_precision);
    });
  }

  async getArtist(artist_id: string) {
    let artist;

    // Get Artist data from ArtistID
    await this.spotifySvc.getArtist(this.spotifySvc.getAccessToken(), artist_id).then(data => {
      if (data['error']) {
        this.mainSvc.toError.next({ status: data['error']['status'], message: data['error']['message'], component: 'ArtistComponent', function: 'getArtist()' });
        this.router.navigate(['/search']);
      }
      else {
        let artistObj: Artist = {
          artist_name: data.name,
          id: data.id
        }

        artist = artistObj;
      }
    });

    return artist;
  }

  async getAllAlbums(artist_id: any, next_url?: string, additional_albums?: any[]) {
    let all_albums = [];
    await this.spotifySvc.getAlbumsOfArtist(this.spotifySvc.getAccessToken(), artist_id, next_url).then(async data => {

      if (data['error']) {
        this.mainSvc.toError.next({ status: data['error']['status'], message: data['error']['message'], component: 'ArtistComponent', function: 'getAlbumsOfArtist()' });
        this.router.navigate(['/search']);
      }
      else {
        let artist_albums: Album[] = [];
        data.items.forEach(album => {
          let obj: Album = {
            album_name: album.name,
            album_type: album.album_type,
            id: album.id,
            release_date: album.release_date,
            release_date_precision: album.release_date_precision,
            total_tracks: album.total_tracks
          }

          // If Album does not have associated cover art, use placeholder
          if (album.images.length > 0) {
            obj.cover_art = album.images[0].url;
          }
          else {
            obj.cover_art = '/assets/placeholder.jpeg';
          }

          artist_albums.push(obj);
        });

        // If API call contains 'next' value, that means that the rest of the values must
        // be obtained recursively
        if (data.next) {
          additional_albums = await this.getAllAlbums(artist_id, data.next, artist_albums);

          if (artist_albums.length > 0) {
            artist_albums = [...artist_albums, ...additional_albums]
          }
          else {
            artist_albums = additional_albums;
          }
        }

        all_albums = artist_albums;
      }
    });

    return all_albums;
  }

  async getAllTracks(album: Album, next_url?: string, additional_tracks?: any[]) {
    let all_tracks = [];

    await this.spotifySvc.getTracksOfAlbum(this.spotifySvc.getAccessToken(), album.id, next_url).then(async val => {
      // console.log('TRACKS FROM ', album.album_name, ': ', val);

      if (val['error']) {
        this.mainSvc.toError.next({ status: val['error']['status'], message: val['error']['message'], component: 'ArtistComponent', function: 'getTracksOfAlbums()' });
        this.router.navigate(['/search']);
      }
      else if (val) {
        let tracks = [];
        val.items.forEach(track => {
          let trackObj: Track = {
            track_name: track.name,
            artist: track.artists[0].name,
            album: album.album_name,
            cover_art: album.cover_art,
            duration: track.duration_ms,
            preview_audio: track.preview_url,
            track_number: track.track_number,
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

          tracks.push(trackObj);
        });

        // If API call contains 'next' value, that means that the rest of the values must
        // be obtained recursively
        if (val.next) {
          additional_tracks = await this.getAllTracks(album, val.next, tracks);

          // If values have already been added recursively, add additional_tracks to existing list
          if (album.tracks) {
            album.tracks = [...album.tracks, ...additional_tracks];
          }
          else {
            album.tracks = additional_tracks;
          }
        }

        all_tracks = tracks;
      }
    });

    return all_tracks;
  }

  trackClicked(track: any) {
    console.log('TRACK CLICKED: ', track);
    this.mainSvc.toTrackConfirmationModal.next(track);
    this.confirmation_modal_open = true;

    document.getElementById(`artistComponent`).classList.add('blur-background_in');
  }

  // Waits for the search input/button to render before programmatically entering ID and clicking "Get Data"
  // https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
  waitForElm(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  msToTime(duration) {
    let seconds: any = Math.floor((duration / 1000) % 60);
    let minutes: any = Math.floor((duration / (1000 * 60)) % 60);
    let hours: any = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    // minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return (hours === "00" ? '' : hours + ":") + minutes + ":" + seconds;
  }

  msToTimeLong(duration) {
    let seconds: any = Math.floor((duration / 1000) % 60);
    let minutes: any = Math.floor((duration / (1000 * 60)) % 60);
    let hours: any = Math.floor((duration / (1000 * 60 * 60)) % 24);

    if (hours > 0) {
      return `${hours} hr${hours.length > 1 ? 's' : ''} ${minutes} min`
    }
    else {
      return `${minutes} min ${seconds} sec`;
    }
  }

  formatDate(release_date: string, precision: string) {
    let date_format;
    let locale = 'en-US';
    switch(precision) {
      case 'day':
        date_format = 'longDate';
        return formatDate(release_date, date_format, locale);
      case 'month':
        date_format = 'MMMM y';
        return formatDate(release_date, date_format, locale);
      default:
        return release_date;
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
      this.subscriptions = null;
    }
  }

}