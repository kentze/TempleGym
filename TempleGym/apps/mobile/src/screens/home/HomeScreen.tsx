import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/colors";
//import NavBar from "../../components/navBar";
import Streak from "../../components/streak";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      {/* <Text style={styles.text}>Home Screen</Text> */}
      <Streak current={5} best={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  text: { color: Colors.textMuted, fontSize: 16 },
});
