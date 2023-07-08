import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../spotify/spotify.service';
import { Album } from '../song-model';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit {

  albums: Album[] = [];

  constructor(
    private spotifySvc: SpotifyService
  ) { }

  ngOnInit() {
    this.spotifySvc.toArtistPage.subscribe(val => {
      console.log('ARTIST PAGE: ', val);

      // this.spotifySvc.callSpotifySearchByHREF(this.spotifySvc.getAccessToken(), val.href).then(data => {
      //   console.log('SPOTIFY CALL: ', data);
      // })

      this.spotifySvc.getAlbumsOfArtist(this.spotifySvc.getAccessToken(), val.id).then(data => {

        data['items'].forEach(album => {
          let obj: Album = {
            album_name: album['name'],
            album_type: album['album_type'],
            artist: album['artists'][0]['name'],
            id: album['id'],
            release_date: album['release_date'],
            release_date_precision: album['release_date_precision'],
            total_tracks: album['total_tracks']
          }

          // If Album does not have associated cover art, use placeholder
          if (album['images'].length > 0) {
            obj.cover_art = album['images'][0]['url'];
          }
          else {
            obj.cover_art = '/assets/placeholder.jpeg';
          }

          this.albums.push(obj);
        });

        console.log(`ALBUMS OF ${val.artist_name}: `, this.albums);
        
        
      })
    })
  }

}
