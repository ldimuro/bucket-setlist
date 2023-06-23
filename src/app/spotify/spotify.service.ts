import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor() { }

  //SPOTIFY USER LOGIN AND AUTHORIZATION
  async authorizeSpotifyProfile() {
    const clientId = "3d2321a8c72646e191c8145193fa1cf7"; // clientID provided when creating an app
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      redirectToAuthCodeFlow(clientId);
    } else {
      const accessToken = await getAccessToken(clientId, code);
      const profile = await fetchProfile(accessToken);

      return profile;

      //I don't think we need this in the final version, but it'll be useful to see if the login is working
      //populateUI(profile);
    }
  }
}

//I was getting errors when I was putting this in the Init function, unsure if it is supposed to go here
//Redirect the user to the Spotify authorization page based on their clientID
export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  //this will be generated after we register the app
  params.append("client_id", clientId);
  params.append("response_type", "code");
  //this URI needs to be added into the list on the Spotify Dev page, this is where they will be redirected after loggin in
  params.append("redirect_uri", "http://localhost:4200/callback");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

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

interface Image {
  url: string;
  height: number;
  width: number;
}

/*
Use the DOM to find HTML elemtns and update them with the user's profile data (Look at https://developer.spotify.com/documentation/web-api/howtos/web-app-profile for html code)

function populateUI(profile: UserProfile) {
document.getElementById("displayName")!.innerText = profile.display_name;
if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
}
document.getElementById("id")!.innerText = profile.id;
document.getElementById("email")!.innerText = profile.email;
document.getElementById("uri")!.innerText = profile.uri;
document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
document.getElementById("url")!.innerText = profile.href;
document.getElementById("url")!.setAttribute("href", profile.href);
document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
}
*/
