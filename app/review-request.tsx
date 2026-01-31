import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRequest } from "../contexts/RequestContext";
import { useSession } from "../ctx";
import { db } from "../utils/firebaseConfig";

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

export default function ReviewRequestScreen() {
  const router = useRouter();
  const { requestData, setRequestData } = useRequest();
  const { user } = useSession();

  const [isAgreed, setIsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAgreed) {
      Alert.alert(
        "Agreement Required",
        "Please agree to the terms and conditions to proceed.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // Save to Firestore
      await addDoc(collection(db, "requests"), {
        ...requestData,
        userId: user?._id || "guest",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Reset and Navigate (ideally to a success screen or home)
      Alert.alert("Success", "Your request has been submitted successfully!", [
        {
          text: "OK",
          onPress: () => {
            setRequestData({}); // Clear
            router.push("/client-home");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Submission Failed", error.message || "Please try again.");
    } finally {
      setSubmitting(false);
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
        <Text style={styles.headerTitle}>Review Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 4 Card */}
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
                    <Text style={styles.stepLabel}>STEP 4 OF 4</Text>
                    <Text style={styles.stepTitle}>Review Details</Text>
                  </View>
                  <CheckCircle size={32} color="rgba(255,255,255,0.8)" />
                </View>

                <View style={styles.progressBarBg}>
                  <View style={styles.progressBarFill} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Summary Card (Receipt Style) */}
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.serviceIconBg}>
                {/* Dynamic Icon based on service would be cool, default for now */}
                <FileText size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.serviceTitle}>
                  {requestData.serviceType || "Service"}
                </Text>
                <Text style={styles.serviceSub}>One-time service request</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Details Rows */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <MapPin size={14} color="#94a3b8" />
                  <Text style={styles.detailLabel}>Location</Text>
                </View>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {requestData.address}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <Calendar size={14} color="#94a3b8" />
                  <Text style={styles.detailLabel}>Date</Text>
                </View>
                <Text style={styles.detailValue}>
                  {requestData.scheduledDate}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <Clock size={14} color="#94a3b8" />
                  <Text style={styles.detailLabel}>Time</Text>
                </View>
                <Text style={styles.detailValue}>
                  {requestData.scheduledTime}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Payment Method Preview */}
            <View style={styles.paymentRow}>
              <View style={styles.paymentLeft}>
                <CreditCard size={16} color="#475569" />
                <Text style={styles.paymentText}>Payment Method</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.cashText}>Cash on Delivery</Text>
                <ChevronDown size={14} color="#94a3b8" />
              </View>
            </View>

            {/* Total Estimation (Mock) */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>Pending Quote</Text>
            </View>
            <Text style={styles.disclaimerText}>
              Final price will be determined after on-site inspection.
            </Text>
          </View>

          {/* Terms Agreement */}
          <TouchableOpacity
            style={styles.termsContainer}
            activeOpacity={0.8}
            onPress={() => setIsAgreed(!isAgreed)}
          >
            <View
              style={[
                styles.checkbox,
                isAgreed && {
                  backgroundColor: COLORS.primary,
                  borderColor: COLORS.primary,
                },
              ]}
            >
              {isAgreed && <Check size={14} color="white" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.linkText}>Terms of Service</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Safety Banner */}
          <View style={styles.safetyBanner}>
            <ShieldCheck size={20} color={COLORS.primary} />
            <Text style={styles.safetyText}>
              All our workers are verified and background checked for your
              safety.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Footer Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtnWrapper}
          activeOpacity={0.9}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={
              isAgreed
                ? [COLORS.primary, COLORS.primaryDark]
                : ["#cbd5e1", "#94a3b8"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {submitting ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Loader2
                  size={20}
                  color="white"
                  style={{ transform: [{ rotate: "45deg" }] }}
                />
                {/* Note: Loader2 needs animation, simple rotate for now or just static icon indicating loading if no animation lib */}
                <Text style={styles.submitBtnText}>Submitting...</Text>
              </View>
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <CheckCircle size={20} color="white" />
                <Text style={styles.submitBtnText}>CONFIRM BOOKING</Text>
              </View>
            )}
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
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  receiptCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0fdfa",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  serviceSub: {
    fontSize: 12,
    color: "#94a3b8",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#f1f5f9", // simplified dashed line attempt
  },
  detailsRow: {
    flexDirection: "row",
    gap: 24,
  },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  paymentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cashText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  disclaimerText: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: -8,
    fontStyle: "italic",
  },
  termsContainer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginTop: 2,
  },
  termsText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f0fdfa",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    color: "#0f766e",
    lineHeight: 18,
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
  submitBtnWrapper: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
