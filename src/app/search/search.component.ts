import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Song } from '../song-model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  total_songs: Song[] = [];

  constructor(
    private httpClient: HttpClient
  ) { }

  async ngOnInit() {
    const songJSONData = await this.httpClient.get('assets/spotify-simulation-data.json', { responseType: 'json' }).toPromise();
    const songs: Song[] = songJSONData['data'];
    this.total_songs = songs;

    console.log('DATA: ', songs);
  }

}
