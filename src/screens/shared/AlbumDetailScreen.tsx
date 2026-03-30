import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { fetchAlbum, fetchAlbumTracks, SpotifyAlbum, SpotifyTrack, formatDuration } from '../../lib/spotify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'AlbumDetail'>;

export default function AlbumDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [avgRating, setAvgRating] = useState<{ avg: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAlbum(id),
      fetchAlbumTracks(id),
      supabase.from('item_ratings').select('*').eq('target_type', 'album').eq('target_id', id).single(),
    ]).then(([albumData, trackData, ratingRes]) => {
      setAlbum(albumData);
      setTracks(trackData);
      if (ratingRes.data) {
        setAvgRating({ avg: ratingRes.data.avg_rating, count: ratingRes.data.review_count });
      }

      // Cache album in Supabase
      supabase.from('artists').upsert({
        id: albumData.artist_id,
        name: albumData.artist_name,
        image_url: null,
        genres: [],
      }, { onConflict: 'id' }).then(() =>
        supabase.from('albums').upsert({
          id: albumData.id,
          title: albumData.title,
          artist_id: albumData.artist_id,
          release_year: albumData.release_year,
          artwork_url: albumData.artwork_url,
          type: albumData.type,
        }, { onConflict: 'id' })
      );
    }).catch(() => {
      Alert.alert('Error', 'Could not load album.');
      navigation.goBack();
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading || !album) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#0a0a0a' }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header art */}
      <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
        {album.artwork_url ? (
          <Image
            source={{ uri: album.artwork_url }}
            style={{ width: 200, height: 200, borderRadius: 8 }}
          />
        ) : (
          <View style={{ width: 200, height: 200, borderRadius: 8, backgroundColor: '#1f1f1f' }} />
        )}
      </View>

      {/* Meta */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
          {album.title}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('ArtistDetail', { id: album!.artist_id })}>
          <Text style={{ color: '#6C47FF', fontSize: 16, marginBottom: 4 }}>{album.artist_name}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#666', fontSize: 13 }}>
          {album.release_year}  ·  {album.total_tracks} tracks  ·  {album.type}
        </Text>

        {avgRating && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
              {avgRating.avg.toFixed(2)}
            </Text>
            <Text style={{ color: '#666', fontSize: 13 }}>
              / 5  ·  {avgRating.count} review{avgRating.count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('WriteReview', {
            targetType: 'album',
            targetId: album.id,
            targetName: album.title,
          })}
          style={{
            backgroundColor: '#6C47FF',
            borderRadius: 10,
            paddingVertical: 13,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Write a review</Text>
        </TouchableOpacity>
      </View>

      {/* Track list */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Tracks
        </Text>
        {tracks.map((track, i) => (
          <TouchableOpacity
            key={track.id}
            onPress={() => navigation.navigate('TrackDetail', { id: track.id })}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a',
            }}
          >
            <Text style={{ color: '#555', fontSize: 13, width: 28 }}>{i + 1}</Text>
            <Text style={{ flex: 1, color: '#fff', fontSize: 14 }} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={{ color: '#555', fontSize: 13 }}>{formatDuration(track.duration_ms)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
