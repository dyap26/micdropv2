// ─── Database row types ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  genres: string[];
  cached_at: string;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  release_year: number | null;
  artwork_url: string | null;
  type: 'album' | 'single' | 'compilation';
  cached_at: string;
}

export interface Track {
  id: string;
  title: string;
  album_id: string | null;
  artist_id: string;
  duration_ms: number | null;
  track_number: number | null;
  cached_at: string;
}

export type TargetType = 'album' | 'track' | 'artist';

export interface Review {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  rating: number | null;
  body: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface List {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  target_type: TargetType;
  target_id: string;
  position: number;
  note: string | null;
}

// ─── Enriched / joined types ──────────────────────────────────────────────────

export interface ReviewWithProfile extends Review {
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
}

export interface ItemRating {
  target_type: TargetType;
  target_id: string;
  avg_rating: number;
  review_count: number;
}

// ─── Navigation param types ───────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ActivityTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  AlbumDetail: { id: string };
  TrackDetail: { id: string };
  ArtistDetail: { id: string };
  UserProfile: { userId: string };
  ReviewDetail: { reviewId: string };
  WriteReview: { targetType: TargetType; targetId: string; targetName: string };
  ListDetail: { listId: string };
};

export type SearchStackParamList = {
  Search: undefined;
  AlbumDetail: { id: string };
  TrackDetail: { id: string };
  ArtistDetail: { id: string };
  WriteReview: { targetType: TargetType; targetId: string; targetName: string };
};

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  MyLists: undefined;
  ListDetail: { listId: string };
  CreateList: undefined;
  UserProfile: { userId: string };
  AlbumDetail: { id: string };
  TrackDetail: { id: string };
  ArtistDetail: { id: string };
};
