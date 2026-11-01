import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { GYMS, type GymId } from '../constants/gyms';

interface Props {
  value: string;
  onChange: (gymId: GymId) => void;
}

// City Campus on the left, Hillside Campus on the right
export default function GymTabs({ value, onChange }: Props) {
  return (
    <View style={styles.box}>
      {GYMS.map((gym) => {
        const active = value === gym.id;
        return (
          <TouchableOpacity
            key={gym.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(gym.id)}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
});
