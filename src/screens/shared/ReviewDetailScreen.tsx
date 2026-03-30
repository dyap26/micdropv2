import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, ReviewWithProfile, ReviewComment } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../lib/alert';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReviewDetail'>;

interface CommentWithProfile extends ReviewComment {
  profile: { username: string; display_name: string | null };
}

export default function ReviewDetailScreen({ route, navigation }: Props) {
  const { reviewId } = route.params;
  const { user } = useAuth();
  const [review, setReview] = useState<ReviewWithProfile | null>(null);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [reviewRes, commentsRes] = await Promise.all([
      supabase.from('reviews').select('*, profile:profiles(username, display_name, avatar_url)').eq('id', reviewId).single(),
      supabase.from('review_comments').select('*, profile:profiles(username, display_name)').eq('review_id', reviewId).order('created_at'),
    ]);
    setReview(reviewRes.data as ReviewWithProfile);
    setComments(commentsRes.data as CommentWithProfile[] ?? []);
  }, [reviewId]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const submitComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    setCommentError(null);
    const { error } = await supabase.from('review_comments').insert({
      review_id: reviewId,
      user_id: user.id,
      body: newComment.trim(),
    });
    if (!error) {
      setNewComment('');
      await fetchData();
    } else {
      setCommentError('Could not post comment. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading || !review) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#6C47FF22', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
            <Text style={{ color: '#6C47FF', fontWeight: '600' }}>
              {(review.profile.display_name ?? review.profile.username)[0].toUpperCase()}
            </Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: review.user_id })}>
              <Text style={{ color: '#fff', fontWeight: '500' }}>{review.profile.display_name ?? review.profile.username}</Text>
            </TouchableOpacity>
            <Text style={{ color: '#555', fontSize: 12, textTransform: 'capitalize' }}>{review.target_type}</Text>
          </View>
          {review.rating != null && (
            <Text style={{ color: '#6C47FF', fontWeight: '700', fontSize: 20, marginLeft: 'auto' }}>
              {review.rating.toFixed(1)}
            </Text>
          )}
        </View>

        {review.body ? (
          <Text style={{ color: '#ddd', fontSize: 16, lineHeight: 24, marginBottom: 24 }}>{review.body}</Text>
        ) : null}

        <Text style={{ color: '#555', fontSize: 12, marginBottom: 20 }}>
          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>

        <Text style={{ color: '#888', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Comments ({comments.length})
        </Text>

        {comments.map(c => (
          <View key={c.id} style={{ marginBottom: 14, paddingLeft: 10, borderLeftWidth: 1.5, borderLeftColor: '#2a2a2a' }}>
            <Text style={{ color: '#6C47FF', fontSize: 13, fontWeight: '500', marginBottom: 2 }}>
              {c.profile.display_name ?? c.profile.username}
            </Text>
            <Text style={{ color: '#ccc', fontSize: 14, lineHeight: 20 }}>{c.body}</Text>
          </View>
        ))}

        {commentError && (
          <View style={{
            marginTop: 8,
            backgroundColor: '#ff4d4d18',
            borderRadius: 8,
            borderWidth: 0.5,
            borderColor: '#ff4d4d44',
            padding: 10,
          }}>
            <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{commentError}</Text>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 12, borderTopWidth: 0.5, borderTopColor: '#1a1a1a', flexDirection: 'row', gap: 10 }}>
        <TextInput
          value={newComment}
          onChangeText={v => { setNewComment(v); setCommentError(null); }}
          placeholder="Add a comment..."
          placeholderTextColor="#444"
          style={{ flex: 1, backgroundColor: '#141414', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 14 }}
        />
        <TouchableOpacity
          onPress={submitComment}
          disabled={submitting || !newComment.trim()}
          style={{ backgroundColor: '#6C47FF', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Post</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
