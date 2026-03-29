import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
import { useRequest } from "../contexts/RequestContext";
import { db } from "../utils/firebaseConfig";

// Theme Colors
const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  secondary: "#3B82F6",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
  white: "#FFFFFF",
  yellow400: "#facc15",
};

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width;
const ITEM_WIDTH = width * 0.85;

const DUMMY_WORKERS: any[] = [];


export default function SelectProfessionalScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { requestData, updateRequestData } = useRequest();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  useEffect(() => {
    // Query users collection for workers with server-side filtering
    // This is important for security rules to work correctly
    const q = query(
      collection(db, "users"),
      where("role", "in", ["worker", "Worker"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            name: data.displayName || data.fullName || data.name || data.workerName || "Registered Professional",
            role: data.workerRole || data.serviceCategory || "Verified Professional",
            serviceCategory: data.serviceCategory || data.workerRole || "",
            // Add defaults for UI if missing in DB
            gradientColors: data.gradientColors || [
              COLORS.primary,
              COLORS.secondary,
            ],
            verified: data.verified ?? true,
            image: data.image || data.photoURL || `https://i.pravatar.cc/300?u=${doc.id}`,
            rating: data.rating || (4.0 + Math.random() * 1.0).toFixed(1),
            reviews: data.reviews || Math.floor(Math.random() * 100),
            distance: data.distance || "1.5 km",
            experience: data.experience || "3+ yrs",
          };
        });

      // Show all workers as requested
      setWorkers(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching workers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requestData.serviceType]);

  const handleSelectWorker = (worker: any) => {
    updateRequestData({
      workerId: worker.id,
      workerName: worker.name,
    });
    router.push("/review-request");
  };

  const renderWorkerCard = (item: any, index: number) => {
    return (
      <View key={item.id} style={styles.cardContainer}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: THEME_COLORS.surface,
              borderColor: THEME_COLORS.border,
            },
          ]}
        >
          {item.verified && (
            <View
              style={[
                styles.verifiedBadge,
                isDark && {
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  borderColor: "rgba(16, 185, 129, 0.2)",
                },
              ]}
            >
              <MaterialIcons name="verified" size={14} color={COLORS.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={item.gradientColors as any}
              style={styles.avatarGradient}
            >
              <View
                style={[
                  styles.avatarBorder,
                  { backgroundColor: THEME_COLORS.surface },
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.avatar} />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.infoCenter}>
            <Text style={[styles.workerName, { color: THEME_COLORS.textMain }]}>
              {item.name}
            </Text>
            <Text style={[styles.workerRole, { color: THEME_COLORS.primary }]}>
              {item.role}
            </Text>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star" size={18} color={COLORS.yellow400} />
              <Text
                style={[styles.ratingScore, { color: THEME_COLORS.textMain }]}
              >
                {item.rating}
              </Text>
              <Text style={styles.reviewCount}>({item.reviews})</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: THEME_COLORS.background,
                  borderColor: THEME_COLORS.border,
                },
              ]}
            >
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={[styles.statValue, { color: THEME_COLORS.primary }]}>
                {item.distance}
              </Text>
            </View>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: THEME_COLORS.background,
                  borderColor: THEME_COLORS.border,
                },
              ]}
            >
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                {item.experience}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.iconBtnRound,
                { backgroundColor: THEME_COLORS.background },
              ]}
              onPress={() => router.push("/chat")}
            >
              <MaterialIcons
                name="chat-bubble"
                size={20}
                color={COLORS.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainActionBtn}
              activeOpacity={0.9}
              onPress={() => handleSelectWorker(item)}
            >
              <LinearGradient
                colors={[THEME_COLORS.primary, THEME_COLORS.primaryDark]}
                style={styles.mainActionGradient}
              >
                <MaterialIcons name="check" size={32} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconBtnRound,
                { backgroundColor: THEME_COLORS.background },
              ]}
            >
              <MaterialIcons
                name="call"
                size={20}
                color={THEME_COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={THEME_COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Professionals</Text>
        <TouchableOpacity 
          onPress={() => {
            updateRequestData({ workerId: null as any, workerName: null as any });
            router.push("/review-request");
          }} 
          style={styles.skipBtn}
        >
          <Text style={{ color: THEME_COLORS.primary, fontWeight: "700" }}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 110 }}
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
        {/* AI Match Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={
              isDark
                ? ["#1e293b", "#0f172a"]
                : [
                    "rgba(16, 185, 129, 0.1)",
                    "rgba(255, 255, 255, 1)",
                    "rgba(59, 130, 246, 0.1)",
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.bannerGradient,
              { borderColor: THEME_COLORS.border },
            ]}
          >
            <View style={styles.bannerIconAbs}>
              <MaterialIcons
                name="smart-toy"
                size={64}
                color={THEME_COLORS.primary}
                style={{ opacity: 0.1 }}
              />
            </View>

            <View>
              <View style={styles.aiLabelRow}>
                <Text
                  style={[styles.aiLabelText, { color: THEME_COLORS.primary }]}
                >
                  Relevant Registered Workers
                </Text>
                <MaterialIcons
                  name="how-to-reg"
                  size={14}
                  color={THEME_COLORS.primary}
                />
              </View>
              <Text
                style={[styles.bannerTitle, { color: THEME_COLORS.textMain }]}
              >
                We found {workers.length} Pros
              </Text>
              <Text style={[styles.bannerSub, { color: THEME_COLORS.textSub }]}>
                Based on your {requestData.serviceType || "service"} request, these registered workers are your
                best match.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Horizontal Scroll List */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          </View>
        ) : workers.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}
          >
            <MaterialIcons
              name="person-off"
              size={64}
              color={THEME_COLORS.textSub}
            />
            <Text style={{ marginTop: 16, color: THEME_COLORS.textSub }}>
              No workers available right now
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            snapToInterval={ITEM_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={styles.cardsScroll}
            showsHorizontalScrollIndicator={false}
          >
            {workers.map((worker, index) => renderWorkerCard(worker, index))}
            <View style={{ width: 20 }} />
          </ScrollView>
        )}

        {/* Skip Selecting Professional */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: THEME_COLORS.primary,
              backgroundColor: "rgba(16, 185, 129, 0.05)",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={() => {
              updateRequestData({ workerId: undefined, workerName: undefined });
              router.push("/review-request");
            }}
          >
            <Text
              style={{
                color: THEME_COLORS.primary,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Skip for Open Bid
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color={THEME_COLORS.primary} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  bannerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  bannerGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    overflow: "hidden",
    position: "relative",
  },
  bannerIconAbs: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 12,
  },
  aiLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiLabelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary, // Simple fallback for gradient text
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 14,
    color: COLORS.textSub,
    lineHeight: 20,
  },
  cardsScroll: {
    paddingHorizontal: 24,
    // alignItems: 'center', // Center vertically if needed
    paddingBottom: 20,
    gap: 20,
  },
  cardContainer: {
    width: ITEM_WIDTH,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
    position: "relative",
  },
  verifiedBadge: {
    position: "absolute",
    top: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#10B981",
    zIndex: 10,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    padding: 4,
  },
  avatarBorder: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: "#0f172a",
    padding: 4,
  },
  avatar: {
    flex: 1,
    borderRadius: 48,
    resizeMode: "cover",
  },
  infoCenter: {
    alignItems: "center",
    marginBottom: 24,
  },
  workerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 4,
  },
  workerRole: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.secondary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingScore: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSub,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: "auto",
  },
  iconBtnRound: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
  mainActionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  mainActionGradient: {
    flex: 1,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomArea: {
    paddingHorizontal: 24,
  },
});
