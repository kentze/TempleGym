import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; //builds tab bar
import { NavigationContainer } from "@react-navigation/native";
import { Home, Plus, History } from "lucide-react-native"; //icons
import HomeScreen from "../screens/home/HomeScreen";

const Tab = createBottomTabNavigator();

// Dummy screens (replace with your real ones)
// function HomeScreen() {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text>Home</Text>
//     </View>
//   );
// }

function LogWorkoutScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Log Workout</Text>
    </View>
  );
}

function HistoryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>History</Text>
    </View>
  );
}

export default function BottomNav() {
  return (
    <NavigationContainer>
      {/* 
      //need this to manage navigation state and linking*/}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          },
          tabBarActiveTintColor: "#9333ea", // purple if on tab
          tabBarInactiveTintColor: "#6b7280", // gray if not
          tabBarIcon: ({ color, size }) => {
            //sets icons
            if (route.name === "Home") {
              return <Home color={color} size={size} />;
            }
            if (route.name === "Log") {
              return <Plus color={color} size={size} />;
            }
            if (route.name === "History") {
              return <History color={color} size={size} />;
            }
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Log" component={LogWorkoutScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
