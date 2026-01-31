import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
  Search,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
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
  textLight: "#1e293b",
  textGray: "#64748b",
  borderLight: "#e2e8f0",
  secondary: "#0E7490",
};

import DateTimePicker from "@react-native-community/datetimepicker";

// ... (imports remain)

export default function RequestLocationScreen() {
  const router = useRouter();
  const { requestData, setRequestData } = useRequest();

  const [address, setAddress] = useState(requestData.address || "");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isFlexible, setIsFlexible] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleNext = () => {
    if (!address.trim()) {
      Alert.alert(
        "Missing Address",
        "Please provide the location for the service.",
      );
      return;
    }
    setRequestData({
      ...requestData,
      address,
      scheduledDate: date.toDateString(),
      scheduledTime: time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    router.push("/review-request");
  };

  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setIsGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        const formattedAddress = `${addr.street || ""} ${addr.name || ""}, ${addr.city || ""}, ${addr.region || ""}`;
        setAddress(formattedAddress.trim().replace(/^,/, "").trim());
      } else {
        Alert.alert("Could not determine address from location");
      }
    } catch (error: any) {
      Alert.alert("Error getting location", error?.message || "Unknown error");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
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
        <Text style={styles.headerTitle}>Location & Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 3 Card */}
          <View style={styles.stepCardContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.stepCardGradient}
            >
              <View style={styles.abstractShape1} />
              <View style={styles.abstractShape2} />

              <View style={styles.stepCardContent}>
                <View style={styles.stepInfoRow}>
                  <View>
                    <Text style={styles.stepLabel}>STEP 3 OF 4</Text>
                    <Text style={styles.stepTitle}>Location & Time</Text>
                  </View>
                  <MapPin size={32} color="rgba(255,255,255,0.8)" />
                </View>

                <View style={styles.progressBarBg}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Location Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Where do you need the service?
            </Text>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.mapPreview}>
              <MapPin size={32} color={COLORS.primary} />
              <Text style={styles.mapText}>Map Preview</Text>
            </View>

            <View style={styles.locationInputContainer}>
              <View style={styles.inputWrapper}>
                <Search size={20} color="#94a3b8" style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter address or landmark"
                  placeholderTextColor="#94a3b8"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
              <TouchableOpacity
                style={styles.currentLocationBtn}
                onPress={handleUseCurrentLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Navigation size={18} color={COLORS.primary} />
                    <Text style={styles.currentLocationText}>
                      Use Current Location
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & Time Section */}
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>When should we arrive?</Text>
          </View>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.pickerIconBg}>
                <Calendar size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerLabel}>Date</Text>
                <Text style={styles.pickerValue}>{date.toDateString()}</Text>
              </View>
              <ChevronDown size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View
                style={[styles.pickerIconBg, { backgroundColor: "#fff7ed" }]}
              >
                <Clock size={20} color="#f97316" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerLabel}>Time</Text>
                <Text style={styles.pickerValue}>
                  {time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <ChevronDown size={20} color="#cbd5e1" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}
          </View>

          {/* Flexible Toggle */}
          <View style={styles.flexibleContainer}>
            <View style={styles.flexibleLeft}>
              <View
                style={[
                  styles.checkCircle,
                  isFlexible && { backgroundColor: "#dcfce7" },
                ]}
              >
                <CheckCircle
                  size={20}
                  color={isFlexible ? "#16a34a" : "#cbd5e1"}
                />
              </View>
              <View>
                <Text style={styles.flexibleTitle}>I'm Flexible</Text>
                <Text style={styles.flexibleSub}>
                  Work can start +/- 1 hour
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e2e8f0", true: COLORS.primary }}
              thumbColor={"white"}
              ios_backgroundColor="#e2e8f0"
              onValueChange={setIsFlexible}
              value={isFlexible}
            />
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
            <Text style={styles.nextButtonText}>REVIEW REQUEST</Text>
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
    width: "75%",
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
  locationCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    gap: 16,
  },
  mapPreview: {
    height: 120,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  locationInputContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textLight,
  },
  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  currentLocationText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  dateTimeContainer: {
    gap: 12,
  },
  pickerButton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pickerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 2,
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  flexibleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  flexibleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  flexibleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  flexibleSub: {
    fontSize: 12,
    color: "#94a3b8",
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
