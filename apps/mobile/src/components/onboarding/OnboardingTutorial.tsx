import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { useOnboardingStore, markOnboardingSeen } from '../../store/onboarding.store';

const PAGES = [
  {
    title: 'Welcome to TempleGym',
    body: 'Study Hard. Lift Harder. Track your workouts, earn points, and compete with other Temple students on the weekly leaderboard.',
  },
  {
    title: 'Log a workout',
    body: 'Start a Push, Pull, Legs, Cardio, or Full Body session from the Home screen. Add exercises and log your sets as you go.',
  },
  {
    title: 'Check in for bonus points',
    body: "When you're at the gym, enable GPS check-in in Settings. Verified sessions earn a +25 point bonus.",
  },
  {
    title: 'Points and tiers',
    body: 'Earn points for duration, weight lifted, and GPS check-in. Climb the weekly leaderboard through tiers, from Bronze all the way to Champion.',
  },
  {
    title: 'Track your progress',
    body: "History and Stats show your past sessions and how you're improving over time.",
  },
];

export default function OnboardingTutorial() {
  const visible = useOnboardingStore((s) => s.visible);
  const hide = useOnboardingStore((s) => s.hide);
  const userId = useAuthStore((s) => s.user?.id);
  const [pageIndex, setPageIndex] = useState(0);

  function finish() {
    if (userId) markOnboardingSeen(userId);
    hide();
    setPageIndex(0);
  }

  function next() {
    if (pageIndex === PAGES.length - 1) {
      finish();
    } else {
      setPageIndex((i) => i + 1);
    }
  }

  const page = PAGES[pageIndex];
  const isLastPage = pageIndex === PAGES.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.skip} onPress={finish}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.body}>{page.body}</Text>

          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i === pageIndex && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={next}>
            <Text style={styles.nextButtonText}>{isLastPage ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 16,
    width: '100%',
  },
  skip: { alignSelf: 'flex-end' },
  skipText: { color: Colors.textMuted, fontSize: 14 },
  title: { fontSize: 19, fontWeight: '700', color: Colors.text },
  body: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary },
  nextButton: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  nextButtonText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
});
