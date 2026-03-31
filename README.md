# MicDrop

Your new favorite music reviewing app. Log albums, tracks, and artists so that your friends can see what you are listening to.

## Stack

- **Expo** ~53 (React Native 0.79, React 19)
- **TypeScript** ~5.8
- **NativeWind** ^4 (Tailwind for React Native)
- **Supabase** ^2.50 (auth, database, RLS)
- **React Navigation** v7 (native stack + bottom tabs)
- **Spotify Web API** (Client Credentials — no user OAuth needed)

## Project structure

```
micdrop/
├── app.tsx                  # Root component
├── index.ts                 # Expo entry point
├── src/
│   ├── context/
│   │   └── AuthContext.tsx  # Session + profile state
│   ├── hooks/
│   │   └── useAddToList.ts  # Add items to curated lists
│   ├── lib/
│   │   ├── alert.ts         # General alerts
│   │   ├── supabase.ts      # Supabase singleton
│   │   └── spotify.ts       # Spotify API client + token cache
│   ├── navigation/
│   │   ├── AppNavigator.tsx  # Root stack (Auth vs Main)
│   │   ├── AuthNavigator.tsx # Login / Register
│   │   └── MainNavigator.tsx # Bottom tabs + nested stacks
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── tabs/
│   │   │   ├── FeedScreen.tsx      # Following feed
│   │   │   ├── SearchScreen.tsx    # Spotify search
│   │   │   ├── ActivityScreen.tsx  # Own diary
│   │   │   └── ProfileScreen.tsx   # Own profile
│   │   └── shared/
│   │       ├── AlbumDetailScreen.tsx
│   │       ├── TrackDetailScreen.tsx
│   │       ├── ArtistDetailScreen.tsx
│   │       ├── WriteReviewScreen.tsx
│   │       ├── ReviewDetailScreen.tsx
│   │       ├── UserProfileScreen.tsx
│   │       ├── EditProfileScreen.tsx
│   │       ├── MyListsScreen.tsx
│   │       ├── CreateListScreen.tsx
│   │       └── ListDetailScreen.tsx
│   ├── types/
│   │   └── index.ts         # All TypeScript types + nav params
│   └── global.css           # NativeWind entry
└── utils/                   # (reserved for future helpers)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

**Supabase keys** — find these in your Supabase dashboard under Project Settings → API.

**Spotify keys** — create an app at [developer.spotify.com](https://developer.spotify.com/dashboard). This app uses the Client Credentials flow (no user login required), so you only need the client ID and secret.

### 3. Run the Supabase migration

In your Supabase dashboard go to **Database → SQL Editor**, paste the contents of `micdrop_schema.sql`, and run it.

### 4. Start the app

```bash
npx expo start
```

  * Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)
  * Press 'i' for iOS simulator
  * Press 'a' for Android emulator
  * Press 'w' for web browser

## Key design decisions

**Spotify IDs as primary keys.** Albums, tracks, and artists use Spotify's string IDs directly in the database. When a user views an item for the first time, the app upserts it into Supabase as a cache entry. This avoids repeated API calls for the same content.

**Polymorphic reviews.** A single `reviews` table handles albums, tracks, and artists via `target_type` + `target_id`. The `unique(user_id, target_type, target_id)` constraint means upsert naturally handles edits — no separate update flow needed.

**Half-step ratings.** Ratings are stored as `numeric(3,1)` with a DB-level check constraint enforcing 0.5 increments. The UI presents a tap grid (0.5 → 5.0) so malformed values never reach the database.

**Client Credentials token cache.** The Spotify token is cached in module scope and refreshed 60 seconds before expiry. This means one token fetch per app session rather than one per request.

## Adding items to lists

The `useAddToList` hook is available in any screen. Call `addToList(targetType, targetId, targetName)` to present a native action sheet letting the user pick which list to add the item to.

```tsx
import { useAddToList } from '../../hooks/useAddToList';

const { addToList } = useAddToList();

<TouchableOpacity onPress={() => addToList('album', album.id, album.title)}>
  <Text>Add to list</Text>
</TouchableOpacity>
```

## Contributing

Contributions welcome. Run `expo lint` before opening a PR.
