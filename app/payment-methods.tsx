import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useSession } from "../ctx";
import { getColors, useTheme } from "../contexts/ThemeContext";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const { user } = useSession();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCard, setSavedCard] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchCard() {
      if (!user?._id) return;
      try {
        const docRef = doc(db, "users", user._id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().savedCard) {
          setSavedCard(docSnap.data().savedCard);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    fetchCard();
  }, [user?._id]);

  const handleSaveCard = async () => {
    if (!user?._id) return;

    if (cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Invalid Card", "Please enter a valid 16-digit card number.");
      return;
    }
    if (!expiry.includes("/") || expiry.length < 5) {
      Alert.alert("Invalid Expiry", "Please use MM/YY format.");
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Invalid CVV", "Enter a 3-digit CVV.");
      return;
    }

    setLoading(true);
    const last4 = cardNumber.slice(-4);
    const newCard = {
      last4,
      expiry,
      brand: cardNumber.startsWith("4") ? "Visa" : "Mastercard",
    };

    try {
      await updateDoc(doc(db, "users", user._id), {
        savedCard: newCard,
      });
      setSavedCard(newCard);
      Alert.alert("Success", "Payment method saved successfully!");
      setCardNumber("");
      setExpiry("");
      setCvv("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCard = async () => {
    if (!user?._id) return;
    try {
      await updateDoc(doc(db, "users", user._id), {
        savedCard: null,
      });
      setSavedCard(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      edges={["top", "bottom"]}
    >
      <View style={[styles.header, { borderBottomColor: THEME_COLORS.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={THEME_COLORS.textMain}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: THEME_COLORS.textMain }]}>
          Payment Methods
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {fetching ? (
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        ) : savedCard ? (
          <View
            style={[
              styles.savedCardContainer,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <MaterialIcons
                name="credit-card"
                size={32}
                color={THEME_COLORS.primary}
              />
              <View>
                <Text
                  style={{
                    color: THEME_COLORS.textMain,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  {savedCard.brand} ending in {savedCard.last4}
                </Text>
                <Text
                  style={{
                    color: THEME_COLORS.textSub,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Expires {savedCard.expiry}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemoveCard}>
              <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text
              style={{
                color: THEME_COLORS.textMain,
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              Add New Card
            </Text>

            <View
              style={[
                styles.inputGroup,
                {
                  backgroundColor: THEME_COLORS.surface,
                  borderColor: THEME_COLORS.border,
                },
              ]}
            >
              <MaterialIcons
                name="credit-card"
                size={20}
                color={THEME_COLORS.textSub}
              />
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[styles.input, { color: THEME_COLORS.textMain }]}
                placeholder="Card Number"
                placeholderTextColor={THEME_COLORS.textSub}
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={(text) => {
                  let cleaned = text.replace(/\D/g, "");
                  if (cleaned.length > 16) cleaned = cleaned.substring(0, 16);
                  let formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
                  setCardNumber(formatted);
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={[
                  styles.inputGroup,
                  {
                    flex: 1,
                    backgroundColor: THEME_COLORS.surface,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
              >
                <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                  style={[styles.input, { color: THEME_COLORS.textMain }]}
                  placeholder="MM/YY"
                  placeholderTextColor={THEME_COLORS.textSub}
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/\D/g, "");
                    let formatted = cleaned;
                    if (cleaned.length >= 2) {
                      formatted = cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
                    }
                    setExpiry(formatted);
                  }}
                />
              </View>
              <View
                style={[
                  styles.inputGroup,
                  {
                    flex: 1,
                    backgroundColor: THEME_COLORS.surface,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
              >
                <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                  style={[styles.input, { color: THEME_COLORS.textMain }]}
                  placeholder="CVV"
                  placeholderTextColor={THEME_COLORS.textSub}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length <= 3) {
                      setCvv(cleaned);
                    }
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: THEME_COLORS.primary },
              ]}
              onPress={handleSaveCard}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                >
                  Save Card
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 24,
  },
  savedCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  saveBtn: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});
