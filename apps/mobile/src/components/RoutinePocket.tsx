import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  // Nothing saved in the folder: show a dashed pocket with a message instead of the children
  empty?: boolean;
  children?: ReactNode;
}

// A U shape with no top line, hanging from the header of an open routine folder.
// Render it right under the header, and square off the header's bottom corners while it shows.
// Dashed when the folder is empty, solid when it holds routines.
export default function RoutinePocket({ empty, children }: Props) {
  if (empty) {
    return (
      <View style={[styles.pocket, styles.pocketEmpty]}>
        <Text style={styles.emptyText}>Saved workout is currently empty</Text>
      </View>
    );
  }
  return <View style={[styles.pocket, styles.pocketFilled]}>{children}</View>;
}

const styles = StyleSheet.create({
  pocket: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopWidth: 0,
    borderColor: Colors.border,
  },
  pocketEmpty: {
    minHeight: 170,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  pocketFilled: {
    borderWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  emptyText: { fontSize: 15, color: Colors.textMuted },
});
