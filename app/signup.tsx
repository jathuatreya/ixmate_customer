import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react-native";
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

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp } = useSession();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCode: "+94",
    phoneNumber: "",
    address: "",
    city: "",
    district: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const loginScale = React.useRef(new Animated.Value(1)).current;
  const termsScale = React.useRef(new Animated.Value(1)).current;

  const animateValue = (ref: Animated.Value, toValue: number) => {
    Animated.spring(ref, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handleSignup = async () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.address ||
      !formData.city ||
      !formData.district ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
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
        formData.address,
        formData.city,
        formData.district,
      );
      Alert.alert(
        "Success",
        "Account created successfully! Please log in to continue.",
        [{ text: "OK", onPress: () => router.replace("/login") }],
      );
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
          <ArrowLeft size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Floating Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: "100%", height: "100%", borderRadius: 24 }}
              resizeMode="contain"
            />
          </View>

          {/* App Name & Tagline */}
          <Text style={styles.appName}>Fix Mate </Text>
          <Text style={styles.tagline}>Premium Home Services</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>

          <View style={styles.inputsWrapper}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "fullName" && styles.inputActive,
                ]}
                placeholder="Full Name"
                placeholderTextColor={COLORS.textSub}
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
                <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                  style={styles.phoneInput}
                  placeholder="77 123 4567"
                  placeholderTextColor={COLORS.textSub}
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

            {/* Address */}
            <View style={styles.inputContainer}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "address" && styles.inputActive,
                ]}
                placeholder="Address"
                placeholderTextColor={COLORS.textSub}
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                onFocus={() => setActiveField("address")}
                onBlur={() => setActiveField(null)}
              />
            </View>

            {/* City */}
            <View style={styles.inputContainer}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "city" && styles.inputActive,
                ]}
                placeholder="City"
                placeholderTextColor={COLORS.textSub}
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
                onFocus={() => setActiveField("city")}
                onBlur={() => setActiveField(null)}
              />
            </View>

            {/* District */}
            <View style={styles.inputContainer}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "district" && styles.inputActive,
                ]}
                placeholder="District"
                placeholderTextColor={COLORS.textSub}
                value={formData.district}
                onChangeText={(text) =>
                  setFormData({ ...formData, district: text })
                }
                onFocus={() => setActiveField("district")}
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

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  activeField === "confirmPassword" && styles.inputActive,
                  { paddingRight: 56 },
                ]}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textSub}
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                onFocus={() => setActiveField("confirmPassword")}
                onBlur={() => setActiveField(null)}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
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
                <Animated.View
                  style={{
                    transform: [{ scale: termsScale }],
                    marginBottom: -4,
                  }}
                >
                  <Text
                    style={styles.linkText}
                    onPressIn={() => animateValue(termsScale, 0.95)}
                    onPressOut={() => animateValue(termsScale, 1)}
                  >
                    Terms & Conditions
                  </Text>
                </Animated.View>{" "}
                and <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>

            <Animated.View
              style={[
                styles.buttonWrapper,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <Pressable
                onPress={handleSignup}
                onPressIn={() => animateValue(buttonScale, 0.96)}
                onPressOut={() => animateValue(buttonScale, 1)}
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
              </Pressable>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Animated.View
                style={{ transform: [{ scale: loginScale }], marginBottom: -4 }}
              >
                <Text
                  style={styles.linkText}
                  onPress={() => router.push("/login")}
                  onPressIn={() => animateValue(loginScale, 0.95)}
                  onPressOut={() => animateValue(loginScale, 1)}
                >
                  Log In
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
    paddingTop: 32,
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
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    position: "relative",
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 15,
    color: COLORS.textMain,
  },
  inputActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface, // Optional: slightly brighten on focus
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
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.surface,
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
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: COLORS.surface,
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
