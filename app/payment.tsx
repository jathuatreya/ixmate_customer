import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import md5 from "md5";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { BottomNavbar } from "../components/BottomNavbar";
import { useTheme, getColors } from "../contexts/ThemeContext";
import { useSession } from "../ctx";
import { db } from "../utils/firebaseConfig";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
};

// Replace with your actual Sandbox Merchant ID from PayHere Dashboard
// The App ID (e.g. 4OVy...) is NOT the Merchant ID.
// Use "1226190" for the default PayHere Sandbox testing account if you don't have one.
const MERCHANT_ID = "1226190";
const MERCHANT_SECRET = "4jo4hFWB2ii8lweNKXjVOk8lxvQ2AqCQg8mz6C2qrhTi";

export default function PaymentScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const THEME_COLORS = getColors(theme);
  const isDark = theme === "dark";
  const { user } = useSession();
  const { id, amount, serviceType, workerId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Card Info, 2: OTP
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [amountInput, setAmountInput] = useState(amount?.toString() || "");

  const formattedAmount = Number(amount || 0).toFixed(2);

  const handleDummyPay = () => {
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
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    
    // Safety timeout for Firestore operations
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), 10000)
    );

    try {
      // Robust decimal parsing
      const cleanAmount = amountInput.replace(/[^0-9.]/g, '');
      const finalAmount = parseFloat(cleanAmount) || 0;
      
      const requestId = Array.isArray(id) ? id[0] : id;

      if (!requestId || requestId === "undefined") {
         console.warn("No valid Request ID provided for payment");
         throw new Error("Missing request identification. Please restart the payment process.");
      }

      // Run firestore operations with a timeout
      await Promise.race([
        (async () => {
          // Update request status
          await updateDoc(doc(db, "requests", requestId as string), {
            status: "paid",
            paidAmount: finalAmount,
            paymentDate: new Date(),
          });

          // Store payment record in db
          await addDoc(collection(db, "payments"), {
            requestId: requestId,
            jobId: requestId,
            workerId: workerId || null,
            status: "completed",
            userId: user?._id || "guest",
            amount: finalAmount,
            serviceType: serviceType || "FixMate Service",
            paymentMethod: "card",
            timestamp: new Date(),
            cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
          });
        })(),
        timeoutPromise
      ]);

      setLoading(false); 
      
      // Short delay to ensure state update propagates before alert/transition
      setTimeout(() => {
        Alert.alert(
          "Payment Received!",
          `LKR ${finalAmount.toFixed(2)} has been successfully processed.`,
          [
            {
              text: "OK",
              onPress: () => {
                router.push({
                  pathname: "/payment-success",
                  params: { id: requestId as string, amount: finalAmount.toString() },
                });
              },
            },
          ]
        );
      }, 50);

    } catch (error: any) {
      console.error("Payment verification error:", error);
      setLoading(false);
      
      // Delay error alert slightly too
      setTimeout(() => {
        Alert.alert("Error", error.message || "Failed to process payment");
      }, 50);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
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
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={THEME_COLORS.textMain}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: THEME_COLORS.textMain }]}>
          Secure Payment
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark
                ? THEME_COLORS.surface
                : COLORS.primaryDark,
              borderColor: THEME_COLORS.border,
              paddingBottom: 20,
            },
          ]}
        >
          <Text style={styles.summaryLabel}>Total Amount (LKR)</Text>
          <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
            style={[
              styles.amountInput,
              { color: "white" }
            ]}
            value={amountInput}
            onChangeText={setAmountInput}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <Text style={styles.summaryService}>
            {serviceType || "FixMate Service"}
          </Text>

          {/* Fee Breakdown */}
          <View style={styles.breakdownBox}>
             <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Commission (10%)</Text>
                <Text style={styles.breakdownValue}>LKR {(parseFloat(amountInput || "0") * 0.1).toFixed(2)}</Text>
             </View>
             <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tax (5%)</Text>
                <Text style={styles.breakdownValue}>LKR {(parseFloat(amountInput || "0") * 0.05).toFixed(2)}</Text>
             </View>
             <View style={styles.paymentDivider} />
             <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { fontWeight: 'bold' }]}>Net Service Amount</Text>
                <Text style={[styles.breakdownValue, { fontWeight: 'bold' }]}>LKR {(parseFloat(amountInput || "0") * 0.85).toFixed(2)}</Text>
             </View>
          </View>
        </View>

        {step === 1 ? (
          <View
            style={[
              styles.formContainer,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <Text style={[styles.formTitle, { color: THEME_COLORS.textMain }]}>
              Card Details
            </Text>

            <View style={styles.inputBox}>
              <Text
                style={[styles.inputLabel, { color: THEME_COLORS.textSub }]}
              >
                Card Number
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
                value={cardNumber}
                onChangeText={(text) => {
                  let cleaned = text.replace(/\D/g, "");
                  if (cleaned.length > 16) cleaned = cleaned.substring(0, 16);
                  let formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
                  setCardNumber(formatted);
                }}
                keyboardType="numeric"
                maxLength={19}
                placeholder="4111 1111 1111 1111"
                placeholderTextColor={THEME_COLORS.textSub}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 15 }}>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text
                  style={[styles.inputLabel, { color: THEME_COLORS.textSub }]}
                >
                  Expiry Date
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
                  value={expiry}
                  onChangeText={(text) => {
                    let cleaned = text.replace(/\D/g, "");
                    let formatted = cleaned;
                    if (cleaned.length >= 2) {
                      formatted = cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
                    }
                    setExpiry(formatted);
                  }}
                  placeholder="MM/YY"
                  placeholderTextColor={THEME_COLORS.textSub}
                  maxLength={5}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputBox, { flex: 1 }]}>
                <Text
                  style={[styles.inputLabel, { color: THEME_COLORS.textSub }]}
                >
                  CVV
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
                  value={cvv}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length <= 3) {
                      setCvv(cleaned);
                    }
                  }}
                  secureTextEntry
                  keyboardType="numeric"
                  placeholder="123"
                  placeholderTextColor={THEME_COLORS.textSub}
                  maxLength={3}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleDummyPay}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.payBtnText}>Pay Now</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.formContainer,
              {
                backgroundColor: THEME_COLORS.surface,
                borderColor: THEME_COLORS.border,
              },
            ]}
          >
            <Text style={[styles.formTitle, { color: THEME_COLORS.textMain }]}>
              Verify OTP
            </Text>
            <Text style={[styles.otpSub, { color: THEME_COLORS.textSub }]}>
              A code was sent to your registered mobile number.
            </Text>

            <View style={styles.inputBox}>
              <TextInput autoComplete='off' autoCorrect={false} spellCheck={false}
                style={[
                  styles.input,
                  {
                    textAlign: "center",
                    fontSize: 24,
                    letterSpacing: 8,
                    color: THEME_COLORS.textMain,
                    backgroundColor: THEME_COLORS.background,
                    borderColor: THEME_COLORS.border,
                  },
                ]}
                value={otp}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  if (cleaned.length <= 6) {
                    setOtp(cleaned);
                  }
                }}
                keyboardType="numeric"
                placeholder="123456"
                placeholderTextColor={THEME_COLORS.textSub}
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.payBtnText}>Verify & Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  iconBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textMain },
  summaryCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 30,
    elevation: 4,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 5,
  },
  summaryAmount: { color: "white", fontSize: 32, fontWeight: "bold" },
  summaryService: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 20,
  },
  inputBox: { marginBottom: 20 },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#f8fafc",
  },
  otpSub: {
    color: COLORS.textSub,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 14,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  payBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  amountInput: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    paddingVertical: 10,
  },
  breakdownBox: {
    width: '100%',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  breakdownValue: {
    color: 'white',
    fontSize: 12,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
});
