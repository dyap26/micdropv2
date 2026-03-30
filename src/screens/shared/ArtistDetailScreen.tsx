import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { fetchArtist, fetchArtistAlbums, SpotifyArtist, SpotifyAlbum } from '../../lib/spotify';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<HomeStackParamList, 'ArtistDetail'>;

export default function ArtistDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [avgRating, setAvgRating] = useState<{ avg: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchArtist(id),
      fetchArtistAlbums(id),
      supabase.from('item_ratings').select('*').eq('target_type', 'artist').eq('target_id', id).single(),
    ]).then(([artistData, albumData, ratingRes]) => {
      setArtist(artistData);
      setAlbums(albumData);
      if (ratingRes.data) setAvgRating({ avg: ratingRes.data.avg_rating, count: ratingRes.data.review_count });

      supabase.from('artists').upsert({
        id: artistData.id, name: artistData.name,
        image_url: artistData.image_url, genres: artistData.genres,
      }, { onConflict: 'id' });
    }).catch(() => {
      Alert.alert('Error', 'Could not load artist.');
      navigation.goBack();
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading || !artist) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#0a0a0a' }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        {artist.image_url ? (
          <Image source={{ uri: artist.image_url }} style={{ width: 140, height: 140, borderRadius: 70 }} />
        ) : (
          <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: '#1f1f1f' }} />
        )}
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 14 }}>{artist.name}</Text>
        {artist.genres.length > 0 && (
          <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{artist.genres.slice(0, 3).join('  ·  ')}</Text>
        )}
        {avgRating && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>{avgRating.avg.toFixed(2)}</Text>
            <Text style={{ color: '#666', fontSize: 13 }}>/ 5  ·  {avgRating.count} review{avgRating.count !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('WriteReview', { targetType: 'artist', targetId: artist.id, targetName: artist.name })}
          style={{ backgroundColor: '#6C47FF', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 24 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Write a review</Text>
        </TouchableOpacity>

        <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Discography
        </Text>

        {albums.map(album => (
          <TouchableOpacity
            key={album.id}
            onPress={() => navigation.navigate('AlbumDetail', { id: album.id })}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
          >
            {album.artwork_url ? (
              <Image source={{ uri: album.artwork_url }} style={{ width: 52, height: 52, borderRadius: 6, marginRight: 12 }} />
            ) : (
              <View style={{ width: 52, height: 52, borderRadius: 6, backgroundColor: '#1f1f1f', marginRight: 12 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>{album.title}</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{album.release_year}  ·  {album.type}</Text>
            </View>
            <Text style={{ color: '#333', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
