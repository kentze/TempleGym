import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { tipContent } from '../constants/tips';
import { useTipStore } from '../store/tip.store';

const SWITCH_EVERY_MS = 10_000;
const FADE_MS = 250;

// The tip on Home. Every 10 seconds it fades to the next one: the day suggestion and the workout facts.
export default function TipCard() {
  const order   = useTipStore((s) => s.order);
  const focused = useIsFocused();

  const [index, setIndex] = useState(0);
  const [opacity]         = useState(() => new Animated.Value(1));

  // Only tick while Home is on screen, so the card is not working in the background
  useEffect(() => {
    if (!focused) return;
    const id = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % order.length);
        Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
      });
    }, SWITCH_EVERY_MS);
    return () => {
      clearInterval(id);
      opacity.stopAnimation();
      opacity.setValue(1);
    };
  }, [focused, order.length]);

  const tip = tipContent(order[index % order.length], new Date());

  return (
    <View style={styles.card}>
      <Ionicons name="bulb-outline" size={24} color={Colors.textMuted} />
      <Animated.Text style={[styles.text, { opacity }]}>
        <Text style={styles.lead}>{tip.lead} </Text>
        {tip.body}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 104,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  text: { flex: 1, fontSize: 15, lineHeight: 22, color: Colors.textMuted },
  lead: { fontWeight: '700', color: Colors.text },
});
