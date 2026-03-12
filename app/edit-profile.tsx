import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { useTheme, getColors } from "../contexts/ThemeContext";
import { useSession } from "../ctx";
import { db } from "../utils/firebaseConfig";
import { SRI_LANKA_DISTRICTS } from "../constants/Districts";

const COLORS = {
  primary: "#10b981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user._id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.displayName || "");
          setPhone(data.phoneNumber || "");
          setAddress(data.address || "");
          setCity(data.city || "");
          setDistrict(data.district || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [user?._id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setLoading(true);
    try {
      if (user?._id) {
        await updateDoc(doc(db, "users", user._id), {
          displayName: name,
          phoneNumber: phone,
          address: address,
          city: city,
          district: district,
        });
        Alert.alert("Success", "Profile updated successfully");
        router.back();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["top", "left", "right"]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: THEME_COLORS.surface,
            borderBottomColor: THEME_COLORS.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={THEME_COLORS.textMain}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: THEME_COLORS.textMain }]}>
          Edit Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.inputSection,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                Full Name
              </Text>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={THEME_COLORS.textSub}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                Phone Number
              </Text>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+94 XX XXX XXXX"
                placeholderTextColor={THEME_COLORS.textSub}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                Address
              </Text>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    height: 80,
                    textAlignVertical: "top",
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={address}
                onChangeText={setAddress}
                placeholder="Street address"
                placeholderTextColor={THEME_COLORS.textSub}
                multiline
              />
            </View>

            <View style={{ flexDirection: "row", gap: 16 }}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                  City
                </Text>
                <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                  style={[
                    styles.input,
                    {
                      color: THEME_COLORS.textMain,
                      backgroundColor: THEME_COLORS.background,
                      borderColor: THEME_COLORS.border,
                    },
                  ]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Vavuniya"
                  placeholderTextColor={THEME_COLORS.textSub}
                />
              </View>

              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={[styles.label, { color: THEME_COLORS.textSub }]}>
                  District
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    {
                      justifyContent: "center",
                      backgroundColor: THEME_COLORS.background,
                      borderColor: THEME_COLORS.border,
                    },
                  ]}
                  onPress={() => setShowDistrictPicker(true)}
                >
                  <Text
                    style={{
                      color: district ? THEME_COLORS.textMain : THEME_COLORS.textSub,
                    }}
                  >
                    {district || "Select District"}
                  </Text>
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
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: THEME_COLORS.surface },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text
                      style={[
                        styles.modalTitle,
                        { color: THEME_COLORS.textMain },
                      ]}
                    >
                      Select District
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDistrictPicker(false)}
                    >
                      <MaterialIcons
                        name="close"
                        size={24}
                        color={THEME_COLORS.textMain}
                      />
                    </TouchableOpacity>
                  </View>
                  <ScrollView contentContainerStyle={styles.districtList}>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.districtItem,
                          district === d && {
                            backgroundColor: THEME_COLORS.primary + "20",
                          },
                        ]}
                        onPress={() => {
                          setDistrict(d);
                          setShowDistrictPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.districtText,
                            {
                              color:
                                district === d
                                  ? THEME_COLORS.primary
                                  : THEME_COLORS.textMain,
                            },
                          ]}
                        >
                          {d}
                        </Text>
                        {district === d && (
                          <MaterialIcons
                            name="check"
                            size={20}
                            color={THEME_COLORS.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: THEME_COLORS.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    gap: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSub,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textMain,
    backgroundColor: "#f8fafc",
  },
  simBtn: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
