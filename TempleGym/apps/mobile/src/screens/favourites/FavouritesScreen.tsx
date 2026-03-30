import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { api } from '../../services/api';
import type { Exercise } from '@templegym/types';

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const [favourites, setFavourites] = useState<Exercise[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving]     = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const fetchFavourites = useCallback(async () => {
    try {
      const { data } = await api.get<Exercise[]>('/me/favourites');
      setFavourites(data);
      setError(null);
    } catch {
      setError('Could not load favourites.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchFavourites();
      setLoading(false);
    })();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchFavourites();
    setRefreshing(false);
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    const previous = favourites;
    setFavourites((prev) => prev.filter((f) => f.id !== id));
    try {
      await api.delete(`/me/favourites/${id}`);
    } catch {
      setFavourites(previous);
      setError('Failed to remove. Try again.');
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (error && favourites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.heading}>Favourites</Text>
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No favourites yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.meta}>
                <View style={[styles.badge, item.category === 'PUSH' ? styles.badgePush : styles.badgePull]}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
                <Text style={styles.muscles}>{item.muscleGroups.join(', ')}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRemove(item.id)}
              disabled={removing === item.id}
              style={styles.removeButton}
            >
              {removing === item.id
                ? <ActivityIndicator color={Colors.error} size="small" />
                : <Text style={styles.removeText}>Remove</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  center:       { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  heading:      { fontSize: 22, fontWeight: '700', color: Colors.text, padding: 20, paddingBottom: 12 },
  inlineError:  { color: Colors.error, fontSize: 13, textAlign: 'center', marginBottom: 8 },
  errorText:    { color: Colors.error, textAlign: 'center' },
  retryButton:  { paddingHorizontal: 20, paddingVertical: 8 },
  retryText:    { color: Colors.primary, fontSize: 14 },
  list:         { paddingHorizontal: 16, gap: 10 },
  emptyText:    { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  row:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 12 },
  rowInfo:      { flex: 1, gap: 6 },
  name:         { fontSize: 15, fontWeight: '600', color: Colors.text },
  meta:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:        { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgePush:    { backgroundColor: `${Colors.primary}30` },
  badgePull:    { backgroundColor: `${Colors.gold}20` },
  badgeText:    { fontSize: 10, fontWeight: '700', color: Colors.text },
  muscles:      { fontSize: 12, color: Colors.textMuted },
  removeButton: { paddingHorizontal: 10, paddingVertical: 6 },
  removeText:   { color: Colors.error, fontSize: 13 },
});
