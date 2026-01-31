import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../../ctx";
import { db } from "../../utils/firebaseConfig";

const COLORS = {
  primary: "#2563EB", // Blue-600
  primaryDark: "#1D4ED8",
  secondary: "#059669", // Emerald-600
  backgroundLight: "#F8FAFC",
  stroke: "#E2E8F0",
  white: "#FFFFFF",
  textDark: "#1E293B",
  textGray: "#64748B",
  statusActive: "#2563EB",
  statusCompleted: "#059669",
  statusPending: "#D97706",
  statusCancelled: "#DC2626",
  bgActive: "#EFF6FF",
  bgCompleted: "#ECFDF5",
  bgPending: "#FFF7ED",
  bgCancelled: "#FEF2F2",
};

export default function MyRequestsScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundLight}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { marginLeft: 0 }]}>My Requests</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialIcons
            name="search"
            size={20}
            color={COLORS.textGray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search service, worker..."
            placeholderTextColor={COLORS.textGray}
          />
          <TouchableOpacity style={styles.filterIconBtn}>
            <MaterialIcons name="tune" size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>
      </View>

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
                filter === tab && styles.tabButtonActive,
                filter !== tab && styles.tabButtonInactive,
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  filter === tab
                    ? styles.tabTextActive
                    : styles.tabTextInactive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40, opacity: 0.5 }}>
            <MaterialIcons
              name="assignment"
              size={48}
              color={COLORS.textGray}
            />
            <Text style={{ marginTop: 10, color: COLORS.textGray }}>
              No requests found
            </Text>
          </View>
        )}

        {filteredRequests.length > 0 &&
          filteredRequests.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  borderLeftColor: getStatusColor(item.status),
                  opacity: item.status === "Cancelled" ? 0.6 : 1,
                },
              ]}
            >
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
                    <Text style={styles.cardTitle}>
                      {item.serviceType || "Service Request"}
                    </Text>
                    <View style={styles.dateRow}>
                      <MaterialIcons
                        name="calendar-today"
                        size={12}
                        color={COLORS.textGray}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.dateText}>
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

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={
                      item.status === "Active"
                        ? COLORS.primary
                        : COLORS.textGray
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.address || "No address provided"}
                  </Text>
                </View>
                {item.status !== "cancelled" && (
                  <View style={[styles.detailRow, { marginTop: 4 }]}>
                    <MaterialIcons
                      name="person"
                      size={18}
                      color={COLORS.textGray}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.detailText, { fontStyle: "italic" }]}>
                      {item.workerName
                        ? item.workerName
                        : "Worker assignment pending..."}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.actionRow}>
                {item.status === "Pending" && (
                  <TouchableOpacity
                    style={styles.btnOutlineFull}
                    onPress={() => router.push("/request-status")}
                  >
                    <Text style={styles.btnOutlineText}>View Status</Text>
                  </TouchableOpacity>
                )}
                {item.status === "Active" && (
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => router.push("/(tabs)/inbox")}
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
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.backgroundLight,
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    color: COLORS.textDark,
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
    backgroundColor: COLORS.white,
    borderColor: COLORS.stroke,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "white",
  },
  tabTextInactive: {
    color: COLORS.textGray,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.stroke,
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
  detailsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 16,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textGray,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  btnOutlineFull: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark,
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
