import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList, List } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyLists'>;

export default function MyListsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLists = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setLists(data ?? []);
  }, [user]);

  useEffect(() => {
    fetchLists().finally(() => setLoading(false));
  }, [fetchLists]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  const confirmDelete = (list: List) => {
    Alert.alert(
      'Delete list',
      `Delete "${list.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('lists').delete().eq('id', list.id);
            setLists(prev => prev.filter(l => l.id !== list.id));
          },
        },
      ]
    );
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
      data={lists}
      keyExtractor={l => l.id}
      style={{ backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C47FF" />
      }
      ListHeaderComponent={
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateList')}
          style={{
            backgroundColor: '#6C47FF',
            borderRadius: 10,
            paddingVertical: 13,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>+ New list</Text>
        </TouchableOpacity>
      }
      ListEmptyComponent={
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 15 }}>No lists yet.</Text>
          <Text style={{ color: '#444', fontSize: 13, marginTop: 6 }}>
            Create a list to organise your music.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
          onLongPress={() => confirmDelete(item)}
          style={{
            backgroundColor: '#141414',
            borderRadius: 10,
            padding: 14,
            marginBottom: 10,
            borderWidth: 0.5,
            borderColor: '#222',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {item.title}
            </Text>
            {!item.is_public && (
              <View style={{
                backgroundColor: '#1f1f1f',
                borderRadius: 4,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}>
                <Text style={{ color: '#666', fontSize: 11 }}>Private</Text>
              </View>
            )}
          </View>
          {item.description ? (
            <Text style={{ color: '#777', fontSize: 13 }} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <Text style={{ color: '#444', fontSize: 12, marginTop: 6 }}>
            {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
