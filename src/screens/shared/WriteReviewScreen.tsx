import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'WriteReview'>;

const HALF_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function WriteReviewScreen({ route, navigation }: Props) {
  const { targetType, targetId, targetName } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === null && !body.trim()) {
      Alert.alert('Add a rating or text', 'A review needs at least a rating or some text.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').upsert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        rating,
        body: body.trim() || null,
        is_public: isPublic,
      }, { onConflict: 'user_id,target_type,target_id' });

      if (error) throw error;
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: '#888', fontSize: 13, textTransform: 'capitalize', marginBottom: 4 }}>
        {targetType}
      </Text>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 24 }}>
        {targetName}
      </Text>

      {/* Rating picker */}
      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 10 }}>Rating</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {HALF_STEPS.map(step => (
          <TouchableOpacity
            key={step}
            onPress={() => setRating(rating === step ? null : step)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: rating === step ? '#6C47FF' : '#2a2a2a',
              backgroundColor: rating === step ? '#6C47FF22' : '#141414',
            }}
          >
            <Text style={{ color: rating === step ? '#6C47FF' : '#888', fontWeight: '500' }}>
              {step.toFixed(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Text body */}
      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 10 }}>Review (optional)</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
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

      {/* Public toggle */}
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

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: '#6C47FF',
          borderRadius: 10,
          paddingVertical: 15,
          alignItems: 'center',
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
