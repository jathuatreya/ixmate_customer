import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useTheme, getColors } from "../contexts/ThemeContext";
import { auth } from "../utils/firebaseConfig";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        // Re-authenticate user first
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        Alert.alert("Success", "Password updated successfully");
        router.back();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: THEME_COLORS.surface,
            borderBottomColor: THEME_COLORS.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={THEME_COLORS.textMain}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: THEME_COLORS.textMain }]}>
          Change Password
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.inputSection,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                Current Password
              </Text>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={THEME_COLORS.textSub}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                New Password
              </Text>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor={THEME_COLORS.textSub}
                secureTextEntry
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                Confirm New Password
              </Text>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor={THEME_COLORS.textSub}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: THEME_COLORS.primary }]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
    marginBottom: 30,
    borderWidth: 1,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
