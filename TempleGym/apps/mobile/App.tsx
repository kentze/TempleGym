// import 'react-native-gesture-handler';
// import React from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// //import RootNavigator from './src/navigation/RootNavigator';

// export default function App() {
//   return (

//     <SafeAreaProvider>
//       <StatusBar style="light" />

//       {/* <RootNavigator /> */}
//     </SafeAreaProvider>
//   );
// }

import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; //builds tab bar
import { NavigationContainer } from "@react-navigation/native";
import { Home, Plus, History } from "lucide-react-native";

import NavBar from "./src/components/navBar";
//import Streak from "./src/components/streak";

export default function App() {
  return (
    // <View>
    //   {/* <Streak current={5} best={10} /> */}
    //   <NavBar />
    // </View>
    <NavBar />
  );
}
