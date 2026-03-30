import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { fetchTrack, SpotifyTrack, formatDuration } from '../../lib/spotify';
import { supabase } from '../../lib/supabase';
import { showAlert } from '../../lib/alert';

type Props = NativeStackScreenProps<HomeStackParamList, 'TrackDetail'>;

export default function TrackDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [avgRating, setAvgRating] = useState<{ avg: number; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTrack(id),
      supabase.from('item_ratings').select('*').eq('target_type', 'track').eq('target_id', id).maybeSingle(),
    ]).then(([trackData, ratingRes]) => {
      setTrack(trackData);
      if (ratingRes.data) {
        setAvgRating({ avg: ratingRes.data.avg_rating, count: ratingRes.data.review_count });
      }
      supabase.from('tracks').upsert({
        id: trackData.id,
        title: trackData.title,
        album_id: trackData.album_id || null,
        artist_id: trackData.artist_id,
        duration_ms: trackData.duration_ms,
        track_number: trackData.track_number,
      }, { onConflict: 'id' });
    }).catch(() => {
      showAlert('Error', 'Could not load track.');
      navigation.goBack();
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading || !track) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: '#0a0a0a' }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        {track.artwork_url ? (
          <Image source={{ uri: track.artwork_url }} style={{ width: 180, height: 180, borderRadius: 8 }} />
        ) : (
          <View style={{ width: 180, height: 180, borderRadius: 8, backgroundColor: '#1f1f1f' }} />
        )}
      </View>

      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 }}>{track.title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ArtistDetail', { id: track!.artist_id })}>
        <Text style={{ color: '#6C47FF', fontSize: 16, marginBottom: 4 }}>{track.artist_name}</Text>
      </TouchableOpacity>
      <Text style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>
        Track {track.track_number}  ·  {formatDuration(track.duration_ms)}
      </Text>
      {track.album_id ? (
        <TouchableOpacity onPress={() => navigation.navigate('AlbumDetail', { id: track!.album_id })}>
          <Text style={{ color: '#555', fontSize: 13 }}>View album →</Text>
        </TouchableOpacity>
      ) : null}

      {avgRating && (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700' }}>{avgRating.avg.toFixed(2)}</Text>
          <Text style={{ color: '#666', fontSize: 13 }}>
            / 5  ·  {avgRating.count} review{avgRating.count !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('WriteReview', { targetType: 'track', targetId: track.id, targetName: track.title })}
        style={{ backgroundColor: '#6C47FF', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 28 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Write a review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}