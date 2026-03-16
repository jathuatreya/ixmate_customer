import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  MapPin,
  Search,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useRequest } from "../contexts/RequestContext";
import { useSession } from "../ctx";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
};

import { SRI_LANKA_DISTRICTS } from "../constants/Districts";
import DateTimePicker from "@react-native-community/datetimepicker";

// ... (imports remain)

export default function RequestLocationScreen() {
  const router = useRouter();
  const { requestData, setRequestData } = useRequest();
  const { user } = useSession();

  const [address, setAddress] = useState(
    requestData.address ||
      (user?.address
        ? `${user.address}${user.city ? ", " + user.city : ""}${user.district ? ", " + user.district : ""}`
        : ""),
  );
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(
    !!requestData.scheduledDate,
  );

  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [customTime, setCustomTime] = useState(requestData.scheduledTime || "");
  const [isTimeSelected, setIsTimeSelected] = useState(
    !!requestData.scheduledTime,
  );

  const [isFlexible, setIsFlexible] = useState(requestData.isFlexible || false);
  const [district, setDistrict] = useState(requestData.district || user?.district || "");
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const timeSlots = [
    "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
    "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM"
  ];

  const handleNext = () => {
    if (!address.trim()) {
      Alert.alert(
        "Missing Address",
        "Please provide the location for the service.",
      );
      return;
    }
    if (!district) {
      Alert.alert(
        "Missing District",
        "Please select a district for the service.",
      );
      return;
    }
    if (!isDateSelected) {
      Alert.alert("Missing Date", "Please select a date for the service.");
      return;
    }
    const finalTime = customTime.trim();

    if (!finalTime) {
      Alert.alert(
        "Missing Time",
        "Please type or select a time for the service.",
      );
      return;
    }

    setRequestData({
      ...requestData,
      address,
      district,
      scheduledDate: date.toDateString(),
      scheduledTime: finalTime,
      isFlexible,
    });
    router.push("/available-workers");
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setIsDateSelected(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textMain }]}>
          Request Location
        </Text>
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
            <View style={styles.locationInputContainer}>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#94a3b8" style={{ marginLeft: 12 }} />
                <TextInput
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  style={styles.input}
                  placeholder="Street address / Building name"
                  placeholderTextColor="#94a3b8"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowDistrictPicker(true)}
              >
                <MapPin size={20} color={COLORS.primary} style={{ marginLeft: 12 }} />
                <View style={{ flex: 1, paddingHorizontal: 12, justifyContent: 'center' }}>
                  <Text style={[styles.input, { color: district ? COLORS.textMain : "#94a3b8", paddingTop: Platform.OS === 'ios' ? 14 : 0 }]}>
                    {district || "Select District"}
                  </Text>
                </View>
                <ChevronDown size={20} color="#94a3b8" style={{ marginRight: 12 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* District Picker Modal */}
          <Modal
            visible={showDistrictPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDistrictPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select District</Text>
                  <TouchableOpacity onPress={() => setShowDistrictPicker(false)}>
                    <MaterialIcons name="close" size={24} color={COLORS.textMain} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.districtList}>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.districtItem,
                        district === d && { backgroundColor: COLORS.primary + "20" },
                      ]}
                      onPress={() => {
                        setDistrict(d);
                        setShowDistrictPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.districtText,
                          { color: district === d ? COLORS.primary : COLORS.textMain },
                        ]}
                      >
                        {d}
                      </Text>
                      {district === d && (
                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

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
                <Text
                  style={[
                    styles.pickerValue,
                    !isDateSelected && styles.placeholderValue,
                  ]}
                >
                  {isDateSelected ? date.toDateString() : "Select Date"}
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
          </View>

          {/* Time Sections */}
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>Preferred time</Text>
            <Text style={styles.sectionSubtitle}>
              Select a preferred arrival time
            </Text>
          </View>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTimeDropdown(true)}
          >
            <View style={[styles.pickerIconBg, { backgroundColor: "#eff6ff" }]}>
              <Clock size={20} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pickerLabel}>Arrival Time</Text>
              <Text
                style={[
                  styles.pickerValue,
                  !customTime && styles.placeholderValue,
                ]}
              >
                {customTime || "Select Time"}
              </Text>
            </View>
            <ChevronDown size={20} color="#cbd5e1" />
          </TouchableOpacity>

          {/* Time Picker Modal */}
          <Modal
            visible={showTimeDropdown}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimeDropdown(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Arrival Time</Text>
                  <TouchableOpacity onPress={() => setShowTimeDropdown(false)}>
                    <MaterialIcons name="close" size={24} color={COLORS.textMain} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.districtList}>
                  {timeSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.districtItem,
                        customTime === slot && { backgroundColor: COLORS.primary + "20" },
                      ]}
                      onPress={() => {
                        setCustomTime(slot);
                        setShowTimeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.districtText,
                          { color: customTime === slot ? COLORS.primary : COLORS.textMain },
                        ]}
                      >
                        {slot}
                      </Text>
                      {customTime === slot && (
                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

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
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={"white"}
              ios_backgroundColor={COLORS.border}
              onValueChange={setIsFlexible}
              value={isFlexible}
            />
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
                <Text style={styles.nextButtonText}>SHOW AVAILABLE WORKERS</Text>
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
    backgroundColor: COLORS.background,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
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
    color: COLORS.textMain,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSub,
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.background,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textMain,
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
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textSub,
    marginBottom: 2,
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  placeholderValue: {
    color: COLORS.textSub,
    fontWeight: "400",
  },
  flexibleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  flexibleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  flexibleSub: {
    fontSize: 12,
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
  customInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  customInputLarge: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: "bold",
    height: 50,
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  suggestionsHeader: {
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "600",
  },
  suggestionsScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  suggestionsContent: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
    alignItems: "center",
  },
  suggestionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSub,
  },
  suggestionTextSelected: {
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  districtList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  districtItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  districtText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
