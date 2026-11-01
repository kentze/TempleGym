import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

// A pinned dropdown for picking one muscle group, or All. Render it as a direct child of the
// screen so the open menu can sit on top of the list below it.
export default function MuscleGroupFilter({ options, value, onChange }: Props) {
  const [open, setOpen]     = useState(false);
  const [barBottom, setBarBottom] = useState(0);

  function choose(option: string) {
    onChange(option);
    setOpen(false);
  }

  return (
    <>
      <View
        style={styles.bar}
        onLayout={(e) => setBarBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
      >
        <TouchableOpacity style={styles.button} onPress={() => setOpen((o) => !o)} activeOpacity={0.8}>
          <Text style={styles.label}>Muscle group</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{value}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      {open && (
        <>
          <Pressable style={[styles.backdrop, { top: barBottom }]} onPress={() => setOpen(false)} />
          <View style={[styles.menu, { top: barBottom - 4 }]}>
            <ScrollView bounces={false}>
              {['All', ...options].map((option) => (
                <TouchableOpacity key={option} style={styles.option} onPress={() => choose(option)}>
                  <Text style={[styles.optionText, option === value && styles.optionTextActive]}>
                    {option}
                  </Text>
                  {option === value && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
    zIndex: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: { fontSize: 13, color: Colors.textMuted },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontSize: 15, fontWeight: '600', color: Colors.text },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  menu: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxHeight: 340,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: { fontSize: 15, color: Colors.text },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },
});
