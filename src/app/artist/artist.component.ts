import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify/spotify.service';
import { Album, Artist, Track } from '../song-model';
import { BucketSetlistService } from '../bucket-setlist.service';
import { first } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

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
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    // Retrieve artistID and albumID from URL
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      console.log('PARAMS: ', params);
      if (params['artistid']) {
        this.artistID = params['artistid'];
      }
      if (params['albumid']) {
        this.albumID = params['albumid'];
      }
    }));

    // Get Artist data from ArtistID
    this.spotifySvc.getArtist(this.spotifySvc.getAccessToken(), this.artistID).then(data => {
      this.artist = {
        artist_name: data.name,
        id: data.id
      }
    });

    // Use Artist ID to get all Albums of that Artist
    this.spotifySvc.getAlbumsOfArtist(this.spotifySvc.getAccessToken(), this.artistID).then(async data => {
      const artist_albums: Album[] = [];
      data.items.forEach(album => {
        let obj: Album = {
          album_name: album.name,
          album_type: album.album_type,
          id: album.id,
          release_date: album.release_date,
          release_date_precision: album.release_date_precision,
          total_tracks: album.total_tracks
        }

        if (album.artists.length > 1) {
          console.log(album.artists);
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

      console.log(`ALBUMS OF ${this.artist.artist_name}: `, artist_albums);

      // Retrieve all Tracks for every Album
      artist_albums.forEach(async album => {
        await this.spotifySvc.getTracksOfAlbum(this.spotifySvc.getAccessToken(), this.albumID).then(val => {
          let tracks = [];
          val.items.forEach(track => {
            let trackObj: Track = {
              track_name: track.name,
              artist: track.artists[0].name,
              album: album.album_name,
              cover_art: album.cover_art,
              length: this.msToTime(track.duration_ms),
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

            tracks.push(trackObj);
          })

          // Add "tracks" array to existing Album object
          album['tracks'] = tracks;
        });
      });

      this.albums = artist_albums;

      const jump_to_album = await this.waitForElm(`.album_${this.albumID}`) as HTMLElement;
      jump_to_album.scrollIntoView(true);

    });

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

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
      this.subscriptions = null;
    }
  }

}