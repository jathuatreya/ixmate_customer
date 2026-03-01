import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, getColors } from "../contexts/ThemeContext";

export const BottomNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";

  const isActive = (path: string) => pathname === path;

  return (
    <View
      style={[
        styles.bottomNav,
        {
          height: (Platform.OS === "ios" ? 85 : 90) + insets.bottom,
          paddingBottom:
            insets.bottom > 0 ? insets.bottom : Platform.OS === "ios" ? 24 : 20,
          backgroundColor: THEME_COLORS.surface,
          borderTopColor: THEME_COLORS.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/(tabs)")}
      >
        <MaterialIcons
          name="home"
          size={26}
          color={
            isActive("/(tabs)") || isActive("/")
              ? THEME_COLORS.primary
              : THEME_COLORS.textSub
          }
        />
        <Text
          style={[
            styles.navLabel,
            { color: THEME_COLORS.textSub },
            (isActive("/(tabs)") || isActive("/")) && {
              color: THEME_COLORS.primary,
              fontWeight: "600",
            },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/my-requests")}
      >
        <MaterialIcons
          name="history"
          size={26}
          color={
            isActive("/my-requests")
              ? THEME_COLORS.primary
              : THEME_COLORS.textSub
          }
        />
        <Text
          style={[
            styles.navLabel,
            { color: THEME_COLORS.textSub },
            isActive("/my-requests") && {
              color: THEME_COLORS.primary,
              fontWeight: "600",
            },
          ]}
        >
          History
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/workers")}
      >
        <MaterialIcons
          name="engineering"
          size={26}
          color={
            isActive("/workers") ? THEME_COLORS.primary : THEME_COLORS.textSub
          }
        />
        <Text
          style={[
            styles.navLabel,
            { color: THEME_COLORS.textSub },
            isActive("/workers") && {
              color: THEME_COLORS.primary,
              fontWeight: "600",
            },
          ]}
        >
          Workers
        </Text>
      </TouchableOpacity>

      {!(
        isActive("/create-request") ||
        isActive("/request-location") ||
        isActive("/request-details") ||
        isActive("/review-request")
      ) && (
        <TouchableOpacity
          style={styles.centerNavContainer}
          onPress={() => router.push("/create-request")}
        >
          <View
            style={[
              styles.centerNavButton,
              {
                backgroundColor: THEME_COLORS.primary,
                borderColor: THEME_COLORS.surface,
              },
            ]}
          >
            <MaterialIcons name="add" size={32} color="white" />
          </View>
          <Text
            style={[styles.centerNavLabel, { color: THEME_COLORS.primary }]}
          >
            Request
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <MaterialIcons
          name="person-outline"
          size={26}
          color={
            isActive("/(tabs)/profile")
              ? THEME_COLORS.primary
              : THEME_COLORS.textSub
          }
        />
        <Text
          style={[
            styles.navLabel,
            { color: THEME_COLORS.textSub },
            isActive("/(tabs)/profile") && {
              color: THEME_COLORS.primary,
              fontWeight: "600",
            },
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 100,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  centerNavContainer: {
    flex: 1,
    alignItems: "center",
    top: -28,
  },
  centerNavButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  centerNavLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
