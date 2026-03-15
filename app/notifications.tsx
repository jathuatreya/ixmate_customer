import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
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
  primary: "#2563EB",
  secondary: "#16A34A",
  backgroundLight: "#F1F5F9", // Slate-100
  cardLight: "#FFFFFF",
  textMain: "#0f172a",
  textSub: "#64748b",
  borderLight: "#e2e8f0",
  white: "#FFFFFF",
  blue100: "#dbeafe",
  green50: "#f0fdf4",
  green100: "#dcfce7",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { user } = useSession();
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user._id),
      // orderBy("createdAt", "desc") // May require index
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group and Sort
      list.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setNotifications(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?._id]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Bookings") return n.type === "booking";
    if (filter === "Alerts") return n.type === "alert";
    if (filter === "Promos") return n.type === "promo";
    return true;
  });

  const formatDate = (date: any) => {
    if (!date) return "";
    if (date.seconds) {
      const d = new Date(date.seconds * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return "";
  };

  const getCardBorder = (type: string) => {
    switch (type) {
      case "booking":
        return { borderLeftColor: THEME_COLORS.primary, borderLeftWidth: 4 };
      case "promo":
        return { borderLeftColor: THEME_COLORS.secondary, borderLeftWidth: 4 };
      default:
        return { borderLeftColor: THEME_COLORS.border, borderLeftWidth: 4 };
    }
  };

  // Helper filter component
  const FilterTab = ({ label }: { label: string }) => (
    <TouchableOpacity style={styles.filterTab} onPress={() => setFilter(label)}>
      <Text
        style={[
          styles.filterText,
          filter === label
            ? { color: THEME_COLORS.primary }
            : { color: THEME_COLORS.textSub },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.filterIndicator,
          filter === label
            ? { backgroundColor: THEME_COLORS.primary }
            : { backgroundColor: "transparent" },
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["left", "right"]}
    >
      {/* Filter Nav */}
      <View
        style={[
          styles.navContainer,
          {
            backgroundColor: THEME_COLORS.surface,
            borderBottomColor: THEME_COLORS.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navContent}
        >
          <FilterTab label="All" />
          <FilterTab label="Bookings" />
          <FilterTab label="Alerts" />
          <FilterTab label="Promos" />
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
      >
        {loading ? (
          <View style={{ marginTop: 100 }}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="notifications-none"
              size={48}
              color={THEME_COLORS.textSub}
            />
            <Text style={[styles.emptyText, { color: THEME_COLORS.textSub }]}>
              No notifications found
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: THEME_COLORS.surface,
                  borderColor: THEME_COLORS.border,
                },
                getCardBorder(item.type),
              ]}
              onPress={() => item.link && router.push(item.link as any)}
            >
              <View style={styles.cardPadding}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.metaRow}>
                      <View
                        style={
                          item.type === "promo"
                            ? styles.tagBlue
                            : [
                                styles.tagGray,
                                { backgroundColor: THEME_COLORS.background },
                              ]
                        }
                      >
                        <Text
                          style={
                            item.type === "promo"
                              ? styles.tagBlueText
                              : [
                                  styles.tagGrayText,
                                  { color: THEME_COLORS.textSub },
                                ]
                          }
                        >
                          {item.type || "System"}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.timeText,
                          { color: THEME_COLORS.textSub },
                        ]}
                      >
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: THEME_COLORS.textMain },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.cardBody, { color: THEME_COLORS.textSub }]}
                    >
                      {item.body}
                    </Text>
                  </View>
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.promoImageSmall}
                    />
                  )}
                </View>

                {item.type === "booking" && item.status === "completed" && (
                  <TouchableOpacity
                    style={[styles.rateBtn, { marginTop: 12 }]}
                    onPress={() => router.push("/rate-experience")}
                  >
                    <Text style={styles.rateBtnText}>Rate Service</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {!loading && filteredNotifications.length > 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>No older notifications</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    backgroundColor: "rgba(241, 245, 249, 0.95)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 56, // Adjusted height for header
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  markReadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", // hover effect not needed on mobile
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  navContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  navContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  filterTab: {
    paddingVertical: 12,
    alignItems: "center",
    minWidth: 40,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterIndicator: {
    height: 3,
    width: "100%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    position: "relative",
  },
  cardBlueBorder: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
  },
  cardGreenBorder: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.secondary,
  },
  cardGrayBorder: {
    borderLeftWidth: 6,
    borderLeftColor: "#94a3b8",
  },
  onlineStatus: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB", // blue-600
    zIndex: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  cardRow: {
    flexDirection: "row",
  },
  cardPadding: {
    padding: 16,
    paddingLeft: 24, // increased for border
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 24,
    paddingRight: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  tagBlue: {
    backgroundColor: COLORS.blue100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBlueText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1d4ed8", // blue-700
    textTransform: "uppercase",
  },
  tagGray: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagGrayText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textSub,
    textTransform: "uppercase",
  },
  timeText: {
    fontSize: 12,
    color: "#94a3b8", // slate-400
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  cardTitleSmall: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMain,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.textSub,
    lineHeight: 20,
  },
  subtext: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  btnCall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
    gap: 8,
  },
  btnCallText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  btnIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  historyItem: {
    backgroundColor: "white", // Default light mode
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.borderLight, // Default light mode
  },
  mapPreview: {
    width: 96,
    height: 96,
    borderRadius: 8,
    margin: 16,
    marginLeft: 0,
    backgroundColor: COLORS.gray200,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  mapOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  mapAvatarBorder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapAvatar: {
    width: "100%",
    height: "100%",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
    marginVertical: 12,
  },
  rateBtn: {
    height: 40,
    width: "100%",
    backgroundColor: COLORS.green50,
    borderWidth: 1,
    borderColor: COLORS.green100,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rateBtnText: {
    color: "#15803d", // green-700
    fontWeight: "bold",
    fontSize: 14,
  },
  promoImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: COLORS.gray100,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 4,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 32,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
  },
});
