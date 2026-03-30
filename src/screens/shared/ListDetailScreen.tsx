import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, List, ListItem } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { showConfirm } from '../../lib/alert';

type Props = NativeStackScreenProps<HomeStackParamList, 'ListDetail'>;

interface EnrichedItem extends ListItem {
  name: string;
  subtitle: string;
}

async function enrichItems(items: ListItem[]): Promise<EnrichedItem[]> {
  const albumIds = items.filter(i => i.target_type === 'album').map(i => i.target_id);
  const trackIds = items.filter(i => i.target_type === 'track').map(i => i.target_id);
  const artistIds = items.filter(i => i.target_type === 'artist').map(i => i.target_id);

  const [albumsRes, tracksRes, artistsRes] = await Promise.all([
    albumIds.length ? supabase.from('albums').select('id, title, artist_id').in('id', albumIds) : Promise.resolve({ data: [] }),
    trackIds.length ? supabase.from('tracks').select('id, title, artist_id').in('id', trackIds) : Promise.resolve({ data: [] }),
    artistIds.length ? supabase.from('artists').select('id, name').in('id', artistIds) : Promise.resolve({ data: [] }),
  ]);

  const artistNames: Record<string, string> = {};
  for (const a of (artistsRes.data ?? [])) artistNames[a.id] = a.name;

  const allArtistIds = [
    ...(albumsRes.data ?? []).map((a: any) => a.artist_id),
    ...(tracksRes.data ?? []).map((t: any) => t.artist_id),
  ].filter(Boolean);

  if (allArtistIds.length) {
    const { data: moreArtists } = await supabase.from('artists').select('id, name').in('id', allArtistIds);
    for (const a of (moreArtists ?? [])) artistNames[a.id] = a.name;
  }

  const albumMap = Object.fromEntries((albumsRes.data ?? []).map((a: any) => [a.id, a]));
  const trackMap = Object.fromEntries((tracksRes.data ?? []).map((t: any) => [t.id, t]));

  return items.map(item => {
    if (item.target_type === 'album') {
      const a = albumMap[item.target_id];
      return { ...item, name: a?.title ?? item.target_id, subtitle: artistNames[a?.artist_id] ?? '' };
    }
    if (item.target_type === 'track') {
      const t = trackMap[item.target_id];
      return { ...item, name: t?.title ?? item.target_id, subtitle: artistNames[t?.artist_id] ?? '' };
    }
    return { ...item, name: artistNames[item.target_id] ?? item.target_id, subtitle: 'Artist' };
  });
}

export default function ListDetailScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const { user } = useAuth();
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchList = useCallback(async () => {
    const [listRes, itemsRes] = await Promise.all([
      supabase.from('lists').select('*').eq('id', listId).single(),
      supabase.from('list_items').select('*').eq('list_id', listId).order('position'),
    ]);
    setList(listRes.data);
    if (itemsRes.data?.length) {
      const enriched = await enrichItems(itemsRes.data);
      setItems(enriched);
    } else {
      setItems([]);
    }
  }, [listId]);

  useEffect(() => {
    fetchList().finally(() => setLoading(false));
  }, [fetchList]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchList();
    setRefreshing(false);
  };

  const removeItem = (item: EnrichedItem) => {
    showConfirm({
      title: 'Remove item',
      message: `Remove "${item.name}" from this list?`,
      confirmText: 'Remove',
      onConfirm: async () => {
        await supabase.from('list_items').delete().eq('id', item.id);
        setItems(prev => prev.filter(i => i.id !== item.id));
      },
    });
  };

  const navigateToTarget = (item: EnrichedItem) => {
    if (item.target_type === 'album') navigation.navigate('AlbumDetail', { id: item.target_id });
    else if (item.target_type === 'track') navigation.navigate('TrackDetail', { id: item.target_id });
    else navigation.navigate('ArtistDetail', { id: item.target_id });
  };

  const isOwner = user?.id === list?.user_id;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6C47FF" />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#555' }}>List not found.</Text>
      </View>
    );
  }

  const typeIcon = (type: string) => type === 'album' ? '◼' : type === 'track' ? '♪' : '●';

  return (
    <FlatList
      data={items}
      keyExtractor={i => i.id}
      style={{ backgroundColor: '#0a0a0a' }}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C47FF" />}
      ListHeaderComponent={
        <View style={{ padding: 20, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
            <Text style={{ flex: 1, color: '#fff', fontSize: 22, fontWeight: '700' }}>{list.title}</Text>
            {!list.is_public && (
              <View style={{ backgroundColor: '#1f1f1f', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, marginLeft: 10 }}>
                <Text style={{ color: '#666', fontSize: 11 }}>Private</Text>
              </View>
            )}
          </View>
          {list.description ? (
            <Text style={{ color: '#777', fontSize: 14, lineHeight: 20, marginBottom: 8 }}>{list.description}</Text>
          ) : null}
          <Text style={{ color: '#444', fontSize: 12 }}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 15 }}>No items yet.</Text>
          {isOwner && (
            <Text style={{ color: '#444', fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
              Open any album, track, or artist page and add it to this list.
            </Text>
          )}
        </View>
      }
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => navigateToTarget(item)}
          onLongPress={() => isOwner && removeItem(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderBottomWidth: 0.5,
            borderBottomColor: '#1a1a1a',
          }}
        >
          <Text style={{ color: '#444', fontSize: 13, width: 28 }}>{index + 1}</Text>
          <Text style={{ color: '#6C47FF', fontSize: 12, width: 22 }}>{typeIcon(item.target_type)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>{item.name}</Text>
            {item.subtitle ? <Text style={{ color: '#666', fontSize: 12, marginTop: 1 }} numberOfLines={1}>{item.subtitle}</Text> : null}
            {item.note ? <Text style={{ color: '#555', fontSize: 12, fontStyle: 'italic', marginTop: 2 }} numberOfLines={1}>{item.note}</Text> : null}
          </View>
          <Text style={{ color: '#333', fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      )}
    />
  );
}
