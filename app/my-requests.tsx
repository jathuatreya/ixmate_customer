import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useTheme, getColors } from "../contexts/ThemeContext";
import { useSession } from "../ctx";
import { db } from "../utils/firebaseConfig";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  secondary: "#3B82F6",
  stroke: "#1e293b",
  white: "#FFFFFF",
  textDark: "#f8fafc",
  textGray: "#94a3b8",
  statusActive: "#3B82F6",
  statusCompleted: "#10B981",
  statusPending: "#F59E0B",
  statusCancelled: "#EF4444",
  bgActive: "rgba(59, 130, 246, 0.15)",
  bgCompleted: "rgba(16, 185, 129, 0.15)",
  bgPending: "rgba(245, 158, 11, 0.15)",
  bgCancelled: "rgba(239, 68, 68, 0.15)",
};

export default function MyRequestsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { user } = useSession();
  const [filter, setFilter] = useState("All");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", user._id),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort locally by created date if needed, or rely on index if complex
      setRequests(fetchedRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?._id]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "active" || s === "accepted") return COLORS.statusActive;
    if (s === "pending") return COLORS.statusPending;
    if (s === "completed") return COLORS.statusCompleted;
    if (s === "cancelled") return COLORS.statusCancelled;
    return COLORS.textDark;
  };

  const getStatusBg = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "active" || s === "accepted") return COLORS.bgActive;
    if (s === "pending") return COLORS.bgPending;
    if (s === "completed") return COLORS.bgCompleted;
    if (s === "cancelled") return COLORS.bgCancelled;
    return "#f1f5f9";
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "All") return true;
    return req.status?.toLowerCase() === filter.toLowerCase();
  });

  // Helper to format date if timestamp or string
  const formatDate = (date: any) => {
    if (!date) return "";
    // If string, return as is
    if (typeof date === "string") return date;
    // If timestamp loop (basic)
    if (date.seconds) return new Date(date.seconds * 1000).toDateString();
    return "";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["left", "right"]}
    >
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: THEME_COLORS.surface,
            borderBottomColor: THEME_COLORS.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: THEME_COLORS.background,
              borderColor: THEME_COLORS.border,
            },
          ]}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={THEME_COLORS.textSub}
            style={styles.searchIcon}
          />
          <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
            style={[styles.searchInput, { color: THEME_COLORS.textMain }]}
            placeholder="Search service, worker..."
            placeholderTextColor={THEME_COLORS.textSub}
          />
          <TouchableOpacity style={styles.filterIconBtn}>
            <MaterialIcons name="tune" size={20} color={THEME_COLORS.textSub} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {["All", "Active", "Completed", "Cancelled"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                { borderColor: THEME_COLORS.border },
                filter === tab && {
                  backgroundColor: THEME_COLORS.primary,
                  borderColor: THEME_COLORS.primary,
                },
                filter !== tab && { backgroundColor: "transparent" },
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: THEME_COLORS.textSub },
                  filter === tab && { color: "white" },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Request List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40, opacity: 0.5 }}>
            <MaterialIcons
              name="assignment"
              size={48}
              color={THEME_COLORS.textSub}
            />
            <Text style={{ marginTop: 10, color: THEME_COLORS.textSub }}>
              No requests found
            </Text>
          </View>
        )}

        {filteredRequests.length > 0 &&
          filteredRequests.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  borderLeftColor: getStatusColor(item.status),
                  opacity: item.status === "cancelled" ? 0.6 : 1,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/request-status",
                  params: { id: item.id },
                })
              }
              activeOpacity={0.7}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: getStatusBg(item.status) },
                    ]}
                  >
                    <MaterialIcons
                      name="build"
                      size={24}
                      color={getStatusColor(item.status)}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: THEME_COLORS.textMain },
                      ]}
                    >
                      {item.serviceType || "Service Request"}
                    </Text>
                    <View style={styles.dateRow}>
                      <MaterialIcons
                        name="calendar-today"
                        size={12}
                        color={THEME_COLORS.textSub}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.dateText,
                          { color: THEME_COLORS.textSub },
                        ]}
                      >
                        {item.scheduledDate} {item.scheduledTime}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBg(item.status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status || "Pending"}
                  </Text>
                </View>
              </View>

              {/* Details Box */}
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={
                      item.status === "Active"
                        ? THEME_COLORS.primary
                        : THEME_COLORS.textSub
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      { color: THEME_COLORS.textMain },
                    ]}
                    numberOfLines={1}
                  >
                    {item.address || "No address provided"}
                  </Text>
                </View>
                {item.status !== "cancelled" && (
                  <View style={[styles.detailRow, { marginTop: 4 }]}>
                    <MaterialIcons
                      name="person"
                      size={18}
                      color={THEME_COLORS.textSub}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.detailText,
                        { fontStyle: "italic", color: THEME_COLORS.textMain },
                      ]}
                    >
                      {item.workerName
                        ? item.workerName
                        : "Worker assignment pending..."}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {item.status?.toLowerCase() === "active" && (
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => router.push("/chat")}
                  >
                    <MaterialIcons
                      name="chat"
                      size={18}
                      color="white"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.btnPrimaryText}>Chat</Text>
                  </TouchableOpacity>
                )}
                {item.status?.toLowerCase() === "completed" && (
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => 
                      router.push({
                        pathname: "/payment",
                        params: {
                          id: item.id,
                          amount: item.budget || "5000",
                          serviceType: item.serviceType,
                        },
                      })
                    }
                  >
                    <MaterialIcons
                      name="payment"
                      size={18}
                      color="white"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.btnPrimaryText}>Pay Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#020617",
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#f8fafc",
    fontSize: 14,
  },
  filterIconBtn: {
    padding: 4,
  },
  tabsContainer: {
    paddingBottom: 4,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButtonInactive: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "white",
  },
  tabTextInactive: {
    color: "#94a3b8",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    borderLeftWidth: 4, // Status color border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  progressSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.statusActive,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textGray,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.statusActive,
    borderRadius: 3,
  },
  detailsBox: {
    backgroundColor: "#020617",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: "#f8fafc",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f8fafc",
  },
  btnOutlineFull: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
});
