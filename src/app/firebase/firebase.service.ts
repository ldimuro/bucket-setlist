import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, child, push, update, set, get } from "firebase/database";

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

  constructor() { }

  initializeFirebase() {
    this.app = initializeApp(this.firebaseConfig);
    this.database = getDatabase(this.app);
    const analytics = getAnalytics(this.app);
  }

  setRefreshToken(token: string) {
    try {
      set(ref(this.database, '/credentials/refreshToken'), token);
    }
    catch (ex) {
      // this.appSvc.setErrors(ex);
    }
  }
}
