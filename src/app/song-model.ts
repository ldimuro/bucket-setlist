export class Track {
    track_name: string;
    artist?: string;
    album: string;
    cover_art: any;
    length: number | string;
    preview_audio: string;
    track_number?: number;
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
    artists?: any;
    id: string;
    cover_art?: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    tracks?: any[]
}

export class Image {
    url: string;
    height: number;
    width: number;
}

export class ErrorMessage {
    status: string;
    message: string;
    component: string;
    function: string;
}