import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { getColors, useTheme } from "../contexts/ThemeContext";
import { db } from "../utils/firebaseConfig";

import { SRI_LANKA_DISTRICTS } from "../constants/Districts";

const DISTRICTS = ["All", ...SRI_LANKA_DISTRICTS];

// Local constants and types removed to use database data

export default function WorkersListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";

  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch workers from users collection where role is worker
    const q = query(collection(db, "users"), where("role", "==", "worker"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const workersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorkers(workersList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching workers:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const matchesDistrict =
      selectedDistrict === "All" ||
      worker.district?.toLowerCase() === selectedDistrict.toLowerCase() ||
      worker.city?.toLowerCase() === selectedDistrict.toLowerCase();

    const searchLower = searchQuery.toLowerCase();
    const name = (worker.fullName || worker.name || "").toLowerCase();
    const role = (
      worker.workerRole ||
      worker.category ||
      worker.serviceCategory ||
      ""
    ).toLowerCase();

    const matchesSearch =
      name.includes(searchLower) || role.includes(searchLower);

    return matchesDistrict && matchesSearch;
  });

  const renderWorkerCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.workerCard,
        {
          backgroundColor: THEME_COLORS.surface,
          borderColor: THEME_COLORS.border,
        },
      ]}
      onPress={() =>
        router.push({
          pathname: "/create-request",
          params: { workerId: item.id },
        })
      }
    >
      <Image
        source={{
          uri:
            item.profileImage ||
            item.image ||
            `https://i.pravatar.cc/300?u=${item.id}`,
        }}
        style={styles.workerImage}
      />
      <View style={styles.workerInfo}>
        <View style={styles.workerHeader}>
          <Text style={[styles.workerName, { color: THEME_COLORS.textMain }]}>
            {item.fullName || item.name || "FixMate Worker"}
          </Text>

          <View
            style={[
              styles.ratingBadge,
              {
                backgroundColor: isDark ? "rgba(234, 179, 8, 0.15)" : "#fefceb",
              },
            ]}
          >
            <MaterialIcons name="star" size={14} color="#eab308" />
            <Text style={styles.ratingText}>{item.rating || "5.0"}</Text>
          </View>
        </View>

        <Text style={[styles.workerRole, { color: THEME_COLORS.primary }]}>
          {item.workerRole ||
            item.category ||
            item.serviceCategory ||
            "Professional"}
        </Text>

        <View style={styles.workerMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons
              name="location-on"
              size={14}
              color={THEME_COLORS.textSub}
            />
            <Text style={[styles.metaText, { color: THEME_COLORS.textSub }]}>
              {item.district || item.city || "Unknown"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="work" size={14} color={THEME_COLORS.textSub} />
            <Text style={[styles.metaText, { color: THEME_COLORS.textSub }]}>
              {item.experience || "2+ Years"}
            </Text>
          </View>
        </View>

        <View style={styles.workerFooter}>
          <Text style={[styles.reviewsText, { color: THEME_COLORS.textSub }]}>
            {item.reviews || 0} Reviews
          </Text>
          <Text style={[styles.priceText, { color: THEME_COLORS.textMain }]}>
            Rs. {item.hourlyRate || item.price || "1500"}/hr
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: THEME_COLORS.surface,
              borderColor: THEME_COLORS.border,
            },
          ]}
        >
          <MaterialIcons name="search" size={20} color={THEME_COLORS.textSub} />
          <TextInput
            placeholder="Search workers by name or skill..."
            placeholderTextColor={THEME_COLORS.textSub}
            style={[styles.searchInput, { color: THEME_COLORS.textMain }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons
                name="close"
                size={20}
                color={THEME_COLORS.textSub}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: THEME_COLORS.textMain }]}>
          Filter by District
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {DISTRICTS.map((district) => (
            <TouchableOpacity
              key={district}
              style={[
                styles.filterChip,
                {
                  backgroundColor: THEME_COLORS.surface,
                  borderColor: THEME_COLORS.border,
                },
                selectedDistrict === district && {
                  backgroundColor: THEME_COLORS.primary,
                  borderColor: THEME_COLORS.primary,
                },
              ]}
              onPress={() => setSelectedDistrict(district)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: THEME_COLORS.textSub },
                  selectedDistrict === district && { color: "white" },
                ]}
              >
                {district}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={[styles.loadingText, { color: THEME_COLORS.textSub }]}>
            Finding professionals...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          renderItem={renderWorkerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons
                name="search-off"
                size={64}
                color={THEME_COLORS.textSub}
              />
              <Text style={[styles.emptyText, { color: THEME_COLORS.textSub }]}>
                No workers found matching your search.
              </Text>
            </View>
          }
        />
      )}

      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterSection: {
    paddingVertical: 16,
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  workerCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  workerImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  workerInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  workerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fefceb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#eab308",
  },
  workerRole: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  workerMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  workerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  reviewsText: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
