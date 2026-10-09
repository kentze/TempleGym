import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth.store";

export default function ProfileScreen({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate?: (updated: any) => void;
}) {
  const insets = useSafeAreaInsets();
  const setUser = useAuthStore((s) => s.setUser);
  const preferMetric = user?.preferMetric ?? true;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [gymId, setGymId] = useState(user?.gymId || "city");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || "",
  );

  // Height & Weight states
  const [heightDisplay, setHeightDisplay] = useState(() => {
    const h = user?.heightCm;
    if (!h) return "";
    return (preferMetric ? h : h / 2.54).toFixed(1);
  });
  const [weightDisplay, setWeightDisplay] = useState(() => {
    const w = user?.weightKg;
    if (!w) return "";
    return (preferMetric ? w : w * 2.20462).toFixed(1);
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfilePicture(base64Image);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const body: any = {
        displayName,
        gymId,
        profilePicture,
      };

      if (heightDisplay) {
        const raw = parseFloat(heightDisplay);
        const h = preferMetric ? raw : raw * 2.54;
        body.heightCm = Math.round(h);
      }
      if (weightDisplay) {
        const raw = parseFloat(weightDisplay);
        const w = preferMetric ? raw : raw / 2.20462;
        body.weightKg = w;
      }

      const response = await api.patch("/me/profile", body);

      setUser(response.data);
      onUpdate?.(response.data);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error(
        "Failed to update profile:",
        error?.response?.data || error,
      );
      Alert.alert("Error", "Could not save profile changes.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Picture Upload */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Form Fields Group */}
      <View style={styles.formCard}>
        {/* Name Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Height Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Height ({preferMetric ? "cm" : "in"})
          </Text>
          <TextInput
            style={styles.input}
            value={heightDisplay}
            onChangeText={setHeightDisplay}
            placeholder={preferMetric ? "170" : "67"}
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Weight Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Weight ({preferMetric ? "kg" : "lbs"})
          </Text>
          <TextInput
            style={styles.input}
            value={weightDisplay}
            onChangeText={setWeightDisplay}
            placeholder={preferMetric ? "70" : "154"}
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Gym Selector (City vs Hillside) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Preferred Gym Location</Text>
          <View style={styles.gymSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.gymOption,
                gymId === "city" && styles.gymOptionSelected,
              ]}
              onPress={() => setGymId("city")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.gymText,
                  gymId === "city" && styles.gymTextSelected,
                ]}
              >
                City Campus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gymOption,
                gymId === "hillside" && styles.gymOptionSelected,
              ]}
              onPress={() => setGymId("hillside")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.gymText,
                  gymId === "hillside" && styles.gymTextSelected,
                ]}
              >
                Hillside
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, alignItems: "center", gap: 20 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    alignSelf: "flex-start",
  },

  imageContainer: { alignSelf: "center", marginVertical: 8 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderText: { fontSize: 12, color: Colors.textMuted, fontWeight: "600" },

  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 0.5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 15,
  },
  gymSelectorContainer: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  gymOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  gymOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gymText: { color: Colors.text, fontWeight: "600", fontSize: 14 },
  gymTextSelected: { color: "#fff", fontWeight: "700" },

  saveButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
});
