import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SectionList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchStackParamList } from '../../types';
import { searchSpotify, SearchResults, formatDuration } from '../../lib/spotify';

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults(null); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSpotify(text.trim());
        setResults(data);
      } catch {
        // silently fail — user will retry
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const sections = results ? [
    { title: 'Albums', data: results.albums, type: 'album' as const },
    { title: 'Tracks', data: results.tracks, type: 'track' as const },
    { title: 'Artists', data: results.artists, type: 'artist' as const },
  ].filter(s => s.data.length > 0) : [];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Search bar */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Albums, tracks, artists..."
          placeholderTextColor="#555"
          style={{
            backgroundColor: '#141414',
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: '#fff',
            fontSize: 15,
            borderWidth: 0.5,
            borderColor: '#2a2a2a',
          }}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {loading && (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator color="#6C47FF" />
        </View>
      )}

      {!loading && results && sections.length === 0 && (
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 15 }}>No results for "{query}"</Text>
        </View>
      )}

      {!loading && !results && !query && (
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 15 }}>Search for any music</Text>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderSectionHeader={({ section }) => (
          <Text style={{
            color: '#888', fontSize: 12, fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: 1,
            marginTop: 16, marginBottom: 8,
          }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item, section }) => (
          <TouchableOpacity
            onPress={() => {
              if (section.type === 'album') navigation.navigate('AlbumDetail', { id: item.id });
              else if (section.type === 'track') navigation.navigate('TrackDetail', { id: item.id });
              else navigation.navigate('ArtistDetail', { id: item.id });
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: '#1a1a1a',
            }}
          >
            {/* Artwork */}
            {'artwork_url' in item && item.artwork_url ? (
              <Image
                source={{ uri: item.artwork_url }}
                style={{ width: 48, height: 48, borderRadius: section.type === 'artist' ? 24 : 6, marginRight: 12 }}
              />
            ) : 'image_url' in item && item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
              />
            ) : (
              <View style={{
                width: 48, height: 48, borderRadius: section.type === 'artist' ? 24 : 6,
                backgroundColor: '#1f1f1f', marginRight: 12,
              }} />
            )}

            {/* Info */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                {item.name ?? ('title' in item ? item.title : '')}
              </Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                {'artist_name' in item ? item.artist_name
                  : 'genres' in item && item.genres.length ? item.genres[0]
                  : ''}
                {'release_year' in item && item.release_year
                  ? `  ·  ${item.release_year}` : ''}
                {'duration_ms' in item && item.duration_ms
                  ? `  ·  ${formatDuration(item.duration_ms)}` : ''}
              </Text>
            </View>

            <Text style={{ color: '#333', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
