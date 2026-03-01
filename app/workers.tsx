import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { getColors, useTheme } from "../contexts/ThemeContext";

const DISTRICTS = [
  "All",
  "Colombo",
  "Gampaha",
  "Kandy",
  "Galle",
  "Jaffna",
  "Matara",
  "Kurunegala",
];

const DUMMY_WORKERS = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  name: [
    "Aruna Perera",
    "Kasun Silva",
    "Nuwan Jayawardena",
    "Saman Kumara",
    "Sunil Gamage",
    "Dilshan Mendis",
    "Kamal Wickramasinghe",
    "Nimal Ranjith",
    "Ajith Peiris",
    "Sanjeewa Gamage",
    "Lahiru Udara",
    "Thilina Dias",
    "Roshan Gunaratne",
    "Pathum Nissanka",
    "Wanindu Hasaranga",
    "Kusal Perera",
    "Angelo Mathews",
    "Dimuth Karunaratne",
    "Dinesh Chandimal",
    "Suranga Lakmal",
  ][i],
  role: ["Plumber", "painter", "mason", "cleaner"][i % 5],
  rating: (3.5 + Math.random() * 1.5).toFixed(1),
  reviews: Math.floor(Math.random() * 200) + 10,
  district: DISTRICTS[1 + (i % (DISTRICTS.length - 1))],
  experience: `${Math.floor(Math.random() * 10) + 2} Years`,
  price: `${Math.floor(Math.random() * 1000) + 1500}/hr`,
  image: `https://i.pravatar.cc/300?u=${i}`,
}));

export default function WorkersListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";

  const [selectedDistrict, setSelectedDistrict] = useState("All");

  const filteredWorkers = DUMMY_WORKERS.filter(
    (w) => selectedDistrict === "All" || w.district === selectedDistrict,
  );

  const renderWorkerCard = ({ item }: { item: (typeof DUMMY_WORKERS)[0] }) => (
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
      <Image source={{ uri: item.image }} style={styles.workerImage} />
      <View style={styles.workerInfo}>
        <View style={styles.workerHeader}>
          <Text style={[styles.workerName, { color: THEME_COLORS.textMain }]}>
            {item.name}
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
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={[styles.workerRole, { color: THEME_COLORS.primary }]}>
          {item.role}
        </Text>

        <View style={styles.workerMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons
              name="location-on"
              size={14}
              color={THEME_COLORS.textSub}
            />
            <Text style={[styles.metaText, { color: THEME_COLORS.textSub }]}>
              {item.district}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="work" size={14} color={THEME_COLORS.textSub} />
            <Text style={[styles.metaText, { color: THEME_COLORS.textSub }]}>
              {item.experience}
            </Text>
          </View>
        </View>

        <View style={styles.workerFooter}>
          <Text style={[styles.reviewsText, { color: THEME_COLORS.textSub }]}>
            {item.reviews} Reviews
          </Text>
          <Text style={[styles.priceText, { color: THEME_COLORS.textMain }]}>
            Rs. {item.price}
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
      <View style={[styles.header, { borderBottomColor: THEME_COLORS.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={THEME_COLORS.textMain}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: THEME_COLORS.textMain }]}>
          Browse Workers
        </Text>
        <View style={{ width: 40 }} />
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
              No workers found in this district.
            </Text>
          </View>
        }
      />

      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
