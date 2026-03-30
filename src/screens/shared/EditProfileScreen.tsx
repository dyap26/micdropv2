import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
    }).eq('id', profile.id);

    if (error) {
      Alert.alert('Error', 'Could not save profile.');
    } else {
      await refreshProfile();
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a' }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>Display name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor="#444"
        style={input}
      />

      <Text style={{ color: '#aaa', fontSize: 13, marginTop: 20, marginBottom: 8 }}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Tell people about your taste..."
        placeholderTextColor="#444"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[input, { minHeight: 100 }]}
      />

      <TouchableOpacity
        onPress={handleSave}
        disabled={loading}
        style={{ marginTop: 28, backgroundColor: '#6C47FF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' }}
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
