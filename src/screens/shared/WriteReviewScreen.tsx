import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'WriteReview'>;

function StarRating({
  rating,
  onChange,
}: {
  rating: number | null;
  onChange: (r: number | null) => void;
}) {
  const stars = [1, 2, 3, 4, 5];

  const getStarFill = (star: number): 'full' | 'half' | 'empty' => {
    if (rating === null) return 'empty';
    if (rating >= star) return 'full';
    if (rating >= star - 0.5) return 'half';
    return 'empty';
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 28 }}>
      {stars.map(star => {
        const fill = getStarFill(star);
        return (
          <View key={star} style={{ flexDirection: 'row', width: 44, height: 44 }}>
            {/* Left half — half star */}
            <TouchableOpacity
              onPress={() => {
                const val = star - 0.5;
                onChange(rating === val ? null : val);
              }}
              style={{ width: 22, height: 44, justifyContent: 'center', overflow: 'hidden' }}
            >
              <Text style={{
                fontSize: 40,
                color: fill === 'empty' ? '#2a2a2a' : '#6C47FF',
                lineHeight: 44,
                marginLeft: 0,
              }}>
                {fill === 'empty' ? '☆' : '★'}
              </Text>
            </TouchableOpacity>
            {/* Right half — full star */}
            <TouchableOpacity
              onPress={() => {
                onChange(rating === star ? null : star);
              }}
              style={{ width: 22, height: 44, justifyContent: 'center', overflow: 'hidden' }}
            >
              <Text style={{
                fontSize: 40,
                color: fill === 'full' ? '#6C47FF' : '#2a2a2a',
                lineHeight: 44,
                marginLeft: -22,
              }}>
                {fill === 'full' ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
      {rating !== null && (
        <Text style={{ color: '#6C47FF', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

export default function WriteReviewScreen({ route, navigation }: Props) {
  const { targetType, targetId, targetName } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === null && !body.trim()) {
      setError('Add a star rating or write something — a review needs at least one.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: dbError } = await supabase.from('reviews').upsert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        rating,
        body: body.trim() || null,
        is_public: isPublic,
      }, { onConflict: 'user_id,target_type,target_id' });

      if (dbError) throw dbError;
      navigation.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Could not save review. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>
        Album
      </Text>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 28 }}>
        {targetName}
      </Text>

      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>Your rating</Text>
      <StarRating rating={rating} onChange={r => { setRating(r); setError(null); }} />

      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 10 }}>Review (optional)</Text>
      <TextInput
        value={body}
        onChangeText={v => { setBody(v); setError(null); }}
        placeholder="What did you think?"
        placeholderTextColor="#444"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        style={{
          backgroundColor: '#141414',
          borderRadius: 10,
          padding: 14,
          color: '#fff',
          fontSize: 15,
          borderWidth: 0.5,
          borderColor: '#2a2a2a',
          minHeight: 120,
          marginBottom: 24,
        }}
      />

      {error && (
        <View style={{
          marginBottom: 16,
          backgroundColor: '#ff4d4d18',
          borderRadius: 8,
          borderWidth: 0.5,
          borderColor: '#ff4d4d44',
          padding: 12,
        }}>
          <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 15 }}>Public</Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
            {isPublic ? 'Visible to everyone' : 'Only visible to you'}
          </Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: '#2a2a2a', true: '#6C47FF' }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: '#6C47FF',
          borderRadius: 10,
          paddingVertical: 15,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Save review</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}