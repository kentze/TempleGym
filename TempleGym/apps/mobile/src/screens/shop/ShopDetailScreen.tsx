import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

// TODO: Implement in Phase 3
export default function ShopDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ShopDetail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  text:      { color: Colors.textMuted, fontSize: 16 },
});
