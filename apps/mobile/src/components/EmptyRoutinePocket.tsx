import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

// A dashed U with no top line, hanging from the header of an empty routine folder.
// Render it right under the header, and square off the header's bottom corners while it shows.
export default function EmptyRoutinePocket() {
  return (
    <View style={styles.pocket}>
      <Text style={styles.text}>Saved workout is currently empty</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pocket: {
    minHeight: 170,
    alignItems: 'center',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingTop: 48,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  text: { fontSize: 15, color: Colors.textMuted },
});
