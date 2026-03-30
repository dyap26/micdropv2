const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET!;

const BASE = 'https://api.spotify.com/v1';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

// ─── Token cache ─────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error('Failed to fetch Spotify token');

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status} ${path}`);
  return res.json();
}

// ─── Normalized types ────────────────────────────────────────────────────────

export interface SpotifyArtist {
  id: string;
  name: string;
  image_url: string | null;
  genres: string[];
}

export interface SpotifyAlbum {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  release_year: number;
  artwork_url: string | null;
  type: 'album' | 'single' | 'compilation';
  total_tracks: number;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  album_id: string;
  artist_id: string;
  artist_name: string;
  duration_ms: number;
  track_number: number;
  artwork_url: string | null;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResults {
  albums: SpotifyAlbum[];
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
}

export async function searchSpotify(query: string): Promise<SearchResults> {
  const q = encodeURIComponent(query);
  const data = await spotifyFetch<any>(
    `/search?q=${q}&type=album,track,artist&limit=8`
  );

  const albums: SpotifyAlbum[] = (data.albums?.items ?? [])
    .filter(Boolean)
    .map(normalizeAlbum);

  const tracks: SpotifyTrack[] = (data.tracks?.items ?? [])
    .filter(Boolean)
    .map(normalizeTrack);

  const artists: SpotifyArtist[] = (data.artists?.items ?? [])
    .filter(Boolean)
    .map(normalizeArtist);

  return { albums, tracks, artists };
}

// ─── Individual fetches ──────────────────────────────────────────────────────

export async function fetchAlbum(id: string): Promise<SpotifyAlbum> {
  const data = await spotifyFetch<any>(`/albums/${id}`);
  return normalizeAlbum(data);
}

export async function fetchAlbumTracks(id: string): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<any>(`/albums/${id}/tracks?limit=50`);
  return (data.items ?? []).map((t: any) => ({
    id: t.id,
    title: t.name,
    album_id: id,
    artist_id: t.artists?.[0]?.id ?? '',
    artist_name: t.artists?.[0]?.name ?? '',
    duration_ms: t.duration_ms,
    track_number: t.track_number,
    artwork_url: null, // track items in this endpoint have no image
  }));
}

export async function fetchArtist(id: string): Promise<SpotifyArtist> {
  const data = await spotifyFetch<any>(`/artists/${id}`);
  return normalizeArtist(data);
}

export async function fetchTrack(id: string): Promise<SpotifyTrack> {
  const data = await spotifyFetch<any>(`/tracks/${id}`);
  return normalizeTrack(data);
}

export async function fetchArtistAlbums(id: string): Promise<SpotifyAlbum[]> {
  const data = await spotifyFetch<any>(
    `/artists/${id}/albums?include_groups=album,single&limit=20`
  );
  return (data.items ?? []).filter(Boolean).map(normalizeAlbum);
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeAlbum(a: any): SpotifyAlbum {
  return {
    id: a.id,
    title: a.name,
    artist_id: a.artists?.[0]?.id ?? '',
    artist_name: a.artists?.[0]?.name ?? '',
    release_year: parseInt(a.release_date?.split('-')[0] ?? '0', 10),
    artwork_url: a.images?.[0]?.url ?? null,
    type: a.album_type ?? 'album',
    total_tracks: a.total_tracks ?? 0,
  };
}

function normalizeTrack(t: any): SpotifyTrack {
  return {
    id: t.id,
    title: t.name,
    album_id: t.album?.id ?? '',
    artist_id: t.artists?.[0]?.id ?? '',
    artist_name: t.artists?.[0]?.name ?? '',
    duration_ms: t.duration_ms,
    track_number: t.track_number,
    artwork_url: t.album?.images?.[0]?.url ?? null,
  };
}

function normalizeArtist(a: any): SpotifyArtist {
  return {
    id: a.id,
    name: a.name,
    image_url: a.images?.[0]?.url ?? null,
    genres: a.genres ?? [],
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
