import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRequest } from "../contexts/RequestContext";

const COLORS = {
  primary: "#118A7E",
  primaryDark: "#0e7066",
  backgroundLight: "#F8FAFC",
  surfaceLight: "#FFFFFF",
  textLight: "#1e293b", // slate-800
  textGray: "#64748b", // slate-500
  borderLight: "#e2e8f0",
  secondary: "#0E7490", // cyan-700
  lowUrgency: "#3b82f6", // blue-500
  normalUrgency: "#f59e0b", // amber-500
  highUrgency: "#ef4444", // red-500
};

type UrgencyLevel = "low" | "normal" | "high";

export default function RequestDetailsScreen() {
  const router = useRouter();
  const { requestData, setRequestData } = useRequest();

  const [description, setDescription] = useState(requestData.description || "");
  const [urgency, setUrgency] = useState<UrgencyLevel>(
    requestData.urgency || "normal",
  );
  // Mock photos for now, ideally string URIs
  const [photos, setPhotos] = useState<string[]>(requestData.photos || []);

  const handleNext = () => {
    if (!description.trim()) {
      Alert.alert(
        "Missing Detail",
        "Please describe the issue to help the worker.",
      );
      return;
    }
    setRequestData({ ...requestData, description, urgency, photos });
    router.push("/request-location");
  };

  const handleAddPhoto = () => {
    // Mock photo add
    if (photos.length < 5) {
      setPhotos([...photos, `mock-photo-${photos.length + 1}`]);
    } else {
      Alert.alert("Limit Reached", "You can only add up to 5 photos.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundLight}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 2 Card */}
          <View style={styles.stepCardContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.stepCardGradient}
            >
              {/* Abstract Background Shapes */}
              <View style={styles.abstractShape1} />
              <View style={styles.abstractShape2} />

              <View style={styles.stepCardContent}>
                <View style={styles.stepInfoRow}>
                  <View>
                    <Text style={styles.stepLabel}>STEP 2 OF 4</Text>
                    <Text style={styles.stepTitle}>Describe Issue</Text>
                  </View>
                  <FileText size={32} color="rgba(255,255,255,0.8)" />
                </View>

                <View style={styles.progressBarBg}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Description Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Describe the issue</Text>
            <Text style={styles.sectionSubtitle}>
              Be as specific as possible
            </Text>
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. My kitchen sink is leaking from the pipe joint..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Photos Section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Add Photos/Videos</Text>
            <Text style={styles.sectionSubtitle}>Optional but helpful</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}
          >
            <TouchableOpacity
              style={[
                styles.addPhotoBtn,
                {
                  backgroundColor: "#f1f5f9",
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                },
              ]}
              onPress={handleAddPhoto}
            >
              <Camera size={24} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
            {photos.map((p, i) => (
              <View key={i} style={styles.photoItem}>
                {/* Mock Image Placeholder */}
                <View
                  style={[styles.photoMock, { backgroundColor: "#e2e8f0" }]}
                >
                  <ImageIcon size={20} color="#94a3b8" />
                </View>
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() =>
                    setPhotos(photos.filter((_, idx) => idx !== i))
                  }
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Urgency Section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.sectionTitle}>Urgency</Text>
              <AlertCircle size={14} color="#94a3b8" />
            </View>
          </View>

          <View style={styles.urgencyGrid}>
            <TouchableOpacity
              style={[
                styles.urgencyCard,
                urgency === "low" && {
                  borderColor: COLORS.lowUrgency,
                  backgroundColor: "#eff6ff",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setUrgency("low")}
            >
              <View
                style={[
                  styles.urgencyIcon,
                  {
                    backgroundColor:
                      urgency === "low" ? COLORS.lowUrgency : "#e2e8f0",
                  },
                ]}
              >
                {/* Simple circle or icon */}
              </View>
              <Text
                style={[
                  styles.urgencyLabel,
                  urgency === "low" && {
                    color: COLORS.lowUrgency,
                    fontWeight: "700",
                  },
                ]}
              >
                Low
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.urgencyCard,
                urgency === "normal" && {
                  borderColor: COLORS.normalUrgency,
                  backgroundColor: "#fffbeb",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setUrgency("normal")}
            >
              <View
                style={[
                  styles.urgencyIcon,
                  {
                    backgroundColor:
                      urgency === "normal" ? COLORS.normalUrgency : "#e2e8f0",
                  },
                ]}
              />
              <Text
                style={[
                  styles.urgencyLabel,
                  urgency === "normal" && {
                    color: COLORS.normalUrgency,
                    fontWeight: "700",
                  },
                ]}
              >
                Normal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.urgencyCard,
                urgency === "high" && {
                  borderColor: COLORS.highUrgency,
                  backgroundColor: "#fef2f2",
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setUrgency("high")}
            >
              <View
                style={[
                  styles.urgencyIcon,
                  {
                    backgroundColor:
                      urgency === "high" ? COLORS.highUrgency : "#e2e8f0",
                  },
                ]}
              />
              <Text
                style={[
                  styles.urgencyLabel,
                  urgency === "high" && {
                    color: COLORS.highUrgency,
                    fontWeight: "700",
                  },
                ]}
              >
                High
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Footer Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.nextButtonWrapper}
          activeOpacity={0.9}
          onPress={handleNext}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>NEXT STEP</Text>
            <ArrowRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  stepCardContainer: {
    paddingHorizontal: 0,
    marginBottom: 24,
  },
  stepCardGradient: {
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
    position: "relative",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  abstractShape1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    transform: [{ scale: 1.2 }],
  },
  abstractShape2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  stepCardContent: {
    zIndex: 1,
  },
  stepInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  textAreaContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    height: 160,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  charCount: {
    textAlign: "right",
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 4,
  },
  photoList: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  photoItem: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  photoMock: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhoto: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 4,
  },
  urgencyGrid: {
    flexDirection: "row",
    gap: 12,
  },
  urgencyCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  urgencyIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  nextButtonWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
