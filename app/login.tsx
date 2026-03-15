import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";

import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Theme Colors based on user provided config
const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
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
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const forgotScale = React.useRef(new Animated.Value(1)).current;
  const signupScale = React.useRef(new Animated.Value(1)).current;

  const animateValue = (ref: Animated.Value, toValue: number) => {
    Animated.spring(ref, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textSub} />
        </TouchableOpacity>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: "100%", height: "100%", borderRadius: 24 }}
              resizeMode="contain"
            />
          </View>

          {/* App Name & Tagline */}
          <Text style={styles.appName}>FixMate</Text>
          <Text style={styles.tagline}>Welcome Back</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Log In</Text>

          <View style={styles.inputsWrapper}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "email" && styles.inputActive,
                ]}
                placeholder="Email Address"
                placeholderTextColor={COLORS.textSub}
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
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "password" && styles.inputActive,
                  { paddingRight: 56 },
                ]}
                placeholder="Password"
                placeholderTextColor={COLORS.textSub}
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

            <Animated.View style={{ transform: [{ scale: forgotScale }] }}>
              <TouchableOpacity
                style={styles.forgotPassword}
                onPressIn={() => animateValue(forgotScale, 0.95)}
                onPressOut={() => animateValue(forgotScale, 1)}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.buttonWrapper,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <Pressable
                onPress={handleLogin}
                onPressIn={() => animateValue(buttonScale, 0.96)}
                onPressOut={() => animateValue(buttonScale, 1)}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.button, loading && { opacity: 0.7 }]}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Logging In..." : "Log In"}
                  </Text>
                  {!loading && <ArrowRight size={20} color="white" />}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Animated.View
                style={{
                  transform: [{ scale: signupScale }],
                  marginBottom: -4,
                }}
              >
                <Text
                  style={styles.linkText}
                  onPress={() => router.push("/signup")}
                  onPressIn={() => animateValue(signupScale, 0.95)}
                  onPressOut={() => animateValue(signupScale, 1)}
                >
                  Sign Up
                </Text>
              </Animated.View>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    position: "relative",
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
    paddingLeft: 16,
    paddingRight: 16,
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
