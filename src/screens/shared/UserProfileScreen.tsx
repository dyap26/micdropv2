import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, Profile, Review } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'UserProfile'>;

export default function UserProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    const [profileRes, reviewsRes, followRes, followerRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('reviews').select('*').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending: false }).limit(6),
      user ? supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    ]);
    setProfile(profileRes.data);
    setReviews(reviewsRes.data ?? []);
    setIsFollowing(!!followRes.data);
    setFollowerCount(followerRes.count ?? 0);
  }, [userId, user]);

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const toggleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
        setIsFollowing(false);
        setFollowerCount(c => c - 1);
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: userId });
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
      }
    } catch {
      Alert.alert('Error', 'Could not update follow.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <ScrollView style={{ backgroundColor: '#0a0a0a' }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#6C47FF33', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#6C47FF', fontSize: 28, fontWeight: '700' }}>
            {(profile.display_name ?? profile.username)[0].toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{profile.display_name ?? profile.username}</Text>
        <Text style={{ color: '#555', fontSize: 13, marginTop: 2 }}>@{profile.username}</Text>
        {profile.bio ? <Text style={{ color: '#aaa', fontSize: 14, marginTop: 10, textAlign: 'center' }}>{profile.bio}</Text> : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{reviews.length}</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>Reviews</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{followerCount}</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>Followers</Text>
        </View>
      </View>

      {!isOwnProfile && (
        <TouchableOpacity
          onPress={toggleFollow}
          disabled={followLoading}
          style={{
            borderWidth: 0.5,
            borderColor: isFollowing ? '#444' : '#6C47FF',
            backgroundColor: isFollowing ? 'transparent' : '#6C47FF22',
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: isFollowing ? '#888' : '#6C47FF', fontWeight: '600' }}>
            {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 12 }}>Recent reviews</Text>
      {reviews.length === 0 ? (
        <Text style={{ color: '#555', fontSize: 14 }}>No public reviews yet.</Text>
      ) : reviews.map(r => (
        <View key={r.id} style={{ backgroundColor: '#141414', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#222' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#888', fontSize: 12, textTransform: 'capitalize' }}>{r.target_type}</Text>
            {r.rating != null && <Text style={{ color: '#6C47FF', fontWeight: '700' }}>{r.rating.toFixed(1)}</Text>}
          </View>
          {r.body ? <Text style={{ color: '#ccc', fontSize: 13 }} numberOfLines={2}>{r.body}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}
