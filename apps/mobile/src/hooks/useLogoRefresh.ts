import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export function useLogoRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const pulseRef    = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: true, tension: 200, friction: 12 }),
      ]).start(() => {
        pulseRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(logoScale, { toValue: 1.12, duration: 500, useNativeDriver: true }),
            Animated.timing(logoScale, { toValue: 0.93, duration: 500, useNativeDriver: true }),
          ]),
        );
        pulseRef.current.start();
      });
    } else {
      pulseRef.current?.stop();
      pulseRef.current = null;
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(logoScale,   { toValue: 0.7, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [refreshing]);

  async function onRefresh(fn: () => Promise<void>) {
    setRefreshing(true);
    await fn();
    setRefreshing(false);
  }

  return { refreshing, logoOpacity, logoScale, onRefresh };
}
