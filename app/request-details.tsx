import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircle, ArrowRight, FileText } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useRequest } from "../contexts/RequestContext";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
  lowUrgency: "#3b82f6",
  normalUrgency: "#f59e0b",
  highUrgency: "#ef4444",
};

type UrgencyLevel = "low" | "normal" | "high";

export default function RequestDetailsScreen() {
  const router = useRouter();
  const { requestData, setRequestData } = useRequest();

  const [description, setDescription] = useState(requestData.description || "");
  const [budget, setBudget] = useState(requestData.budget || "");
  const [urgency, setUrgency] = useState<UrgencyLevel>(
    requestData.urgency || "normal",
  );
  const [photos, setPhotos] = useState<string[]>(requestData.photos || []);

  const handleNext = () => {
    if (!description.trim()) {
      Alert.alert(
        "Missing Detail",
        "Please describe the issue to help the worker.",
      );
      return;
    }
    if (!budget.trim()) {
      Alert.alert(
        "Missing Budget",
        "Please provide an estimated budget for the service.",
      );
      return;
    }
    setRequestData({ ...requestData, description, urgency, budget, photos });
    router.push("/request-location");
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit Reached", "You can only add up to 5 photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...selectedUris]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textMain }]}>
          Request Details
        </Text>
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
            <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
              style={styles.textArea}
              placeholder="e.g. My kitchen sink is leaking from the pipe joint..."
              placeholderTextColor={COLORS.textSub}
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Budget Section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <Text style={styles.sectionSubtitle}>Estimated budget in LKR</Text>
          </View>

          <View
            style={[
              styles.textAreaContainer,
              { height: 56, paddingVertical: 0, justifyContent: "center" },
            ]}
          >
            <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
              style={[
                styles.textArea,
                { lineHeight: undefined, height: "100%", paddingVertical: 16 },
              ]}
              placeholder="e.g. 5000"
              placeholderTextColor={COLORS.textSub}
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
          </View>

          {/* Photo Section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Add Photos</Text>
            <Text style={styles.sectionSubtitle}>
              Upload up to 5 photos of the issue
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
            <TouchableOpacity 
              style={[
                styles.addPhotoBtn, 
                { 
                  backgroundColor: COLORS.surface, 
                  borderStyle: 'dashed', 
                  borderWidth: 1, 
                  borderColor: COLORS.primary 
                }
              ]} 
              onPress={handleAddPhoto}
            >
              <MaterialIcons name="add-a-photo" size={24} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>

            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image 
                  source={{ uri: photo }} 
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <TouchableOpacity 
                  style={styles.removePhoto}
                  onPress={() => removePhoto(index)}
                >
                  <MaterialIcons name="close" size={16} color="white" />
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
              <AlertCircle size={14} color={COLORS.textSub} />
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
                      urgency === "low" ? COLORS.lowUrgency : COLORS.border,
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
                      urgency === "normal"
                        ? COLORS.normalUrgency
                        : COLORS.border,
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
                      urgency === "high" ? COLORS.highUrgency : COLORS.border,
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

          <View style={styles.continueButtonContainer}>
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
        </ScrollView>
      </View>

      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
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
    shadowColor: COLORS.primaryDark,
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
    backgroundColor: "rgba(255,255,255,0.05)",
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
    textTransform: "uppercase",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    color: COLORS.textMain,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSub,
    marginTop: 2,
  },
  textAreaContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 16,
    height: 160,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: "#f8fafc",
    lineHeight: 22,
  },
  charCount: {
    textAlign: "right",
    fontSize: 11,
    color: COLORS.textSub,
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
    backgroundColor: "#0f172a",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1e293b",
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
    color: COLORS.textSub,
  },
  continueButtonContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
