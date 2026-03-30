import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../lib/alert';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!profile) return;
    setError(null);
    setLoading(true);
    const { error: dbError } = await supabase.from('profiles').update({
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
    }).eq('id', profile.id);

    if (dbError) {
      setError('Could not save profile. Please try again.');
      setLoading(false);
    } else {
      await refreshProfile();
      navigation.goBack();
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>Display name</Text>
      <TextInput
        value={displayName}
        onChangeText={v => { setDisplayName(v); setError(null); }}
        placeholder="Your name"
        placeholderTextColor="#444"
        style={input}
      />

      <Text style={{ color: '#aaa', fontSize: 13, marginTop: 20, marginBottom: 8 }}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={v => { setBio(v); setError(null); }}
        placeholder="Tell people about your taste..."
        placeholderTextColor="#444"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[input, { minHeight: 100 }]}
      />

      {error && (
        <View style={{
          marginTop: 16,
          backgroundColor: '#ff4d4d18',
          borderRadius: 8,
          borderWidth: 0.5,
          borderColor: '#ff4d4d44',
          padding: 12,
        }}>
          <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        style={{
          marginTop: 28,
          backgroundColor: '#6C47FF',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Save</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const input = {
  backgroundColor: '#141414',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: '#fff' as const,
  fontSize: 15,
  borderWidth: 0.5,
  borderColor: '#2a2a2a',
};
