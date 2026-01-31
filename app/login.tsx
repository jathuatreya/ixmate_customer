import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Hammer,
  Lock,
  Mail,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Theme Colors based on user provided config
const COLORS = {
  primary: "#13ec5b",
  primaryDark: "#0ea640",
  backgroundLight: "#ffffff",
  backgroundDark: "#102216",
  surfaceLight: "#f9fafb",
  surfaceDark: "#1c2e22",
  textMain: "#111827", // gray-900
  textSub: "#6b7280", // gray-500
  border: "#e5e7eb", // gray-200
  white: "#ffffff",
};

// Box Shadows for styling
const SHADOWS = {
  soft: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
};

import { useSession } from "../ctx";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
      // Router redirect handled by useProtectedRoute
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {/* Logo */}
          <LinearGradient
            colors={["#13ec5b", "#0c8a35"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoContainer}
          >
            <Hammer size={36} color="white" />
          </LinearGradient>

          {/* App Name & Tagline */}
          <Text style={styles.appName}>FixMate Lanka</Text>
          <Text style={styles.tagline}>Welcome Back</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Log In</Text>

          <View style={styles.inputsWrapper}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail size={20} color={COLORS.textSub} />
              </View>
              <TextInput
                style={[
                  styles.input,
                  activeField === "email" && styles.inputActive,
                ]}
                placeholder="Email Address"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock size={20} color={COLORS.textSub} />
              </View>
              <TextInput
                style={[
                  styles.input,
                  activeField === "password" && styles.inputActive,
                  { paddingRight: 44 },
                ]}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                onFocus={() => setActiveField("password")}
                onBlur={() => setActiveField(null)}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.textSub} />
                ) : (
                  <Eye size={20} color={COLORS.textSub} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#13ec5b", "#0c8a35"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, loading && { opacity: 0.7 }]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logging In..." : "Log In"}
                </Text>
                {!loading && <ArrowRight size={20} color="white" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Text
                style={styles.linkText}
                onPress={() => router.push("/signup")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...SHADOWS.soft,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSub,
    fontWeight: "500",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputsWrapper: {
    gap: 16,
  },
  inputGroup: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  inputActive: {
    borderColor: COLORS.primary,
    // Ring effect not supported directly, strictly
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.textMain,
    paddingLeft: 32,
  },
  inputIconRight: {
    marginLeft: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  linkText: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  buttonWrapper: {
    marginTop: 8,
    ...SHADOWS.button,
  },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textSub,
  },
});
