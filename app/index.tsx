import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { useSession } from "../ctx";

// Theme Colors
const COLORS = {
  primary: "#16a249",
  secondaryBlue: "#1e3a8a",
  logoDark: "#16a249",
  logoLight: "#22c55e",
  white: "#ffffff",
};

export default function SplashScreen() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { user, isLoading } = useSession();

  // Animation for the spinner
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // Handle Redirection based on Auth State
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Main Background Gradient */}
      <LinearGradient
        colors={["#020617", "#0f172a"]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Status Bar Placeholder */}
        <View style={styles.statusBarPlaceholder} />

        {/* Abstract Background Elements (Blur effects) */}
        <View style={styles.blurTop} />
        <View style={styles.blurBottom} />

        {/* Center Content */}
        <View style={styles.centerContent}>
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: "100%", height: "100%", borderRadius: 24 }}
              resizeMode="contain"
            />
          </View>

          {/* Text Content */}
          <Text style={styles.title}>FixMate</Text>
          <Text style={styles.tagline}>Your Home, Our Priority</Text>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          {/* Spinner */}
          <View style={styles.spinnerContainer}>
            <Animated.View
              style={[styles.spinner, { transform: [{ rotate: spin }] }]}
            />
          </View>

          {/* Powered By */}
          <View style={styles.poweredByContainer}>
            <Text style={styles.poweredByLabel}>POWERED BY</Text>
            <View style={styles.brandRow}>
              <View style={styles.boltIconContainer}>
                <MaterialIcons name="bolt" size={10} color="white" />
              </View>
              <Text style={styles.brandName}>LankaGlobal Tech</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50, // Approximate padding for safe areas
  },
  statusBarPlaceholder: {
    height: 44, // iOS safe area approximate
    width: "100%",
  },
  blurTop: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  blurBottom: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: "rgba(22, 162, 73, 0.2)",
  },
  centerContent: {
    alignItems: "center",
    marginTop: -80, // Offset to match visual center
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: "white",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: "transparent",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInnerBorder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.5,
  },
  bottomContent: {
    alignItems: "center",
    gap: 24,
    paddingBottom: 40,
  },
  spinnerContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderTopColor: "white",
  },
  poweredByContainer: {
    alignItems: "center",
    opacity: 0.7,
  },
  poweredByLabel: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  boltIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
});
