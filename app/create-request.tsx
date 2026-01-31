import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Theme Colors
const COLORS = {
  primary: "#118A7E",
  emerald500: "#10b981",
  backgroundLight: "#F5F7FA",
  backgroundDark: "#121212",
  surfaceLight: "#FFFFFF",
  surfaceDark: "#1E1E1E",
  textLight: "#1F2937",
  textGray: "#6B7280",
  textGrayLight: "#9CA3AF",
  borderLight: "#E5E7EB",
  emerald50: "#ecfdf5",
  emerald100: "#d1fae5",
  orange100: "#ffedd5",
  orange600: "#ea580c",
  blue100: "#dbeafe",
  blue600: "#2563eb",
  amber100: "#fef3c7",
  amber700: "#b45309",
  purple100: "#f3e8ff",
  purple600: "#9333ea",
  cyan100: "#cffafe",
  cyan600: "#0891b2",
};

import { useRequest } from "../contexts/RequestContext";

export default function CreateRequestScreen() {
  const router = useRouter();
  // const [selectedService, setSelectedService] = useState('plumbing');
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
      colorBg: COLORS.emerald100,
      colorIcon: COLORS.primary,
    },
    {
      id: "electrical",
      name: "Electrical",
      icon: "bolt",
      colorBg: COLORS.orange100,
      colorIcon: COLORS.orange600,
    },
    {
      id: "cleaning",
      name: "Cleaning",
      icon: "cleaning-services",
      colorBg: COLORS.blue100,
      colorIcon: COLORS.blue600,
    },
    {
      id: "carpentry",
      name: "Carpentry",
      icon: "carpenter",
      colorBg: COLORS.amber100,
      colorIcon: COLORS.amber700,
    }, // using MaterialIcons carpenter if available, or build
    {
      id: "painting",
      name: "Painting",
      icon: "format-paint",
      colorBg: COLORS.purple100,
      colorIcon: COLORS.purple600,
    },
    {
      id: "ac_repair",
      name: "AC Repair",
      icon: "ac-unit",
      colorBg: COLORS.cyan100,
      colorIcon: COLORS.cyan600,
    },
    {
      id: "other",
      name: "Other",
      icon: "more-horiz",
      colorBg: COLORS.textGrayLight + "20", // lighter gray
      colorIcon: COLORS.textLight,
    },
  ];

  const [customService, setCustomService] = React.useState("");

  const handleContinue = () => {
    if (selectedService === "other" && !customService.trim()) {
      // If 'other' requires explicit text, block or just let them proceed as 'Other'
      // For now let's just update context if they typed something
    }
    if (selectedService === "other" && customService.trim()) {
      updateRequestData({ serviceType: customService });
    }
    router.push("/request-details");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundLight}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Request</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1 Card */}
        <View style={styles.stepCardContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.emerald500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stepCardGradient}
          >
            {/* Abstract Background Shapes */}
            <View style={styles.abstractShape1} />
            <View style={styles.abstractShape2} />

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

              <View style={styles.progressBarBg}>
                <View style={styles.progressBarFill} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.selectionSection}>
          <Text style={styles.chooseText}>Choose a category</Text>

          <View style={styles.gridContainer}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  selectedService === service.id && styles.serviceCardSelected,
                ]}
                onPress={() => setSelectedService(service.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: service.colorBg },
                  ]}
                >
                  <MaterialIcons
                    name={service.icon as any}
                    size={28}
                    color={service.colorIcon}
                  />
                </View>
                <Text
                  style={[
                    styles.serviceName,
                    selectedService === service.id && {
                      color: COLORS.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {service.name}
                </Text>

                {selectedService === service.id && (
                  <View style={styles.checkIcon}>
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                )}
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
              colors={[COLORS.primary, COLORS.emerald500]}
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

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/client-home")}
        >
          <MaterialIcons name="home" size={26} color={COLORS.textGrayLight} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <View style={styles.centerNavContainer}>
          <View style={styles.centerNavButton}>
            <MaterialIcons name="add" size={32} color="white" />
          </View>
          <Text style={styles.centerNavLabel}>Request</Text>
        </View>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons
            name="history"
            size={26}
            color={COLORS.textGrayLight}
          />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={26}
            color={COLORS.textGrayLight}
          />
          <Text style={styles.navLabel}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons
            name="person-outline"
            size={26}
            color={COLORS.textGrayLight}
          />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContent: {
    paddingBottom: 110, // Space for bottom nav + floating center button
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textLight,
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
    shadowColor: COLORS.emerald500,
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
    color: COLORS.textGray,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  serviceCard: {
    width: "47%", // approx half with gap
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent", // Default
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    marginBottom: 8,
  },
  serviceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.emerald50,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textLight,
  },
  checkIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  continueButtonContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  continueButtonWrapper: {
    shadowColor: COLORS.emerald500,
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    zIndex: 10,
    height: 80,
    alignItems: "flex-start",
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: COLORS.textGrayLight,
  },
  centerNavContainer: {
    position: "relative",
    alignItems: "center",
    top: -28,
  },
  centerNavButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 4,
    borderColor: COLORS.backgroundLight, // match bg to look like cutout
    shadowColor: COLORS.emerald500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  centerNavLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
