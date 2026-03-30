import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, ReviewWithProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'Feed'>;

export default function FeedScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    if (!user) return;

    // Fetch IDs of people this user follows
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = (followData ?? []).map((f: any) => f.following_id);
    // Include own reviews in feed too
    const ids = [...followingIds, user.id];

    const { data } = await supabase
      .from('reviews')
      .select('*, profile:profiles(username, display_name, avatar_url)')
      .in('user_id', ids)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(40);

    setReviews((data as ReviewWithProfile[]) ?? []);
  }, [user]);

  useEffect(() => {
    fetchFeed().finally(() => setLoading(false));
  }, [fetchFeed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const navigateToTarget = (review: ReviewWithProfile) => {
    const screen =
      review.target_type === 'album' ? 'AlbumDetail'
      : review.target_type === 'track' ? 'TrackDetail'
      : 'ArtistDetail';
    navigation.navigate(screen as any, { id: review.target_id });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={r => r.id}
      style={{ backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C47FF" />
      }
      ListEmptyComponent={
        <View style={{ paddingTop: 80, alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 16 }}>Nothing here yet.</Text>
          <Text style={{ color: '#444', fontSize: 14, marginTop: 6 }}>
            Search for music and follow some listeners.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ReviewDetail', { reviewId: item.id })}
          style={{
            backgroundColor: '#141414',
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            borderWidth: 0.5,
            borderColor: '#222',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{
              width: 34, height: 34, borderRadius: 17,
              backgroundColor: '#6C47FF22', justifyContent: 'center', alignItems: 'center',
              marginRight: 10,
            }}>
              <Text style={{ color: '#6C47FF', fontWeight: '600', fontSize: 13 }}>
                {(item.profile.display_name ?? item.profile.username)[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.user_id })}>
                <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14 }}>
                  {item.profile.display_name ?? item.profile.username}
                </Text>
              </TouchableOpacity>
              <Text style={{ color: '#555', fontSize: 12 }}>
                reviewed a{item.target_type === 'artist' ? 'n' : ''} {item.target_type}
              </Text>
            </View>
            {item.rating != null && (
              <Text style={{ color: '#6C47FF', fontWeight: '700', fontSize: 16 }}>
                {item.rating.toFixed(1)}
              </Text>
            )}
          </View>

          {/* Body */}
          {item.body ? (
            <Text style={{ color: '#bbb', fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
              {item.body}
            </Text>
          ) : null}

          {/* Footer */}
          <TouchableOpacity onPress={() => navigateToTarget(item)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#6C47FF', fontSize: 13 }}>
              View {item.target_type} →
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}
