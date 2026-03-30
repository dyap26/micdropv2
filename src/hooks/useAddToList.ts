import { useCallback } from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TargetType } from '../types';

export function useAddToList() {
  const { user } = useAuth();

  const addToList = useCallback(
    async (targetType: TargetType, targetId: string, targetName: string) => {
      if (!user) return;

      // Fetch user's lists
      const { data: lists, error } = await supabase
        .from('lists')
        .select('id, title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error || !lists?.length) {
        Alert.alert('No lists', 'Create a list first from your profile.');
        return;
      }

      const options = lists.map(l => l.title);

      const proceed = async (index: number) => {
        if (index < 0 || index >= lists.length) return;
        const list = lists[index];

        // Get current max position
        const { data: existing } = await supabase
          .from('list_items')
          .select('position')
          .eq('list_id', list.id)
          .order('position', { ascending: false })
          .limit(1);

        const nextPosition = existing?.length ? existing[0].position + 1 : 0;

        const { error: insertError } = await supabase.from('list_items').upsert(
          {
            list_id: list.id,
            target_type: targetType,
            target_id: targetId,
            position: nextPosition,
          },
          { onConflict: 'list_id,target_type,target_id' }
        );

        if (insertError) {
          Alert.alert('Error', 'Could not add to list.');
        } else {
          Alert.alert('Added', `"${targetName}" added to "${list.title}".`);
        }
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            title: `Add "${targetName}" to list`,
            options: [...options, 'Cancel'],
            cancelButtonIndex: options.length,
          },
          proceed
        );
      } else {
        // Android: simple Alert with button per list (up to 3, then truncate)
        const shown = lists.slice(0, 3);
        Alert.alert(
          `Add to list`,
          targetName,
          [
            ...shown.map((l, i) => ({ text: l.title, onPress: () => proceed(i) })),
            { text: 'Cancel', style: 'cancel' as const },
          ]
        );
      }
    },
    [user]
  );

  return { addToList };
}
