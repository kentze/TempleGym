import { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { GYMS, type GymId } from '../constants/gyms';

interface Props {
  value: string;
  onChange: (gymId: GymId) => void;
  style?: StyleProp<ViewStyle>;
}

// The highlight stretches when it moves: the edge that leads arrives first and the
// edge that trails catches up later, so it flows from one tab to the other.
const LEAD_MS  = 360;
const TRAIL_MS = 600;
const easing   = Easing.out(Easing.cubic);

interface TabLayout { x: number; width: number }

// A small tab: City Campus on the left, Hillside Campus on the right
export default function GymTabs({ value, onChange, style }: Props) {
  const activeIndex = Math.max(0, GYMS.findIndex((g) => g.id === value));

  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const [left]     = useState(() => new Animated.Value(0));
  const [right]    = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(activeIndex)); // 0 = first gym, 1 = second
  const placed     = useRef(false);
  const prevIndex  = useRef(activeIndex);

  const ready = GYMS.every((g) => layouts[g.id]);

  useEffect(() => {
    if (!ready) return;
    const target  = layouts[GYMS[activeIndex].id];
    const toLeft  = target.x;
    const toRight = target.x + target.width;

    // First time we know where the tabs are, just put the highlight in place
    if (!placed.current) {
      left.setValue(toLeft);
      right.setValue(toRight);
      progress.setValue(activeIndex);
      placed.current = true;
      prevIndex.current = activeIndex;
      return;
    }

    const movingRight = activeIndex > prevIndex.current;
    prevIndex.current = activeIndex;
    const lead  = { duration: LEAD_MS,  easing, useNativeDriver: false };
    const trail = { duration: TRAIL_MS, easing, useNativeDriver: false };

    Animated.parallel([
      Animated.timing(right,    { toValue: toRight, ...(movingRight ? lead : trail) }),
      Animated.timing(left,     { toValue: toLeft,  ...(movingRight ? trail : lead) }),
      Animated.timing(progress, { toValue: activeIndex, ...trail }),
    ]).start();
  }, [activeIndex, ready, layouts]);

  function handleLayout(id: string, x: number, width: number) {
    setLayouts((prev) =>
      prev[id]?.x === x && prev[id]?.width === width ? prev : { ...prev, [id]: { x, width } },
    );
  }

  return (
    <View style={[styles.box, style]}>
      <View style={styles.track}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.highlight,
            { left, width: Animated.subtract(right, left), opacity: ready ? 1 : 0 },
          ]}
        />
        {GYMS.map((gym, index) => {
          const color = progress.interpolate({
            inputRange: [0, 1],
            outputRange: index === 0
              ? [Colors.text, Colors.textMuted]
              : [Colors.textMuted, Colors.text],
          });
          return (
            <TouchableOpacity
              key={gym.id}
              style={styles.tab}
              onPress={() => onChange(gym.id)}
              onLayout={(e) => handleLayout(gym.id, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
              hitSlop={{ top: 8, bottom: 8 }}
              activeOpacity={0.8}
            >
              <Animated.Text style={[styles.tabText, { color }]}>{gym.name}</Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  track: {
    flexDirection: 'row',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
