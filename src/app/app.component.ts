import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Song } from './song-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'bucket-setlist';
  total_songs: Song[] = [];

  constructor(
    private httpClient: HttpClient
  ){}

  async ngOnInit(): Promise<void> {
    const songJSONData= await this.httpClient.get('assets/spotify-simulation-data.json', { responseType: 'json' }).toPromise();
    const songs: Song[] = songJSONData['data'];
    this.total_songs = songs;

    console.log('DATA: ', songs);
    
  }



  




}
