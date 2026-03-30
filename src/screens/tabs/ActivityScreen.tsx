import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Review, TargetType } from '../../types';

const STARS = (rating: number) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

export default function ActivityScreen() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setReviews(data ?? []);
  }, [user]);

  useEffect(() => {
    fetchReviews().finally(() => setLoading(false));
  }, [fetchReviews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
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
      ListHeaderComponent={
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
          Your diary
        </Text>
      }
      ListEmptyComponent={
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 15 }}>No reviews yet.</Text>
          <Text style={{ color: '#444', fontSize: 13, marginTop: 6 }}>
            Search for music to get started.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const date = new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        });
        return (
          <View style={{
            backgroundColor: '#141414',
            borderRadius: 10,
            padding: 14,
            marginBottom: 10,
            borderWidth: 0.5,
            borderColor: '#222',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: '#888', fontSize: 12, textTransform: 'capitalize' }}>
                {item.target_type}
              </Text>
              <Text style={{ color: '#555', fontSize: 12 }}>{date}</Text>
            </View>
            {item.rating != null && (
              <Text style={{ color: '#6C47FF', fontSize: 13, marginBottom: 6 }}>
                {STARS(item.rating)}  {item.rating.toFixed(1)}
              </Text>
            )}
            {item.body ? (
              <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20 }} numberOfLines={4}>
                {item.body}
              </Text>
            ) : (
              <Text style={{ color: '#555', fontSize: 14, fontStyle: 'italic' }}>No text</Text>
            )}
          </View>
        );
      }}
    />
  );
}
