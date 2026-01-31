import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Hammer,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
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

import { Alert } from "react-native";
import { useSession } from "../ctx";

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useSession();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCode: "+94",
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSignup = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.password
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Error", "You must agree to the Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `${formData.phoneCode}${formData.phoneNumber}`;
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        fullPhoneNumber,
      );
      // Router redirect handled by useProtectedRoute
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Something went wrong");
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
          {/* Floating Logo */}
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
          <Text style={styles.tagline}>Premium Home Services</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>

          <View style={styles.inputsWrapper}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <User size={20} color={COLORS.textSub} />
              </View>
              <TextInput
                style={[
                  styles.input,
                  activeField === "fullName" && styles.inputActive,
                ]}
                placeholder="Full Name"
                placeholderTextColor="#9ca3af"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                onFocus={() => setActiveField("fullName")}
                onBlur={() => setActiveField(null)}
              />
            </View>

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

            {/* Phone Number */}
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flag}>🇱🇰</Text>
                <Text style={styles.countryCodeText}>{formData.phoneCode}</Text>
                <ChevronDown
                  size={16}
                  color={COLORS.textSub}
                  style={{ marginLeft: 2 }}
                />
              </View>

              <View
                style={[
                  styles.phoneInputWrapper,
                  activeField === "phone" && styles.inputActive,
                ]}
              >
                <TextInput
                  style={styles.phoneInput}
                  placeholder="77 123 4567"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phoneNumber: text })
                  }
                  onFocus={() => setActiveField("phone")}
                  onBlur={() => setActiveField(null)}
                />
              </View>
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

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxChecked,
                ]}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                {agreedToTerms && <Check size={16} color="white" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.linkText}>Terms & Conditions</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.9}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={["#13ec5b", "#0c8a35"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, loading && { opacity: 0.7 }]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Text>
                {!loading && <ArrowRight size={20} color="white" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text
                style={styles.linkText}
                onPress={() => router.push("/login")}
              >
                Log In
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
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
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
    color: COLORS.textMain, // Fallback for gradient text
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
  inputContainer: {
    position: "relative",
    height: 48,
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingLeft: 44, // 16 (icon left) + 20 (icon size) + 8 (spacing)
    paddingRight: 16,
    fontSize: 15,
    color: COLORS.textMain,
  },
  inputActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#fff", // Optional: slightly brighten on focus
    // Ring effect simulated with border
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 12,
    height: 48,
  },
  countryCodeContainer: {
    width: 88,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  flag: {
    fontSize: 20,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: "500",
  },
  phoneInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    // active styling applied via props
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textMain,
    height: "100%",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSub,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  buttonWrapper: {
    marginTop: 16,
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
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textSub,
  },
});
