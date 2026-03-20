import { Flame } from "lucide-react-native";
import { View, Text } from "react-native";

interface StreakProps {
  current: number;
  best: number;
}

export default function Streak({ current, best }: StreakProps) {
  return (
    <View
      style={{
        backgroundColor: "#fce7f3",
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 14,
        marginTop: 20,
        justifyContent: "center",
        minHeight: 120,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* card heading */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "400", fontSize: 16, color: "#070509ff" }}>
          Workout Streak
        </Text>
        <Flame size={20} color="#f26209ff" />
      </View>
      {/* card content */}
      <View style={{ flexDirection: "row", gap: 20 }}>
        {/* new streak */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#f97316" }}
            >
              {current}
            </Text>
            <Text style={{ marginLeft: 4, color: "#6b7280" }}>days</Text>
          </View>
          <Text style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>
            Current Streak
          </Text>
        </View>
        {/* best streak */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#9333ea" }}
            >
              {best}
            </Text>
            <Text style={{ marginLeft: 4, color: "#6b7280" }}>days</Text>
          </View>
          <Text style={{ marginTop: 4, color: "#6b7280", fontSize: 12 }}>
            Best Streak
          </Text>
        </View>
      </View>
    </View>
  );
}
