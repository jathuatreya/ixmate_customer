import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useTheme, getColors } from "../contexts/ThemeContext";
import { useSession } from "../ctx";
import { db } from "../utils/firebaseConfig";

// Theme
const COLORS = {
  primary: "#10b981", // Emerald 500
  primaryDark: "#059669", // Emerald 600
  secondary: "#3b82f6", // Blue 500
  accent: "#0ea5e9", // Sky 500
  backgroundLight: "#f1f5f9", // Slate 100
  surfaceLight: "#ffffff",
  textMain: "#1e293b",
  textSub: "#64748b",
  white: "#FFFFFF",
  red500: "#ef4444",
  borderLight: "#e2e8f0",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, mode, setMode } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const [pushEnabled, setPushEnabled] = useState(true);

  const { user, signOut } = useSession();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user?._id) return;

    const unsubscribe = onSnapshot(doc(db, "users", user._id), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    }, (error) => {
      console.error("Profile Fetch Error:", error);
    });

    return () => unsubscribe();
  }, [user?._id]);

  // Profile Header Section
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={isDark ? ["#0f172a", "#1e293b"] : ["#059669", "#10b981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Top Buttons */}
        <View style={styles.topBar}>
          <View style={{ height: 10 }} />
        </View>

        {/* Avatar & Info */}
        <View style={styles.profileInfo}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  userData?.photoURL ||
                  `https://ui-avatars.com/api/?name=${userData?.displayName || "User"}&background=random`,
              }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={14} color={COLORS.primaryDark} />
            </View>
          </View>

          <Text style={[styles.userName, { color: "white" }]}>
            {userData?.displayName || "Loading..."}
          </Text>

          <View style={styles.userTags}>
            <View style={styles.tag}>
              <MaterialIcons name="call" size={14} color="white" />
              <Text style={styles.tagText}>
                {userData?.phoneNumber || "No Phone"}
              </Text>
            </View>
            <View style={styles.tag}>
              <MaterialIcons name="location-on" size={14} color="white" />
              <Text style={styles.tagText}>
                {userData?.address || "No Address"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Card Overlay */}
      <View
        style={[styles.statsCard, { backgroundColor: THEME_COLORS.surface }]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: THEME_COLORS.textMain }]}>
            0
          </Text>
          <Text style={[styles.statLabel, { color: COLORS.primary }]}>
            JOBS COMPLETED
          </Text>
        </View>
      </View>
    </View>
  );

  // Menu Item Component
  interface MenuItemProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle?: string;
    color: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }

  const MenuItem = ({
    icon,
    title,
    subtitle,
    color,
    onPress,
    rightElement,
    showArrow = true,
  }: MenuItemProps) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: THEME_COLORS.textMain }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: THEME_COLORS.textSub }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightElement
        ? rightElement
        : showArrow && (
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={THEME_COLORS.border}
            />
          )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}

        <View style={{ height: 40 }} />

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: THEME_COLORS.textSub }]}>
            ACCOUNT
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <MenuItem
              icon="person"
              title="Edit Profile"
              subtitle="Update details & photo"
              color="#10b981"
              onPress={() => router.push("/edit-profile")}
            />
            <View style={styles.divider} />
            <MenuItem
              icon="account-balance-wallet"
              title="Payment Methods"
              subtitle="Cards & History"
              color="#0d9488"
              showArrow
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.card}>
            <MenuItem
              icon="translate"
              title="Language"
              color="#4f46e5"
              rightElement={
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: COLORS.textSub,
                      marginRight: 4,
                    }}
                  >
                    English (UK)
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#cbd5e1"
                  />
                </View>
              }
            />
            <View style={styles.divider} />
            <MenuItem
              icon="notifications"
              title="Push Notifications"
              color="#d97706"
              rightElement={
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: "#e2e8f0", true: COLORS.primary }}
                  thumbColor="white"
                />
              }
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut()}>
            <MaterialIcons name="logout" size={20} color={COLORS.red500} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.versionInfo}>
            <Text style={styles.versionRef}>FIXMATE v1.0</Text>
            <Text style={styles.madeText}>Empowering Sri Lanka 🇱🇰</Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    position: "relative",
    marginBottom: 40,
  },
  headerGradient: {
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pageTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  profileInfo: {
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "white",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  userTags: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tagText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
  },
  statsCard: {
    position: "absolute",
    bottom: -32,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    paddingVertical: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#f1f5f9",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textSub,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.6)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 76,
  },
  footer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fee2e2",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    color: COLORS.red500,
    fontWeight: "bold",
    fontSize: 16,
  },
  versionInfo: {
    alignItems: "center",
  },
  versionRef: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textSub,
    letterSpacing: 1.5,
    marginBottom: 4,
    opacity: 0.6,
  },
  madeText: {
    fontSize: 12,
    color: COLORS.textSub,
    opacity: 0.5,
  },
});
