import { View, Text, TouchableOpacity, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { TRAINING_AREAS } from '../constants/trainingAreas';
import { suggestedArea } from '../constants/tips';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// The help popup on Home: what each training area covers, with today's suggested area tagged.
export default function TrainingAreasModal({ visible, onClose }: Props) {
  const today = suggestedArea(new Date());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Training Areas</Text>
            <Text style={styles.subtitle}>What each area covers</Text>
          </View>

          <View style={styles.list}>
            {TRAINING_AREAS.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.chip}>
                  <Ionicons name={item.icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.id === today && (
                      <View style={styles.todayTag}>
                        <Text style={styles.todayTagText}>Today</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.note}>
            <Ionicons name="bulb-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.noteText}>
              The suggestion rotates daily through Upper Body, Lower Body and Cardio.
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22,
    gap: 18,
  },
  header: { gap: 2 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  list: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text },
  description: { fontSize: 13, lineHeight: 18, color: Colors.textMuted },
  todayTag: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  todayTagText: { fontSize: 11, fontWeight: '700', color: Colors.text },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.textMuted },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '700', color: Colors.text },
});
