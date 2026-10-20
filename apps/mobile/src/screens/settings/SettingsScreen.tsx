import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth.store";
import type { UpdateProfileBody, UserProfile } from "@templegym/types";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, setUser, logout } = useAuthStore();

  const [preferMetric, setPreferMetric] = useState(user?.preferMetric ?? true);
  const [leaderboardAnonymous, setLeaderboardAnonymous] = useState(
    user?.leaderboardAnonymous ?? false,
  );

  function handleUnitToggle(toMetric: boolean) {
    setPreferMetric(toMetric);
  }

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);

    const body: UpdateProfileBody = {
      preferMetric,
      leaderboardAnonymous,
    };

    try {
      const { data } = await api.patch<UserProfile>("/me/profile", body);
      setUser(data);
      setSaved(true);
      navigation.navigate("Home");
    } catch (e: any) {
      const err = e.response?.data?.error;
      setError(typeof err === "string" ? err : "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  }

  const unitLabel = preferMetric ? "kg / cm" : "lbs / in";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
    >
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferences</Text>

        <View style={styles.toggle}>
          <View>
            <Text style={styles.toggleLabel}>Metric units</Text>
            <Text style={styles.toggleSub}>Currently: {unitLabel}</Text>
          </View>
          <Switch
            value={preferMetric}
            onValueChange={handleUnitToggle}
            trackColor={{ true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>

        <View style={styles.toggle}>
          <View>
            <Text style={styles.toggleLabel}>Anonymous on leaderboard</Text>
            <Text style={styles.toggleSub}>
              Show "Anonymous" instead of your Temple ID
            </Text>
          </View>
          <Switch
            value={leaderboardAnonymous}
            onValueChange={setLeaderboardAnonymous}
            trackColor={{ true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saved ? <Text style={styles.success}>Saved.</Text> : null}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={Colors.text} />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {user && <Text style={styles.emailHint}>{user.email}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 20 },
  heading: { fontSize: 22, fontWeight: "700", color: Colors.text },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  toggleLabel: { fontSize: 15, color: Colors.text },
  toggleSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
  success: { color: Colors.success, fontSize: 13, textAlign: "center" },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: Colors.text, fontSize: 16, fontWeight: "600" },
  logoutButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: "600" },
  emailHint: { fontSize: 12, color: Colors.textMuted, textAlign: "center" },
});
