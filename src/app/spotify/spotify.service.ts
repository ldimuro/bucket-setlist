import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

//#region SPOTIFY USER LOGIN AND AUTHORIZATION
export class SpotifyService {

  accessToken;
  profile;

  constructor(public http: HttpClient) { }

  async authorizeSpotifyProfile() {
    const clientId = "3d2321a8c72646e191c8145193fa1cf7"; // clientID provided when creating an app
    //check the current URL in the search bar and store its parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    //if the user is not already signed in to the web app, generate a code and token when they agree to the privacy statement
    if (!code) {
      redirectToAuthCodeFlow(clientId);
    }
    //if the user is already logged in the search bar will have the code in the URL
    else {
      const accessToken = await getAccessToken(clientId, code);
      this.setAccessToken(accessToken);

      const profile = await fetchProfile(accessToken).then(val => {
        const search_result = val;
        if (search_result['error']) {
          const error_message = `[${search_result['error']['status']}] ${search_result['error']['message']}`;
          console.error(`ERROR IN SearchComponent searchButtonClicked(): ${error_message}`);
        }
        else {
          this.setProfile(search_result);
        }


        // this.setProfile(val);
      });

      // const searchValue = this.callSpotifySearch(accessToken, 'indexical reminder');
      // console.log(searchValue);

      // populateUI(profile);



      return profile;

      //I don't think we need this in the final version, but it'll be useful to see if the login is working

    }
  }

  async callSpotifySearch(token: string, searchVal: string, filterVal: string): Promise<SearchResult> {
    const searchURL: string = `https://api.spotify.com/v1/search?q=${searchVal}&type=artist,track,album&limit=50`;

    const result = await fetch(searchURL, {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
  }

  async getArtist(token: string, artist_id: string) {
    const albumsURL: string = `https://api.spotify.com/v1/artists/${artist_id}`;
    const result = await fetch(albumsURL, {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
  }

  async getAlbumsOfArtist(token: string, artist_id: string, next_url?: string) {
    let albumsURL: string;
    if (next_url) {
      albumsURL = next_url;
    }
    else {
      albumsURL = `https://api.spotify.com/v1/artists/${artist_id}/albums?include_groups=album,single,compilation&limit=50`;
    }

    const result = await fetch(albumsURL, {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
  }

  async getTracksOfAlbum(token: string, album_id: string, next_url?: string) {
    let albumsURL: string;
    if (next_url) {
      albumsURL = next_url;
    }
    else {
      albumsURL = `https://api.spotify.com/v1/albums/${album_id}/tracks?limit=50`;
    }

    const result = await fetch(albumsURL, {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
  }

  getAccessToken() {
    return this.accessToken;
  }

  setAccessToken(token: any) {
    this.accessToken = token;
  }

  getProfile() {
    return this.profile;
  }

  setProfile(profile: any) {
    this.profile = profile;
  }
}

//Redirect the user to the Spotify authorization page
export async function redirectToAuthCodeFlow(clientId: string) {
  //ran
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  //this will be generated after we register the app
  params.append("client_id", clientId);
  params.append("response_type", "code");
  //this URI needs to be added into the list on the Spotify Dev page, this is where they will be redirected after loggin in
  params.append("redirect_uri", "http://localhost:4200/callback");
  //scope is a list of permissions that we're requesting from the user (all scopes need to be included when moving to next stage of production)
  //user-read-private: gives us access to the user's subscription details (allows for Search and Get Current User's Profile)
  //user-read-email: gives us access to the user's real email address (allows for Get Current User's Profile)
  params.append("scope", "user-read-private user-read-email playlist-modify-public");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  //this will load the privacy statement page for the user bsed on the previously generated parameters
  document.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

//This is the PKCE Authorization
function generateCodeVerifier(length: number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

//Load the verifier from local storage to perform a POST to the Spotify token API to make sure the token exchange works
export async function getAccessToken(clientId: string, code: string): Promise<string> {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:4200/callback");
  params.append("code_verifier", verifier!);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

//call the Web API to get the user's data
async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

//Type saftey implementation for Typescript
interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean,
    filter_locked: boolean
  },
  external_urls: { spotify: string; };
  followers: { href: string; total: number; };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

interface SearchResult {
  tracks: {
    href: string;
    items: Track[];
    limit: number;
    next: string;
    offset: number;
    previous: string;
    total: number;
  }
}

interface Track {
  album: Album;
  artists: Artist[];
  available_markets: any[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: any[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

interface Artist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}


interface Image {
  url: string;
  height: number;
  width: number;
}


// Use the DOM to find HTML elemtns and update them with the user's profile data (Look at https://developer.spotify.com/documentation/web-api/howtos/web-app-profile for html code)

function populateUI(profile: UserProfile) {
  console.log(profile);
  // document.getElementById("displayName")!.innerText = profile.display_name;
  // if (profile.images[0]) {
  //     const profileImage = new Image(200, 200);
  //     profileImage.src = profile.images[0].url;
  //     document.getElementById("avatar")!.appendChild(profileImage);
  // }
  // document.getElementById("id")!.innerText = profile.id;
  // document.getElementById("email")!.innerText = profile.email;
  // document.getElementById("uri")!.innerText = profile.uri;
  // document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
  // document.getElementById("url")!.innerText = profile.href;
  // document.getElementById("url")!.setAttribute("href", profile.href);
  // document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
}

//#endregion

//#region SPOTIFY SEARCH FEATURE

//#endregion