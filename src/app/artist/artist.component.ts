import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify/spotify.service';
import { Album, Artist } from '../song-model';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit {

  artist: Artist;
  albums: Album[] = [];

  constructor(
    private spotifySvc: SpotifyService
  ) { }

  ngOnInit() {
    this.spotifySvc.toArtistPage.subscribe(val => {
      this.artist = val;

      // Use Artist ID to get all Albums of that Artist
      this.spotifySvc.getAlbumsOfArtist(this.spotifySvc.getAccessToken(), val.id).then(data => {
        const artist_albums: Album[] = [];
        data.items.forEach(album => {
          let obj: Album = {
            album_name: album.name,
            album_type: album.album_type,
            artist: album.artists[0].name,
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

        console.log(`ALBUMS OF ${val.artist_name}: `, artist_albums);

        // Retrieve all Tracks for every Album
        artist_albums.forEach(async album => {
          await this.spotifySvc.getTracksOfAlbum(this.spotifySvc.getAccessToken(), album.id).then(val => {
            let tracks = [];
            val.items.forEach(track => {
              let trackObj = {
                song_name: track.name,
                artist: track.artists[0].name,
                album: album.album_name,
                cover_art: album.cover_art,
                length: this.msToTime(track.duration_ms),
                preview_audio: track.preview_url,
                id: track.id
              }

              tracks.push(trackObj);
            })

            // Add "tracks" array to existing Album object
            album['tracks'] = tracks;
          });
        });

        this.albums = artist_albums;

      });
    })
  }

  msToTime(duration) {
    let seconds: any = Math.floor((duration / 1000) % 60);
    let minutes: any = Math.floor((duration / (1000 * 60)) % 60);
    let hours: any = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    // minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return (hours === "00" ? '' : hours + ":" )+ minutes + ":" + seconds;
  }

}
