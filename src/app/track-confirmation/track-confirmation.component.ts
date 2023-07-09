import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BucketSetlistService } from '../bucket-setlist.service';

@Component({
  selector: 'app-track-confirmation',
  templateUrl: './track-confirmation.component.html',
  styleUrls: ['./track-confirmation.component.scss']
})
export class TrackConfirmationComponent implements OnInit {

  selected_song;
  is_audio_playing: boolean = false;
  audio_player;

  constructor(
    private router: Router,
    private mainSvc: BucketSetlistService
  ) { }

  ngOnInit() {
    this.audio_player = new Audio();

    this.mainSvc.toTrackConfirmationModal.subscribe(val => {
      this.selected_song = val;
      console.log();
    })
  }

  // If user accepts the song, take them to main Bucket Setlist page
  confirmSong() {
    document.getElementById(`searchComponent`).classList.remove('blur-background_in');
    this.router.navigate(['/home']);

  }

  // Click to play a 30 second sample of track, click again to stop
  playPreviewAudio(audio_file: any) {
    if (audio_file) {
      if (!this.is_audio_playing) {
        this.audio_player.src = audio_file;
        this.audio_player.load();
        this.audio_player.play();
        this.is_audio_playing = true;
      }
      else {
        this.audio_player.pause();
        this.audio_player.currentTime = 0;
        this.is_audio_playing = false;
      }

      this.audio_player.addEventListener('ended', () => {
        this.audio_player.currentTime = 0;
        this.is_audio_playing = false;
      });
    }
  }

  cancel() {
    this.mainSvc.closeTrackConfirmationModal.next(true);

    // Stop music (if there's any playing)
    if (this.is_audio_playing) {
      this.audio_player.pause();
      this.audio_player.currentTime = 0;
      this.is_audio_playing = false;
    }
  }
}
