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
import { Colors } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import type { LeaderboardResponse, LeaderboardEntry } from '@templegym/types';

function formatReset(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export default function LeaderboardScreen() {
  const user = useAuthStore((s) => s.user);

  const [data, setData]           = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await api.get<LeaderboardResponse>('/leaderboard/weekly');
      setData(res);
      setError(null);
    } catch {
      setError('Could not load leaderboard.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchData();
      setLoading(false);
    })();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'No data.'}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const myRank    = data.myRank;
  const isVisible = myRank ? data.entries.some((e) => e.userId === user?.id) : false;

  function renderEntry({ item }: { item: LeaderboardEntry }) {
    const isMe = item.userId === user?.id;
    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <Text style={[styles.rank, item.rank <= 3 && styles.rankTop]}>{item.rank}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {item.displayName ?? 'Anonymous'}
          {isMe ? ' (you)' : ''}
        </Text>
        <Text style={styles.score}>{item.weeklyScore} pts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.headingText}>Weekly Board</Text>
        <Text style={styles.headingMeta}>{data.week} · resets {formatReset(data.resetAt)}</Text>
      </View>

      <FlatList
        data={data.entries}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        renderItem={renderEntry}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet this week.</Text>}
      />

      {myRank && !isVisible && (
        <View style={styles.stickyFooter}>
          <Text style={styles.stickyText}>
            You — Rank {myRank.rank} — {myRank.weeklyScore} pts
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  center:       { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  heading:      { padding: 20, paddingBottom: 12, gap: 4 },
  headingText:  { fontSize: 22, fontWeight: '700', color: Colors.text },
  headingMeta:  { fontSize: 12, color: Colors.textMuted },
  list:         { paddingHorizontal: 16, gap: 8 },
  emptyText:    { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  errorText:    { color: Colors.error, textAlign: 'center' },
  retryButton:  { paddingHorizontal: 20, paddingVertical: 8 },
  retryText:    { color: Colors.primary, fontSize: 14 },
  row:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingVertical: 12, paddingHorizontal: 14, gap: 12 },
  rowHighlight: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  rank:         { width: 28, fontSize: 14, fontWeight: '700', color: Colors.textMuted, textAlign: 'center' },
  rankTop:      { color: Colors.gold },
  name:         { flex: 1, fontSize: 15, color: Colors.text },
  score:        { fontSize: 14, fontWeight: '600', color: Colors.primary },
  stickyFooter: { borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.primaryFaded, padding: 14, alignItems: 'center' },
  stickyText:   { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
