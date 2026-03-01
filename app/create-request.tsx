import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useTheme, getColors } from "../contexts/ThemeContext";

// Theme Colors
const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  border: "#1e293b",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
};

import { useRequest } from "../contexts/RequestContext";

export default function CreateRequestScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { requestData, updateRequestData } = useRequest();
  const selectedService = requestData.serviceType;

  const setSelectedService = (serviceType: string) => {
    updateRequestData({ serviceType });
  };

  const services = [
    {
      id: "plumbing",
      name: "Plumbing",
      icon: "plumbing",
      colorBg: "rgba(16, 185, 129, 0.1)",
      colorIcon: "#10B981",
    },
    {
      id: "cleaning",
      name: "Cleaning",
      icon: "cleaning-services",
      colorBg: "rgba(59, 130, 246, 0.1)",
      colorIcon: "#3B82F6",
    },
    {
      id: "painting",
      name: "Painting",
      icon: "format-paint",
      colorBg: "rgba(168, 85, 247, 0.1)",
      colorIcon: "#A855F7",
    },
    {
      id: "mason",
      name: "Masonry (Mason)",
      icon: "foundation",
      colorBg: "rgba(245, 158, 11, 0.1)",
      colorIcon: "#F59E0B",
    },
  ];

  const handleContinue = () => {
    if (!selectedService) {
      Alert.alert(
        "Selection Required",
        "Please select a service category to continue.",
      );
      return;
    }
    router.push("/request-details");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1 Card */}
        <View style={styles.stepCardContainer}>
          <LinearGradient
            colors={
              isDark ? ["#1e293b", "#0f172a"] : [COLORS.primary, COLORS.primary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.stepCardGradient,
              isDark && { borderColor: THEME_COLORS.border, borderWidth: 1 },
            ]}
          >
            {/* Abstract Background Shapes */}
            {!isDark && (
              <>
                <View style={styles.abstractShape1} />
                <View style={styles.abstractShape2} />
              </>
            )}

            <View style={styles.stepCardContent}>
              <View style={styles.stepInfoRow}>
                <View>
                  <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
                  <Text style={styles.stepTitle}>Select Service</Text>
                </View>
                <MaterialIcons
                  name="category"
                  size={32}
                  color="rgba(255,255,255,0.8)"
                />
              </View>

              <View
                style={[
                  styles.progressBarBg,
                  isDark && { backgroundColor: THEME_COLORS.border },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    isDark && { backgroundColor: THEME_COLORS.primary },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.selectionSection}>
          <Text style={[styles.chooseText, { color: THEME_COLORS.textMain }]}>
            Choose a category
          </Text>

          <View style={styles.listContainer}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  {
                    backgroundColor: THEME_COLORS.surface,
                    borderColor: THEME_COLORS.border,
                  },
                  selectedService === service.id && {
                    borderColor: THEME_COLORS.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedService(service.id)}
                activeOpacity={0.8}
              >
                <View style={styles.itemLeftContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isDark
                          ? THEME_COLORS.background
                          : service.colorBg,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={service.icon as any}
                      size={24}
                      color={isDark ? THEME_COLORS.primary : service.colorIcon}
                    />
                  </View>
                  <Text
                    style={[
                      styles.serviceName,
                      { color: THEME_COLORS.textMain },
                      selectedService === service.id && {
                        color: THEME_COLORS.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {service.name}
                  </Text>
                </View>

                <View>
                  <MaterialIcons
                    name={
                      selectedService === service.id
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={24}
                    color={
                      selectedService === service.id
                        ? THEME_COLORS.primary
                        : THEME_COLORS.textSub
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.continueButtonContainer}>
          <TouchableOpacity
            style={styles.continueButtonWrapper}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={
                isDark
                  ? [THEME_COLORS.primary, THEME_COLORS.primary]
                  : [COLORS.primary, COLORS.primary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueText}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingBottom: 110, // Space for bottom nav + floating center button
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: -8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: -8,
    opacity: 0, // Hidden as per design ref, keeping layout consistent
  },
  stepCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepCardGradient: {
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    position: "relative",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  abstractShape1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ scale: 1.2 }],
    // Blur effect not native in View, rely on opacity
  },
  abstractShape2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  stepCardContent: {
    zIndex: 1,
  },
  stepInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "25%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  selectionSection: {
    paddingHorizontal: 24,
    flex: 1,
  },
  chooseText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSub,
    marginBottom: 16,
  },
  listContainer: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  itemLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textMain,
  },
  checkIcon: {
    // Legacy mapping if needed by other components, but we use item right view now
  },
  continueButtonContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  continueButtonWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
