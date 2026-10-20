import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Pressable,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoLoader from '../../components/LogoLoader';
import LogoRefreshOverlay from '../../components/LogoRefreshOverlay';
import { useLogoRefresh } from '../../hooks/useLogoRefresh';
import { cleanWeightInput, cleanRepsInput } from '../../utils/numberInput';
import { Colors } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import type { GauntletCurrentResponse, RankedGauntletEntry } from '@templegym/types';

// After a submit, the page refresh is shown for at least this long, so the student can see it happen.
const SUBMIT_REFRESH_MS = 800;

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Same medal colors as the weekly Board: gold, silver and bronze for the top 3, plain after that.
function rankColor(rank: number): string {
    if (rank === 1)
        return Colors.gold;

    if (rank === 2)
        return Colors.silver;

    if (rank === 3)
        return Colors.bronze;

    return Colors.text;
}

function formatScore(weightKg: number | null, reps: number): string {
    if (weightKg === null)
        return `${reps} reps`;

    return `${weightKg}kg x ${reps}`;
}

export default function GauntletScreen() {
    const user = useAuthStore((s) => s.user);
    const insets = useSafeAreaInsets();

    const { refreshing, logoOpacity, logoScale, onRefresh } = useLogoRefresh();

    const [data, setData] = useState<GauntletCurrentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [infoVisible, setInfoVisible] = useState(false);
    const [submitVisible, setSubmitVisible] = useState(false);

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

    function handleRefresh() {
        setError(null);
        setSuccess(null);

        return onRefresh(fetchData);
    }

    function openSubmitCard() {
        setError(null);
        setSuccess(null);
        setSubmitVisible(true);
    }

    function closeSubmitCard() {
        Keyboard.dismiss();
        setError(null);
        setSubmitVisible(false);
    }

    async function handleSubmit() {
        setError(null);
        setSuccess(null);

        if (!data?.cycle)
            return;

        const minReps = data.cycle.minReps;
        const repsNum = parseInt(reps, 10);
        let weightKg: number | undefined = undefined;

        if (data.cycle.requiresWeight) {
            weightKg = parseFloat(weight);

            if (isNaN(weightKg) || weightKg <= 0) {
                setError('Enter a valid weight.');

                return;
            }
        }

        if (isNaN(repsNum) || repsNum < minReps) {
            setError(`Reps must be at least ${minReps}.`);

            return;
        }

        setSubmitting(true);

        try {
            await api.post('/gauntlet/entries', { weightKg, reps: repsNum });

            setWeight('');
            setReps('');
            setSubmitVisible(false);

            // Show the logo loader for a moment so the student can see the page refresh.
            const startedAt = Date.now();
            setLoading(true);
            await fetchData();

            // Only wait for the time still missing, so a slow connection is not made slower.
            const elapsed = Date.now() - startedAt;

            if (elapsed < SUBMIT_REFRESH_MS)
                await wait(SUBMIT_REFRESH_MS - elapsed);

            setLoading(false);

            setSuccess(`Attempt submitted: ${formatScore(weightKg ?? null, repsNum)}`);
        }
        catch (e: any) {
            // The rules may have changed since this screen opened, so load them again.
            await fetchData();

            setError(e.response?.data?.error ?? 'Failed to submit. Try again.');
        }
        finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <LogoLoader />;
    }

    // Either the first load failed (no data at all) or there is no active Gauntlet.
    // Both can be pulled down to refresh, so a student never has to leave the tab.
    if (!data || !data.cycle) {
        const loadFailed = !data;

        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScrollView
                    contentContainerStyle={styles.emptyScroll}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="transparent"
                            colors={['transparent']}
                        />
                    }
                >
                    <Text style={loadFailed ? styles.errorText : styles.emptyText}>
                        {loadFailed ? (error ?? 'Could not load the Gauntlet.') : 'No active Gauntlet right now.'}
                    </Text>

                    {loadFailed ? (
                        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                            <Text style={styles.retryText}>Try again</Text>
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>
                <LogoRefreshOverlay opacity={logoOpacity} scale={logoScale} top={insets.top + 6} />
            </View>
        );
    }

    function renderEntry({ item }: { item: RankedGauntletEntry }) {
        const isMe = item.userId === user?.id;

        // The row shown after the top entries (the student's own row when they are lower)
        // keeps the plain style, with no medal colors.
        const isBelowTop = data?.myRank?.userId === item.userId;
        const color = rankColor(item.rank);

        return (
            <View
                key={item.userId}
                style={[
                    styles.row,
                    isBelowTop && styles.rowBelowTop,
                    isMe && styles.rowHighlight,
                    item.rank <= 3 && { borderColor: color + '60' },
                ]}
            >
                <Text style={[styles.rank, isBelowTop && styles.rankBig, !isBelowTop && { color }]}>{item.rank}</Text>
                <Text style={[styles.name, isBelowTop && styles.nameBig]} numberOfLines={1}>
                    {item.username}
                    {isMe ? ' (you)' : ''}
                </Text>
                <Text style={[styles.score, isBelowTop && styles.scoreBig, !isBelowTop && { color }]}>
                    {formatScore(item.weightKg, item.reps)}
                </Text>
            </View>
        );
    }

    // The explanation card follows this month's rules.
    const whoWins = data.cycle.requiresWeight
        ? 'The heaviest weight wins. If two lifts are the same weight, more reps wins. Still tied? Whoever submitted first wins.'
        : 'The most reps wins. If two students tie, whoever submitted first wins.';

    const howToSubmit = data.cycle.requiresWeight
        ? 'Tap Submit Attempt at the bottom, enter your weight in kg and your reps, then submit. Your best attempt is the one that counts on the board.'
        : 'Tap Submit Attempt at the bottom, enter your reps, then submit. Your best attempt is the one that counts on the board.';

    // A bullet with its own column, so a long line wraps under the text and not under the dot.
    function renderBullet(text: string) {
        return (
            <View style={styles.bulletRow}>
                <Text style={styles.modalBody}>•</Text>
                <Text style={[styles.modalBody, styles.bulletText]}>{text}</Text>
            </View>
        );
    }

    return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="transparent"
                    colors={['transparent']}
                />
            }
        >
            <View style={styles.heading}>
                <View style={styles.titleRow}>
                    <Text style={styles.headingText}>Gauntlet — {data.cycle.exercise}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            // The keyboard would otherwise stay up over the card and hide "Got it".
                            Keyboard.dismiss();
                            setInfoVisible(true);
                        }}
                        hitSlop={8}
                    >
                        <View style={styles.infoBtn}>
                            <Text style={styles.infoBtnText}>?</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Text style={styles.headingMeta}>Month: {data.cycle.label}</Text>
                <Text style={styles.headingMeta}>•  Minimum reps: {data.cycle.minReps}</Text>
                <Text style={styles.headingMeta}>•  Attempts used: {data.myEntryCount} of {data.maxEntries}</Text>
                {success ? <Text style={styles.success}>{success}</Text> : null}
                {error && !submitVisible ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            {/* The standing: the top entries, then the student's own row if they are ranked below them. */}
            <View style={styles.board}>
                {data.entries.length === 0 ? (
                    <Text style={styles.emptyText}>No entries yet this month.</Text>
                ) : null}

                {data.entries.map((item) => renderEntry({ item }))}

                {data.myRank ? renderEntry({ item: data.myRank }) : null}
            </View>
        </ScrollView>
        <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.submitButton} onPress={openSubmitCard}>
                <Text style={styles.submitButtonText}>Submit Attempt</Text>
            </TouchableOpacity>
        </View>

        <LogoRefreshOverlay opacity={logoOpacity} scale={logoScale} top={insets.top + 6} />

        <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
            <View style={styles.modalOverlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setInfoVisible(false)} />

                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>The Gauntlet</Text>

                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <Text style={styles.modalSection}>What is a Gauntlet?</Text>
                        <Text style={styles.modalBody}>
                            A monthly strength challenge for everyone on TempleGym. Each month the whole app
                            competes on one lift. This month it is {data.cycle.exercise}.
                        </Text>

                        <Text style={styles.modalSection}>How it works</Text>
                        {renderBullet(whoWins)}
                        {renderBullet(`Each attempt needs at least ${data.cycle.minReps} reps to count.`)}
                        {renderBullet(`You get up to ${data.maxEntries} attempts this month, and only your best one counts.`)}
                        {renderBullet('The board shows the leaders, plus your own rank if you are below them.')}

                        <Text style={styles.modalSection}>How to submit</Text>
                        <Text style={styles.modalBody}>{howToSubmit}</Text>

                        <Text style={styles.modalSection}>Win prizes</Text>
                        <Text style={styles.modalBody}>
                            When the month ends, the student in 1st place wins a gift card from the club,
                            sent to their Temple email.
                        </Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.modalClose} onPress={() => setInfoVisible(false)}>
                        <Text style={styles.modalCloseText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        <Modal visible={submitVisible} transparent animationType="fade" onRequestClose={closeSubmitCard}>
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={closeSubmitCard} />

                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Submit an attempt</Text>

                    {data.cycle.requiresWeight ? (
                        <TextInput
                            style={[styles.input, styles.modalInput]}
                            placeholder="Weight (kg)"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="decimal-pad"
                            value={weight}
                            onChangeText={(text) => setWeight(cleanWeightInput(text))}
                        />
                    ) : null}

                    <TextInput
                        style={[styles.input, styles.modalInput]}
                        placeholder="Reps"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                        value={reps}
                        onChangeText={(text) => setReps(cleanRepsInput(text))}
                    />

                    {/* Placeholder only: the video upload to S3 is not built yet, so this does nothing. */}
                    <View style={styles.videoBox}>
                        <Ionicons name="videocam-outline" size={22} color={Colors.textMuted} />
                        <View style={styles.videoTextWrap}>
                            <Text style={styles.videoTitle}>Video of your attempt</Text>
                            <Text style={styles.videoHint}>Video upload is coming soon.</Text>
                        </View>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <ActivityIndicator color={Colors.text} />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={closeSubmitCard}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyScroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  heading: { padding: 20, paddingBottom: 12, gap: 4 },
  headingText: { fontSize: 22, fontWeight: '700', color: Colors.text },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  headingMeta: { fontSize: 15, color: Colors.textMuted },
  infoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.surfaceDeep + '99',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 12,
    width: '100%',
    maxHeight: '85%',
  },
  modalScroll: { gap: 8 },
  modalTitle: { fontSize: 19, fontWeight: '700', color: Colors.text },
  modalSection: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 6 },
  modalBody: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bulletText: { flex: 1 },
  modalClose: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  modalCloseText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: Colors.text,
    fontSize: 15,
    letterSpacing: 0,
  },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitButtonText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  bottomBar: { padding: 16, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  modalInput: { backgroundColor: Colors.background },
  videoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    opacity: 0.7,
  },
  videoTextWrap: { flex: 1, gap: 2 },
  videoTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  videoHint: { fontSize: 12, color: Colors.textMuted },
  cancelButton: { alignItems: 'center', paddingVertical: 6 },
  cancelText: { color: Colors.textMuted, fontSize: 14 },
  error: { color: Colors.error, fontSize: 13 },
  success: { color: Colors.success, fontSize: 13 },
  board: { gap: 8, paddingBottom: 12 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  errorText: { color: Colors.error, textAlign: 'center' },
  retryButton: { paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { color: Colors.primary, fontSize: 14 },
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
    marginHorizontal: 16,
  },
  // The row shown below the top entries is a bit taller than the rest, with larger text.
  rowBelowTop: { paddingVertical: 14 },
  rowHighlight: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  rank: { width: 28, fontSize: 14, fontWeight: '700', textAlign: 'center', color: Colors.text },
  rankBig: { width: 36, fontSize: 17 },
  name: { flex: 1, fontSize: 15, color: Colors.text },
  nameBig: { fontSize: 18 },
  score: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  scoreBig: { fontSize: 17 },
});