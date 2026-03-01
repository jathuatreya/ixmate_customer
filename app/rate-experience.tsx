import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";

// Theme
const COLORS = {
  primary: "#10b981", // Emerald 500
  primaryDark: "#059669", // Emerald 600
  secondary: "#3b82f6", // Blue 500
  backgroundLight: "#f8fafc",
  surfaceLight: "#ffffff",
  textMain: "#0f172a",
  textSub: "#64748b",
  white: "#FFFFFF",
  emerald50: "#ecfdf5",
  emerald100: "#d1fae5",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
};

export default function RateExperienceScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(["Punctual", "Friendly"]);
  const [tipAmount, setTipAmount] = useState("200");

  const tags = [
    "Punctual",
    "Clean Work",
    "Friendly",
    "Expert Knowledge",
    "Fast Service",
  ];
  const tips = ["100", "200", "500", "Custom"];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/800x400" }}
            style={styles.bannerImage}
          />
          <LinearGradient
            colors={["rgba(16, 185, 129, 0.85)", "rgba(16, 185, 129, 0.2)"]}
            style={styles.bannerOverlay}
          />
          <LinearGradient
            colors={["transparent", "rgba(6, 78, 59, 0.6)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.bannerGradientBottom}
          />

          <View style={styles.bannerContent}>
            <View style={styles.completedBadge}>
              <MaterialIcons name="celebration" size={32} color="white" />
              <View style={styles.badgeTextWrapper}>
                <Text style={styles.badgeText}>COMPLETED</Text>
              </View>
            </View>
            <Text style={styles.bannerTitle}>Great Job!</Text>
            <Text style={styles.bannerSubtitle}>
              Service completed successfully.
            </Text>
          </View>
        </View>

        {/* Worker Card */}
        <View style={styles.workerCardWrapper}>
          <View style={styles.workerCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={styles.workerAvatar}
              />
              <View style={styles.verifiedBadge} />
            </View>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>Suresh Perera</Text>
              <View style={styles.workerMeta}>
                <Text style={styles.workerRole}>Electrician</Text>
                <View style={styles.dotSeparator} />
                <Text style={styles.verifiedText}>Verified Pro</Text>
              </View>
            </View>
            <View style={styles.jobIdBadge}>
              <Text style={styles.jobIdLabel}>JOB ID</Text>
              <Text style={styles.jobIdValue}>#8291</Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleCenter}>
            How was your experience?
          </Text>

          {/* Faces */}
          <View style={styles.facesRow}>
            <MaterialIcons
              name="sentiment-very-dissatisfied"
              size={40}
              color={COLORS.slate300}
            />
            <MaterialIcons
              name="sentiment-neutral"
              size={40}
              color={COLORS.slate300}
            />
            <MaterialIcons
              name="sentiment-satisfied"
              size={40}
              color={COLORS.slate300}
            />
            <View style={styles.activeFaceContainer}>
              <View style={styles.pingAnimation} />
              <MaterialIcons
                name="sentiment-very-satisfied"
                size={56}
                color={COLORS.primary}
              />
            </View>
          </View>

          {/* Stars Box */}
          <View style={styles.starsBox}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <MaterialIcons
                  key={s}
                  name="star"
                  size={32}
                  color={COLORS.primary}
                />
              ))}
            </View>
            <Text style={styles.ratingLabel}>EXCELLENT!</Text>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT WENT WELL?</Text>
          <View style={styles.tagsRow}>
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    isSelected ? styles.tagChipSelected : styles.tagChipDefault,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      isSelected
                        ? styles.tagTextSelected
                        : styles.tagTextDefault,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Review Input */}
        <View style={styles.section}>
          <View style={styles.inputWrapper}>
            <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
              style={styles.reviewInput}
              placeholder="Tell us more about the fix... (optional)"
              placeholderTextColor={COLORS.textSub}
              multiline
              numberOfLines={3}
            />
            <MaterialIcons
              name="edit-note"
              size={20}
              color={COLORS.slate300}
              style={styles.inputIcon}
            />
          </View>
        </View>

        {/* Tip Section */}
        <View style={[styles.section, { paddingBottom: 20 }]}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIconBox}>
                <MaterialIcons
                  name="payments"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.tipTitle}>Add a Tip</Text>
                <Text style={styles.tipSubtitle}>100% goes to Suresh</Text>
              </View>
            </View>

            <View style={styles.tipsRow}>
              {tips.map((tip) => {
                const isSelected = tipAmount === tip;
                return (
                  <TouchableOpacity
                    key={tip}
                    style={[
                      styles.tipBtn,
                      isSelected ? styles.tipBtnSelected : styles.tipBtnDefault,
                    ]}
                    onPress={() => setTipAmount(tip)}
                  >
                    <Text
                      style={[
                        styles.tipText,
                        isSelected
                          ? styles.tipTextSelected
                          : styles.tipTextDefault,
                      ]}
                    >
                      {tip === "Custom" ? "Custom" : `LKR ${tip}`}
                    </Text>
                    {isSelected && tip !== "Custom" && (
                      <View style={styles.cornerRibbon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn}>
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>Submit Review</Text>
            <MaterialIcons name="send" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push("/client-home")}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  scrollContent: {
    paddingBottom: 140, // space for footer
  },
  bannerContainer: {
    height: 192,
    position: "relative",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerGradientBottom: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 10,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  badgeTextWrapper: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  bannerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: "#ecfdf5",
    fontSize: 14,
    fontWeight: "500",
  },
  workerCardWrapper: {
    paddingHorizontal: 16,
    marginTop: -32,
    marginBottom: 24,
    zIndex: 20,
  },
  workerCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  avatarContainer: {
    position: "relative",
  },
  workerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: "white",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  workerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  workerRole: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate300,
  },
  verifiedText: {
    fontSize: 14,
    color: COLORS.textSub,
  },
  jobIdBadge: {
    alignItems: "center",
    backgroundColor: COLORS.slate50,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  jobIdLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textSub,
    marginBottom: 2,
  },
  jobIdValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitleCenter: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
    marginBottom: 24,
  },
  facesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  activeFaceContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pingAnimation: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  starsBox: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.emerald100,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  ratingLabel: {
    color: COLORS.primaryDark,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.textSub,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagChipDefault: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.slate200,
  },
  tagChipSelected: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tagTextDefault: {
    color: COLORS.textSub,
  },
  tagTextSelected: {
    color: COLORS.primaryDark,
  },
  inputWrapper: {
    position: "relative",
  },
  reviewInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.textMain,
    textAlignVertical: "top",
    minHeight: 80,
  },
  inputIcon: {
    position: "absolute",
    bottom: 12,
    right: 12,
  },
  tipCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  tipIconBox: {
    padding: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  tipSubtitle: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  tipsRow: {
    flexDirection: "row",
    gap: 12,
  },
  tipBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  tipBtnDefault: {
    backgroundColor: COLORS.slate50,
    borderColor: COLORS.slate200,
  },
  tipBtnSelected: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  tipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tipTextDefault: {
    color: COLORS.textMain,
  },
  tipTextSelected: {
    color: COLORS.primaryDark,
  },
  cornerRibbon: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 12,
    height: 12,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: "45deg" }],
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    gap: 12,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    color: COLORS.textSub,
    fontSize: 14,
    fontWeight: "500",
  },
});
