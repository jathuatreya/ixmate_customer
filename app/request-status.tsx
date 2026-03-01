import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useTheme, getColors } from "../contexts/ThemeContext";
import { db } from "../utils/firebaseConfig";

// Theme Colors
const COLORS = {
  primary: "#10B981", // Green
  primaryDark: "#059669",
  secondary: "#3B82F6", // Blue
  secondaryDark: "#2563EB",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
  red500: "#ef4444",
  red50: "rgba(239, 68, 68, 0.1)",
  yellow500: "#eab308",
  yellow50: "rgba(234, 179, 8, 0.1)",
  white: "#FFFFFF",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function RequestStatusScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<any>(null);
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Animation for finding worker
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (request?.status === "pending") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [request?.status]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "requests", id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data: any = { id: docSnap.id, ...docSnap.data() };
        setRequest(data);

        // If workerId exists, fetch worker info
        if (data.workerId) {
          const workerUnsub = onSnapshot(
            doc(db, "workers", data.workerId),
            (workerSnap) => {
              if (workerSnap.exists()) {
                setWorker({ id: workerSnap.id, ...workerSnap.data() });
              }
            },
          );
          return () => workerUnsub();
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "requests", id as string), {
                status: "cancelled",
              });
              Alert.alert("Success", "Request cancelled");
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: THEME_COLORS.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

  if (!request) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: THEME_COLORS.background,
          },
        ]}
      >
        <Text style={{ color: THEME_COLORS.textMain }}>Request not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["left", "right"]}
    >
      {/* Dynamic Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={
            isDark
              ? ["#1e293b", "#0f172a"]
              : [COLORS.secondary, COLORS.secondaryDark]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.safeAreaHeader}>
            <View style={{ height: 20 }} />

            <View style={styles.statusContent}>
              <View
                style={[
                  styles.statusIconBox,
                  isDark && { backgroundColor: THEME_COLORS.background },
                ]}
              >
                <MaterialIcons
                  name={
                    request.status === "completed"
                      ? "check-circle"
                      : "engineering"
                  }
                  size={32}
                  color={THEME_COLORS.primary}
                />
              </View>
              <Text style={[styles.statusTitle, { color: "white" }]}>
                {request.status
                  ? request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)
                  : "Pending"}
              </Text>
              <Text
                style={[styles.statusSub, { color: "rgba(255,255,255,0.8)" }]}
              >
                {request.status === "pending"
                  ? "Waiting for a worker to accept"
                  : request.status === "in_progress"
                    ? "Worker is on the way or working"
                    : request.status === "cancelled"
                      ? "This request was cancelled"
                      : "Worker assigned"}
              </Text>

              <View
                style={[
                  styles.idBadge,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text style={[styles.idText, { color: "white" }]}>
                  ID: #{request.id?.slice(-6).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Decorative bottom curve */}
          <View style={styles.bottomCurve} />
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Finding Animation (Show when pending) */}
        {request.status === "pending" && (
          <View
            style={[
              styles.findingCard,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <View style={styles.findingContent}>
              <View style={styles.radarContainer}>
                <Animated.View
                  style={[
                    styles.pulseCircle,
                    {
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2.5],
                          }),
                        },
                      ],
                      opacity: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0],
                      }),
                    },
                  ]}
                />
                <View
                  style={[
                    styles.centerIcon,
                    { backgroundColor: THEME_COLORS.primary },
                  ]}
                >
                  <MaterialIcons name="search" size={24} color="white" />
                </View>
              </View>
              <Text
                style={[styles.findingTitle, { color: THEME_COLORS.textMain }]}
              >
                Finding nearby workers...
              </Text>
              <Text
                style={[styles.findingSub, { color: THEME_COLORS.textSub }]}
              >
                We're notifying professionals in your area. This usually takes
                less than 2 minutes.
              </Text>
            </View>
          </View>
        )}

        {/* Map Section */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: THEME_COLORS.surface,
              borderColor: THEME_COLORS.border,
            },
          ]}
        >
          <View
            style={[
              styles.mapPlaceholder,
              { backgroundColor: THEME_COLORS.background },
            ]}
          >
            {/* In a real app, this would be a MapView */}
            <Image
              source={{
                uri: isDark
                  ? "https://via.placeholder.com/600x300/1e293b/94a3b8?text=Map+View"
                  : "https://via.placeholder.com/600x300/e2e8f0/94a3b8?text=Map+View",
              }}
              style={styles.mapImage}
            />
            <View style={styles.centerMarker}>
              <View style={styles.pingAnimation} />
              <View style={styles.markerPin}>
                <MaterialIcons name="two-wheeler" size={14} color="white" />
              </View>
            </View>
            <View
              style={[
                styles.locateBtn,
                { backgroundColor: THEME_COLORS.surface },
              ]}
            >
              <MaterialIcons
                name="my-location"
                size={20}
                color={THEME_COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.cardPadding}>
            <View style={styles.locationRow}>
              <View>
                <Text
                  style={[styles.sectionLabel, { color: THEME_COLORS.primary }]}
                >
                  Service Location
                </Text>
                <Text
                  style={[
                    styles.locationMain,
                    { color: THEME_COLORS.textMain },
                  ]}
                >
                  {request.address || "Address not provided"}
                </Text>
                <Text
                  style={[styles.locationSub, { color: THEME_COLORS.textSub }]}
                >
                  Sri Lanka
                </Text>
              </View>
              <TouchableOpacity>
                <Text
                  style={[styles.linkText, { color: THEME_COLORS.primary }]}
                >
                  Get Directions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View
          style={[
            styles.card,
            styles.cardPadding,
            {
              backgroundColor: THEME_COLORS.surface,
              borderColor: THEME_COLORS.border,
            },
          ]}
        >
          <View style={styles.cornerDecor} />

          <View style={styles.serviceHeader}>
            <View>
              <Text
                style={[styles.serviceTitle, { color: THEME_COLORS.textMain }]}
              >
                {request.serviceType || "Service"}
              </Text>
              <Text
                style={[styles.serviceSub, { color: THEME_COLORS.textSub }]}
              >
                {request.budget ? `Budget: LKR ${request.budget}` : ""}
              </Text>
            </View>
            <View
              style={[
                styles.serviceIconBadge,
                {
                  backgroundColor: isDark ? THEME_COLORS.background : "#f0fdf4",
                },
              ]}
            >
              <MaterialIcons
                name="plumbing"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: THEME_COLORS.border,
                borderColor: THEME_COLORS.border,
              },
            ]}
          />

          <View style={styles.dateTimeGrid}>
            <View>
              <View style={styles.iconLabelRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={14}
                  color={THEME_COLORS.textSub}
                />
                <Text
                  style={[styles.miniLabel, { color: THEME_COLORS.textSub }]}
                >
                  Date
                </Text>
              </View>
              <Text
                style={[styles.mainValue, { color: THEME_COLORS.textMain }]}
              >
                {request.scheduledDate || "N/A"}
              </Text>
            </View>
            <View>
              <View style={styles.iconLabelRow}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color={THEME_COLORS.textSub}
                />
                <Text
                  style={[styles.miniLabel, { color: THEME_COLORS.textSub }]}
                >
                  Time
                </Text>
              </View>
              <Text
                style={[styles.mainValue, { color: THEME_COLORS.textMain }]}
              >
                {request.scheduledTime || "N/A"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.noteBox,
              {
                backgroundColor: THEME_COLORS.background,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <Text style={[styles.noteText, { color: THEME_COLORS.textSub }]}>
              <Text
                style={{ fontWeight: "bold", color: THEME_COLORS.textMain }}
              >
                Note:{" "}
              </Text>
              "{request.description || "No description provided."}"
            </Text>
          </View>
        </View>

        {/* Assigned Pro */}
        {request.workerId && worker && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <View
              style={[
                styles.proHeader,
                {
                  backgroundColor: isDark ? THEME_COLORS.background : "#eff6ff",
                  borderBottomColor: THEME_COLORS.border,
                },
              ]}
            >
              <View style={styles.proTitleRow}>
                <MaterialIcons
                  name="badge"
                  size={16}
                  color={THEME_COLORS.primary}
                />
                <Text
                  style={[
                    styles.proHeaderTitle,
                    { color: THEME_COLORS.primary },
                  ]}
                >
                  Assigned Pro
                </Text>
              </View>
              {worker.verified !== false && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              )}
            </View>

            <View style={styles.cardPadding}>
              <View style={styles.proInfoRow}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri:
                        worker.image ||
                        "https://ui-avatars.com/api/?name=" + worker.name,
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.starBadge}>
                    <MaterialIcons name="star" size={10} color="white" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.proName, { color: THEME_COLORS.textMain }]}
                  >
                    {worker.name}
                  </Text>
                  <Text
                    style={[styles.proSub, { color: THEME_COLORS.textSub }]}
                  >
                    {worker.role || "Professional"} •{" "}
                    {worker.experience || "Expert"}
                  </Text>
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingBox}>
                      <Text style={styles.ratingText}>
                        {worker.rating || "5.0"}
                      </Text>
                      <MaterialIcons name="star" size={10} color="#eab308" />
                    </View>
                    <Text
                      style={[
                        styles.reviewCount,
                        { color: THEME_COLORS.textSub },
                      ]}
                    >
                      ({worker.reviews || 0} Reviews)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionBtn}>
                  <MaterialIcons name="call" size={24} color="#15803d" />
                  <Text style={[styles.actionLabel, { color: "#15803d" }]}>
                    Call
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isDark
                        ? THEME_COLORS.background
                        : "#eff6ff",
                      borderColor: isDark ? THEME_COLORS.border : "#dbeafe",
                    },
                  ]}
                  onPress={() => router.push("/(tabs)/inbox")}
                >
                  <MaterialIcons
                    name="chat-bubble-outline"
                    size={24}
                    color={THEME_COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: THEME_COLORS.primary },
                    ]}
                  >
                    Chat
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: THEME_COLORS.background,
                      borderColor: THEME_COLORS.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="person-outline"
                    size={24}
                    color={THEME_COLORS.primary}
                  />
                  <Text
                    style={[
                      styles.actionLabel,
                      { color: THEME_COLORS.primary },
                    ]}
                  >
                    Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View
          style={[
            styles.card,
            styles.cardPadding,
            {
              backgroundColor: THEME_COLORS.surface,
              borderColor: THEME_COLORS.border,
            },
          ]}
        >
          <View style={styles.timelineHeader}>
            <View
              style={[
                styles.vertBar,
                { backgroundColor: THEME_COLORS.primary },
              ]}
            />
            <Text
              style={[styles.sectionTitle, { color: THEME_COLORS.textMain }]}
            >
              Activity Timeline
            </Text>
          </View>

          <View style={styles.timelineContainer}>
            {/* Dynamic Status-based Timeline */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor:
                        request.status === "completed"
                          ? "#16a34a"
                          : THEME_COLORS.primary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: THEME_COLORS.border },
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineRow}>
                  <View>
                    <Text
                      style={[
                        styles.timelineTitle,
                        { color: THEME_COLORS.textMain },
                      ]}
                    >
                      {request.status === "completed"
                        ? "Service Completed"
                        : request.status === "active"
                          ? "Service in Progress"
                          : request.status === "accepted"
                            ? (worker?.name || "Professional") +
                              " is confirmed."
                            : "Request Pending"}
                    </Text>
                    <Text
                      style={[
                        styles.timelineSub,
                        { color: THEME_COLORS.textSub },
                      ]}
                    >
                      {request.status === "completed"
                        ? "Your service has been finished."
                        : request.status === "active"
                          ? "The worker is currently at your location."
                          : request.status === "accepted"
                            ? (worker?.name || "Professional") +
                              " is confirmed."
                            : "Waiting for worker confirmation."}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[styles.timelineDot, { backgroundColor: "#22c55e" }]}
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineRow}>
                  <View>
                    <Text
                      style={[
                        styles.timelineTitle,
                        { color: THEME_COLORS.textMain },
                      ]}
                    >
                      Request Created
                    </Text>
                    <Text
                      style={[
                        styles.timelineSub,
                        { color: THEME_COLORS.textSub },
                      ]}
                    >
                      You submitted the {request.serviceType || "request"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footerButtons}>
          {request.status === "completed" && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.completeBtnBtnWrapper}
              onPress={() =>
                router.push({
                  pathname: "/payment",
                  params: {
                    id: request.id,
                    amount: request.budget || "5000", // Defaulting if not present
                    serviceType: request.serviceType,
                  },
                })
              }
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeBtn}
              >
                <MaterialIcons
                  name="check-circle-outline"
                  size={20}
                  color="white"
                />
                <Text style={styles.completeBtnText}>Proceed to Payment</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {(!request.status || request.status === "pending") && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  headerContainer: {
    overflow: "hidden",
    backgroundColor: COLORS.secondary,
  },
  headerGradient: {
    paddingBottom: 30,
  },
  safeAreaHeader: {
    //
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  statusContent: {
    alignItems: "center",
    marginTop: 10,
    paddingBottom: 20,
  },
  statusIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 14,
    color: "#bfdbfe", // blue-100
    marginBottom: 16,
  },
  idBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  idText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 0.5,
  },
  bottomCurve: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardPadding: {
    padding: 20,
  },
  mapPlaceholder: {
    height: 180,
    width: "100%",
    backgroundColor: "#e2e8f0",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  centerMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pingAnimation: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    opacity: 0.3,
    transform: [{ scale: 1.5 }],
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  locateBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  locationMain: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  locationSub: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.secondary,
    textDecorationLine: "underline",
  },
  cornerDecor: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderBottomLeftRadius: 60,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  serviceSub: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  serviceIconBadge: {
    backgroundColor: "#064e3b",
    padding: 10,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 1,
    marginBottom: 16,
  },
  dateTimeGrid: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 16,
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  miniLabel: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  mainValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMain,
  },
  noteBox: {
    backgroundColor: "#020617",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  noteText: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
    lineHeight: 18,
  },
  findingCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    overflow: "hidden",
  },
  findingContent: {
    alignItems: "center",
  },
  radarContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  pulseCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
  },
  centerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  findingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  findingSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  proHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  proTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proHeaderTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#10B981",
  },
  proInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  starBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.secondary,
    padding: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0f172a",
  },
  proName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  proSub: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    borderColor: "#eab308",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ca8a04",
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  vertBar: {
    width: 4,
    height: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  timelineContainer: {
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineLeft: {
    alignItems: "center",
    width: 20,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#020617",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    zIndex: 10,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#1e293b", // solid
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  timelineSub: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 2,
  },
  timeBadge: {
    backgroundColor: "#020617",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: COLORS.textSub,
  },
  footerButtons: {
    marginBottom: 20,
  },
  completeBtnBtnWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  completeBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.red500,
    fontSize: 14,
    fontWeight: "bold",
  },
});
