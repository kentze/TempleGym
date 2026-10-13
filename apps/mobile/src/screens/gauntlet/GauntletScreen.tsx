import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import type { GauntletCurrentResponse, RankedGauntletEntry } from '@templegym/types';

export default function GauntletScreen() {
    const user = useAuthStore((s) => s.user);
    const insets = useSafeAreaInsets();

    const [data, setData] = useState<GauntletCurrentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const { data: res } = await api.get<GauntletCurrentResponse>('/gauntlet/current');

            setData(res);
        }
        catch {
            setError('Could not load the Gauntlet.');
        }
    }, []);

    useEffect(() => {
        (async() => {
            await fetchData();
            setLoading(false);
        })();
    }, [fetchData]);

    async function handleSubmit() {
        setError(null);

        const weightKg = parseFloat(weight);
        const repsNum = parseInt(reps, 10);

        if (isNaN(weightKg) || weightKg <= 0) {
            setError('Enter a valid weight.');

            return;
        }

        if (isNaN(repsNum) || repsNum <= 0) {
            setError('Enter a valid rep count.');

            return;
        }

        setSubmitting(true);

        try {
            await api.post('/gauntlet/entries', { weightKg, reps: repsNum });

            setWeight('');
            setReps('');

            await fetchData();
        }
        catch (e: any) {
            setError(e.response?.data?.error ?? 'Failed to submit. Try again.');
        }
        finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors.primary} />
            </View>
        );
    }

    if (!data?.cycle) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.center}>
                    <Text style={styles.emptyText}>
                        No active Gauntlet right now.
                    </Text>
                </View>
            </View>
        );
    }

    function renderEntry({ item }: { item: RankedGauntletEntry }) {
        const isMe = item.userId === user?.id;

        return (
            <View style={[styles.row, isMe && styles.rowHighlight]}>
                <Text style={styles.rank}>{item.rank}</Text>
                <Text style={styles.name} numberOfLines={1}>
                    {item.username}
                    {isMe ? ' (you)' : ''}
                </Text>
                <Text style={styles.score}>
                    {item.weightKg}kg x {item.reps}
                </Text>
            </View>
        );
    }

    return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <FlatList
            data={data.entries}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                <View style={styles.heading}>
                    <Text style={styles.headingText}>Gauntlet — {data.cycle.exercise}</Text>
                    <Text style={styles.headingMeta}>{data.cycle.label}</Text>

                    <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Weight (kg)"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="decimal-pad"
                        value={weight}
                        onChangeText={setWeight}
                    />
                <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={reps}
                    onChangeText={setReps}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? (
                    <ActivityIndicator color={Colors.text} />
                    ) : (
                    <Text style={styles.submitButtonText}>Submit Attempt</Text>
                    )}
                </TouchableOpacity>
                </View>
            </View>
            }
            renderItem={renderEntry}
            ListEmptyComponent={<Text style={styles.emptyText}>No entries yet this month.</Text>}
        />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  heading: { padding: 20, paddingBottom: 12, gap: 4 },
  headingText: { fontSize: 22, fontWeight: '700', color: Colors.text },
  headingMeta: { fontSize: 12, color: Colors.textMuted },
  form: { marginTop: 16, gap: 10 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
  },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitButtonText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  error: { color: Colors.error, fontSize: 13 },
  list: { gap: 8, paddingBottom: 24 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginHorizontal: 20,
  },
  rowHighlight: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  rank: { width: 28, fontSize: 14, fontWeight: '700', textAlign: 'center', color: Colors.text },
  name: { flex: 1, fontSize: 15, color: Colors.text },
  score: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});