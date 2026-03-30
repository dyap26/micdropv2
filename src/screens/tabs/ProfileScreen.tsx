import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { profile, signOut } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!profile) return;
    const [reviewsRes, followersRes, followingRes] = await Promise.all([
      supabase.from('reviews').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(6),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    ]);
    setReviews(reviewsRes.data ?? []);
    setFollowerCount(followersRes.count ?? 0);
    setFollowingCount(followingRes.count ?? 0);
  }, [profile]);

  useEffect(() => {
    fetchStats().finally(() => setLoading(false));
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    } else {
      Alert.alert('Sign out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]);
    }
  };

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C47FF" />}
    >
      {/* Avatar + name */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: '#6C47FF33',
          justifyContent: 'center', alignItems: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ color: '#6C47FF', fontSize: 32, fontWeight: '700' }}>
            {(profile.display_name ?? profile.username)[0].toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
          {profile.display_name ?? profile.username}
        </Text>
        <Text style={{ color: '#666', fontSize: 14, marginTop: 2 }}>@{profile.username}</Text>
        {profile.bio ? (
          <Text style={{ color: '#aaa', fontSize: 14, marginTop: 10, textAlign: 'center' }}>
            {profile.bio}
          </Text>
        ) : null}
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
        {[
          { label: 'Reviews', value: reviews.length },
          { label: 'Followers', value: followerCount },
          { label: 'Following', value: followingCount },
        ].map(stat => (
          <View key={stat.label} style={{ alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{stat.value}</Text>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          style={{
            flex: 1, borderWidth: 0.5, borderColor: '#444',
            borderRadius: 8, paddingVertical: 10, alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14 }}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyLists')}
          style={{
            flex: 1, borderWidth: 0.5, borderColor: '#444',
            borderRadius: 8, paddingVertical: 10, alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14 }}>My lists</Text>
        </TouchableOpacity>
      </View>

      {/* Recent reviews */}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
        Recent reviews
      </Text>
      {reviews.length === 0 ? (
        <Text style={{ color: '#555', fontSize: 14 }}>No reviews yet.</Text>
      ) : (
        reviews.map(r => (
          <View key={r.id} style={{
            backgroundColor: '#141414', borderRadius: 8, padding: 12,
            marginBottom: 8, borderWidth: 0.5, borderColor: '#222',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#888', fontSize: 12, textTransform: 'capitalize' }}>{r.target_type}</Text>
              {r.rating != null && (
                <Text style={{ color: '#6C47FF', fontWeight: '700' }}>{r.rating.toFixed(1)}</Text>
              )}
            </View>
            {r.body ? (
              <Text style={{ color: '#ccc', fontSize: 13 }} numberOfLines={2}>{r.body}</Text>
            ) : null}
          </View>
        ))
      )}

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{ marginTop: 32, alignItems: 'center' }}
      >
        <Text style={{ color: '#555', fontSize: 14 }}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}