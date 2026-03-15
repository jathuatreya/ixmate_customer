import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../../components/BottomNavbar";
import { useSession } from "../../ctx"; // Fixed import path
import { db } from "../../utils/firebaseConfig"; // Fixed import path
import { useRequest } from "../../contexts/RequestContext";

// Theme Colors
const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  secondaryBlue: "#3B82F6",
  inactive: "#94a3b8",
  surface: "#0f172a",
  background: "#020617",
  text: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
  white: "#ffffff",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useSession();
  const { clearRequestData, updateRequestData } = useRequest();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeRequest, setActiveRequest] = React.useState<any>(null);
  const [recentRequests, setRecentRequests] = React.useState<any[]>([]);

  const [availableJobs, setAvailableJobs] = React.useState<any[]>([]);

  const dummyServices = [
    { id: "2", name: "Plumbing", icon: "plumbing", color: "#3b82f6" },
    { id: "4", name: "Cleaning", icon: "cleaning-services", color: "#a855f7" },
    { id: "5", name: "Painting", icon: "format-paint", color: "#ec4899" },
    { id: "7", name: "Masonry", icon: "architecture", color: "#14b8a6" },
  ];

  const allowedCategories = ["plumbing", "cleaning", "painting", "masonry"];

  const searchResults = searchQuery
    ? dummyServices.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Fetch Data
  React.useEffect(() => {
    if (!user?._id) return;

    // 1. Listen for Active Request (limit 1)
    const activeQ = query(
      collection(db, "requests"),
      where("userId", "==", user._id),
      where("status", "in", ["active", "pending", "accepted"]), // broadened definition of active for dashboard
      // orderBy("createdAt", "desc"), // Requires index, skipping for now or use client side sort if needed
      limit(1),
    );

    const unsubActive = onSnapshot(activeQ, (snapshot) => {
      if (!snapshot.empty) {
        setActiveRequest({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      } else {
        setActiveRequest(null);
      }
    });

    // 2. Listen for Recent History (limit 2)
    const historyQ = query(
      collection(db, "requests"),
      where("userId", "==", user._id),
      // where("status", "in", ["completed", "cancelled"]), // simplified
      limit(5), // Fetch a few to sort client side if needed since we lack composite index
    );

    const unsubHistory = onSnapshot(historyQ, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Client side sort desc
      list.sort(
        (a: any, b: any) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setRecentRequests(list.slice(0, 2));
    });

    // 3. Listen for Available Jobs (Universal pending requests)
    const jobsQ = query(
      collection(db, "requests"),
      where("status", "==", "pending"),
      limit(20)
    );

    const unsubJobs = onSnapshot(jobsQ, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAvailableJobs(list);
    });

    return () => {
      unsubActive();
      unsubHistory();
      unsubJobs();
    };
  }, [user?._id]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={["#020617", "#0f172a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Background Shapes */}
            <View style={styles.headerCircle1} />
            <View style={styles.headerCircle2} />

            <SafeAreaView edges={["top"]} style={styles.safeAreaHeader}>
              {/* User Info Row */}
              <View style={styles.userInfoRow}>
                <View>
                  <Text style={styles.welcomeLabel}>Welcome back,</Text>
                  <Text style={styles.userName}>{user?.name || "User"}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/profile")}
                  style={styles.userAvatar}
                >
                  <MaterialIcons name="person" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Location & Notification */}
              <View style={styles.locationRow}>
                <View style={styles.locationBadge}>
                  <MaterialIcons name="location-on" size={18} color="white" />
                  <Text style={styles.locationText}>Sri Lanka</Text>
                </View>
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchIconWrapper}>
                  <MaterialIcons
                    name="search"
                    size={20}
                    color="rgba(209, 250, 229, 0.7)"
                  />
                </View>
                <TextInput
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  style={styles.searchInput}
                  placeholder="Find a service..."
                  placeholderTextColor="rgba(209, 250, 229, 0.6)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.filterBtn}>
                  <MaterialIcons name="tune" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View
            style={[
              styles.sectionContainer,
              { marginTop: -10, marginBottom: 20 },
            ]}
          >
            <View
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 16,
                padding: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 12,
                      borderBottomWidth:
                        index < searchResults.length - 1 ? 1 : 0,
                      borderBottomColor: COLORS.border,
                    }}
                    onPress={() => {
                      updateRequestData({ serviceType: item.name });
                      setSearchQuery("");
                      router.push("/create-request");
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: COLORS.background,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <MaterialIcons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <Text style={{ color: COLORS.text, fontSize: 16 }}>
                      {item.name}
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color={COLORS.textSub}
                      style={{ marginLeft: "auto" }}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: COLORS.textSub }}>
                    No services found for "{searchQuery}"
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Active Request Card */}
        {activeRequest && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Active Request</Text>
            <TouchableOpacity
              style={styles.activeRequestCard}
              activeOpacity={0.9}
              onPress={() => router.push("/request-status")}
            >
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{activeRequest.status}</Text>
              </View>

              <View style={styles.requestContent}>
                <View style={styles.requestIconBox}>
                  <MaterialIcons
                    name="build"
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View>
                  <Text style={styles.requestTitle}>
                    {activeRequest.serviceType}
                  </Text>
                  <View style={styles.requestDetail}>
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color={COLORS.textSub}
                    />
                    <Text style={styles.requestDetailText}>
                      {activeRequest.scheduledDate}{" "}
                      {activeRequest.scheduledTime}
                    </Text>
                  </View>
                  <View style={styles.requestDetail}>
                    <MaterialIcons
                      name="location-on"
                      size={14}
                      color={COLORS.textSub}
                    />
                    <Text style={styles.requestDetailText} numberOfLines={1}>
                      {activeRequest.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mock Progress Bar for now */}
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={["#34d399", COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBarFill}
                />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerStatusText}>
                  Status: {activeRequest.status}
                </Text>
                <TouchableOpacity style={styles.viewDetailsBtn}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Request Button */}
        <View style={[styles.sectionContainer, { marginTop: 8 }]}>
          <TouchableOpacity
            style={styles.createRequestBtn}
            activeOpacity={0.9}
            onPress={() => {
              clearRequestData();
              router.push("/create-request");
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, "#34d399"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createRequestGradient}
            >
              <MaterialIcons name="add-circle" size={24} color="white" />
              <Text style={styles.createRequestText}>
                Create New Work Request
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent History */}
        <View style={[styles.sectionContainer, { paddingBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          <View style={styles.historyList}>
            {recentRequests.length === 0 ? (
              <Text
                style={{
                  color: COLORS.textSub,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                No history yet.
              </Text>
            ) : (
              recentRequests.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyIconBox,
                        { backgroundColor: COLORS.border },
                      ]}
                    >
                      <MaterialIcons
                        name="history"
                        size={20}
                        color={COLORS.textSub}
                      />
                    </View>
                    <View>
                      <Text style={styles.historyName}>{item.serviceType}</Text>
                      <Text style={styles.historyDate}>
                        {item.createdAt?.toDate().toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.historyBadge,
                      {
                        backgroundColor:
                          item.status?.toLowerCase() === "completed"
                            ? COLORS.primary
                            : COLORS.surface,
                        borderWidth:
                          item.status?.toLowerCase() === "completed" ? 0 : 1,
                        borderColor: COLORS.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyBadgeText,
                        {
                          color:
                            item.status?.toLowerCase() === "completed"
                              ? "white"
                              : COLORS.textSub,
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  safeAreaHeader: {
    // paddingTop handled by safe area context
  },
  headerCircle1: {
    position: "absolute",
    top: -64,
    right: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: "rgba(255,255,255,0.05)",
    zIndex: 0,
  },
  headerCircle2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.1)",
    zIndex: 0,
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeLabel: {
    color: COLORS.textSub,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  userName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  locationText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
    marginHorizontal: 6,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444", // red-500
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  searchIconWrapper: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "white",
    fontSize: 15,
  },
  filterBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  activeRequestCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomLeftRadius: 16,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.secondaryBlue,
    letterSpacing: 0.5,
  },
  requestContent: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 20,
  },
  requestIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  requestDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  requestDetailText: {
    fontSize: 12,
    color: COLORS.textSub,
    marginLeft: 4,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "65%",
    height: "100%",
    borderRadius: 5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  footerStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSub,
  },
  viewDetailsBtn: {
    backgroundColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.secondaryBlue,
  },
  createRequestBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createRequestGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  createRequestText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  historyList: {
    gap: 16,
  },
  historyItem: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  historyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  // Removed Bottom Nav styles
});
