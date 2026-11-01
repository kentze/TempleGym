import { View, Text, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { GYMS, type GymId } from '../constants/gyms';

interface Props {
  value: string;
  onChange: (gymId: GymId) => void;
  style?: StyleProp<ViewStyle>;
}

// A small tab: City Campus on the left, Hillside Campus on the right
export default function GymTabs({ value, onChange, style }: Props) {
  return (
    <View style={[styles.box, style]}>
      {GYMS.map((gym) => {
        const active = value === gym.id;
        return (
          <TouchableOpacity
            key={gym.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(gym.id)}
            hitSlop={{ top: 8, bottom: 8 }}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{gym.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
});
