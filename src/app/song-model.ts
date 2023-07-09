export class Track {
    song_name: string;
    artist?: string;
    album: string;
    cover_art: any;
    length: number | string;
    preview_audio: string;
    id: string;
}

export class Artist {
    artist_name: string;
    profile_image?: string;
    id: string;
}

export class Album {
    album_name: string;
    album_type: string;
    artist?: string;
    id: string;
    cover_art?: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
}

export class Image {
    url: string;
    height: number;
    width: number;
}