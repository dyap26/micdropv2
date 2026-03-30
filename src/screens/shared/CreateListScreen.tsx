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
import { ProfileStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CreateList'>;

export default function CreateListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Name required', 'Give your list a title.');
      return;
    }
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('lists')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error || !data) {
      Alert.alert('Error', 'Could not create list.');
      setLoading(false);
      return;
    }

    // Navigate directly to the new list
    navigation.replace('ListDetail', { listId: data.id });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Best albums of 2024"
        placeholderTextColor="#444"
        autoFocus
        style={input}
      />

      <Text style={{ color: '#aaa', fontSize: 13, marginTop: 20, marginBottom: 8 }}>
        Description (optional)
      </Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="What's this list about?"
        placeholderTextColor="#444"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[input, { minHeight: 100 }]}
      />

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 28,
        marginBottom: 32,
      }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 15 }}>Public</Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
            {isPublic ? 'Anyone can see this list' : 'Only visible to you'}
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
        onPress={handleCreate}
        disabled={loading || !title.trim()}
        style={{
          backgroundColor: title.trim() ? '#6C47FF' : '#2a2a2a',
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: title.trim() ? '#fff' : '#555', fontWeight: '600', fontSize: 15 }}>
            Create list
          </Text>
        )}
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
