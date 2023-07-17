import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, child, push, update, set, get } from "firebase/database";
import { Track } from '../song-model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firebaseConfig = {
    apiKey: "AIzaSyBDSS1zvqSEfOG4hKKKUdF_N0HS7-xCLvA",
    authDomain: "bucket-setlist.firebaseapp.com",
    projectId: "bucket-setlist",
    storageBucket: "bucket-setlist.appspot.com",
    messagingSenderId: "948112956229",
    appId: "1:948112956229:web:3895fbf179e932d37ebc2c",
    measurementId: "G-MZ62L5EF85"
  };

  app;
  database;
  refresh_token;
  playlist_tracks: Track[];
  toPlaylistTracks = new BehaviorSubject(undefined);

  constructor() { }

  initializeFirebase() {
    this.app = initializeApp(this.firebaseConfig);
    this.database = getDatabase(this.app);
    const analytics = getAnalytics(this.app);

    this.getPlaylistTracks().then(val => {
      this.playlist_tracks = val;
      this.toPlaylistTracks.next(this.playlist_tracks);
    });
  }

  async updateRefreshToken(token: string) {
    try {
      update(ref(this.database, '/credentials/'), { refresh_token: token });
      this.refresh_token = token;
    }
    catch (ex) {
      console.error(ex);
    }
  }

  async postSelectedTrack(track: Track) {
    try {
      set(ref(this.database, `/playlist/${track.id}`), track);
    }
    catch (ex) {
      console.error(ex);
    }
  }

  async getPlaylistTracks() {
    const dbRef = ref(this.database);
    let tracks: Track[];

    await get(child(dbRef, '/playlist/')).then((snapshot) => {
      if (snapshot.exists()) {
        tracks = snapshot.val();
      } else {
        tracks = null;
      }
    }).catch((error) => {
      console.error(error);
      return error;
    });

    return tracks;
  }

  async getRefreshToken() {
    const dbRef = ref(this.database);
    let refresh_token;

    await get(child(dbRef, '/credentials/refresh_token')).then((snapshot) => {
      if (snapshot.exists()) {
        refresh_token = snapshot.val();
      } else {
        refresh_token = null;
      }
    }).catch((error) => {
      console.error(error);
      return error;
    });

    return refresh_token;
  }

}
