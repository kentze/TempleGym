import React from "react";

import { View, TextInput, Button, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <TextInput
        placeholder="Username"
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          width: "80%",
          paddingHorizontal: 10,
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          width: "80%",
          paddingHorizontal: 10,
        }}
      />
      <Button
        title="Login"
        onPress={() => {
          /* Handle login logic here */
        }}
      />
    </View>
  );
}
