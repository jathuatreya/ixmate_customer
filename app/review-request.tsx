import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  AlertCircle,
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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavbar } from "../components/BottomNavbar";
import { useRequest } from "../contexts/RequestContext";
import { useSession } from "../ctx";
import { db } from "../utils/firebaseConfig";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  border: "#1e293b",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
};

export default function ReviewRequestScreen() {
  const router = useRouter();
  const { requestData, setRequestData, clearRequestData } = useRequest();
  const { user } = useSession();

  const [isAgreed, setIsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "instant" | "saved_card"
  >("instant");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [savedCard, setSavedCard] = useState<any>(null);

  React.useEffect(() => {
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
      }
    }
    fetchCard();
  }, [user?._id]);

  const handleSubmit = async () => {
    if (!isAgreed) {
      Alert.alert(
        "Agreement Required",
        "Please agree to the terms and conditions to proceed.",
      );
      return;
    }

    if (paymentMethod === "instant" && !requestData.budget) {
      Alert.alert(
        "Payment Error",
        "Instant payment requires a pre-determined budget. Please select Cash on Delivery or wait for a quote.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // Clean requestData of undefined values
      const sanitizedData = Object.entries(requestData).reduce(
        (acc: any, [key, value]) => {
          if (value !== undefined) acc[key] = value;
          return acc;
        },
        {},
      );

      // Save to Firestore
      const docRef = await addDoc(collection(db, "requests"), {
        ...sanitizedData,
        userId: user?._id || "guest",
        paymentMethod,
        status: requestData.workerId 
          ? "accepted" 
          : (paymentMethod === "instant"
            ? "awaiting_payment"
            : paymentMethod === "saved_card"
              ? "paid"
              : "pending"),
        createdAt: serverTimestamp(),
      });

      const requestId = docRef.id;

      if (paymentMethod === "instant") {
        // Redirect to PayHere payment screen
        router.push({
          pathname: "/payment",
          params: {
            id: requestId,
            amount: requestData.budget,
            serviceType: requestData.serviceType,
            workerId: requestData.workerId || "",
          },
        });
        // Remove clearing state here, clear only on successful payment or home transition
      } else if (paymentMethod === "saved_card") {
        // Record payment for saved card
        await addDoc(collection(db, "payments"), {
          requestId: requestId,
          jobId: requestId,
          workerId: requestData.workerId || null,
          status: "completed",
          userId: user?._id || "guest",
          amount: parseFloat(requestData.budget || "0"),
          serviceType: requestData.serviceType || "FixMate Service",
          paymentMethod: "saved_card",
          timestamp: new Date(),
          cardLast4: savedCard?.last4 || "0000",
        });

        // Navigate to Payment Success Screen
        router.push({
          pathname: "/payment-success",
          params: { id: requestId, amount: requestData.budget },
        });
      } else {
        // Navigate to Booking Success Screen (Cash)
        router.push({
          pathname: "/booking-success",
          params: { id: requestId, method: paymentMethod },
        });
      }

      // Clear the request form data after successful submission
      clearRequestData();
      
    } catch (error: any) {
      Alert.alert("Submission Failed", error.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.textMain }]}>
          Review Request
        </Text>
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
                  <MapPin size={14} color={COLORS.textSub} />
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
                  <Calendar size={14} color={COLORS.textSub} />
                  <Text style={styles.detailLabel}>Date</Text>
                </View>
                <Text style={styles.detailValue}>
                  {requestData.scheduledDate}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <Clock size={14} color={COLORS.textSub} />
                  <Text style={styles.detailLabel}>Time</Text>
                </View>
                <Text style={styles.detailValue}>
                  {requestData.scheduledTime}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <FileText size={14} color={COLORS.textSub} />
                  <Text style={styles.detailLabel}>Issue Description</Text>
                </View>
                <Text style={styles.detailValue} numberOfLines={3}>
                  {requestData.description}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <AlertCircle size={14} color={COLORS.textSub} />
                  <Text style={styles.detailLabel}>Urgency</Text>
                </View>
                <Text
                  style={[styles.detailValue, { textTransform: "capitalize" }]}
                >
                  {requestData.urgency || "Normal"}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <View style={styles.detailLabelRow}>
                  <ShieldCheck size={14} color={COLORS.textSub} />
                  <Text style={styles.detailLabel}>Assigned Professional</Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    !requestData.workerName && { color: COLORS.primary },
                  ]}
                >
                  {requestData.workerName || "Open for Bidding (Auto-Match)"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Payment Method Selection */}
            <TouchableOpacity
              style={styles.paymentRow}
              onPress={() => setShowPaymentModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentLeft}>
                <CreditCard size={16} color={COLORS.textSub} />
                <Text style={styles.paymentText}>Payment Method</Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.cashText}>
                  {paymentMethod === "cash"
                    ? "Cash on Delivery"
                    : paymentMethod === "saved_card"
                      ? `•••• ${savedCard?.last4}`
                      : "Pay Instantly"}
                </Text>
                <ChevronDown size={14} color={COLORS.textSub} />
              </View>
            </TouchableOpacity>

            {/* Payment Method Modal */}
            <Modal
              visible={showPaymentModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPaymentModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowPaymentModal(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Payment Method</Text>
                    <TouchableOpacity
                      onPress={() => setShowPaymentModal(false)}
                    >
                      <ChevronDown size={24} color={COLORS.textSub} />
                    </TouchableOpacity>
                  </View>

                  {/* 1st Method: Pay Instantly */}
                  <TouchableOpacity
                    style={[
                      styles.methodItem,
                      paymentMethod === "instant" && styles.methodItemSelected,
                    ]}
                    onPress={() => {
                      if (!requestData.budget) {
                        Alert.alert(
                          "Estimation Required",
                          "Please provide a budget to use instant payment.",
                        );
                        return;
                      }
                      setPaymentMethod("instant");
                      setShowPaymentModal(false);
                    }}
                  >
                    <View
                      style={[
                        styles.methodIconBg,
                        { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                      ]}
                    >
                      <CreditCard size={28} color="#3b82f6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodName}>
                        Pay Instantly (PayHere)
                      </Text>
                      <Text style={styles.methodSub}>
                        Secure online payment via PayHere
                      </Text>
                    </View>
                    {paymentMethod === "instant" && (
                      <CheckCircle size={28} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>

                  {/* 2nd Method: Cash on Delivery */}
                  <TouchableOpacity
                    style={[
                      styles.methodItem,
                      paymentMethod === "cash" && styles.methodItemSelected,
                    ]}
                    onPress={() => {
                      setPaymentMethod("cash");
                      setShowPaymentModal(false);
                    }}
                  >
                    <View style={styles.methodIconBg}>
                      <MapPin size={28} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.methodName}>Cash on Delivery</Text>
                      <Text style={styles.methodSub}>
                        Pay after service completion
                      </Text>
                    </View>
                    {paymentMethod === "cash" && (
                      <CheckCircle size={28} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>

                  {/* Saved Card if any */}
                  {savedCard && (
                    <TouchableOpacity
                      style={[
                        styles.methodItem,
                        paymentMethod === "saved_card" &&
                          styles.methodItemSelected,
                      ]}
                      onPress={() => {
                        setPaymentMethod("saved_card");
                        setShowPaymentModal(false);
                      }}
                    >
                      <View
                        style={[
                          styles.methodIconBg,
                          { backgroundColor: "rgba(192, 38, 211, 0.1)" },
                        ]}
                      >
                        <CreditCard size={28} color="#c026d3" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.methodName}>
                          {savedCard.brand} ending in {savedCard.last4}
                        </Text>
                        <Text style={styles.methodSub}>Saved card payment</Text>
                      </View>
                      {paymentMethod === "saved_card" && (
                        <CheckCircle size={28} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Total Estimation */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated Budget</Text>
              <Text style={styles.totalValue}>
                {requestData.budget
                  ? `LKR ${requestData.budget}`
                  : "Pending Quote"}
              </Text>
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
          <View style={styles.continueButtonContainer}>
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
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Loader2
                      size={20}
                      color="white"
                      style={{ transform: [{ rotate: "45deg" }] }}
                    />
                    <Text style={styles.submitBtnText}>Submitting...</Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle size={20} color="white" />
                    <Text style={styles.submitBtnText}>CONFIRM BOOKING</Text>
                  </View>
                )}
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
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  receiptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
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
    borderColor: "#f1f5f9",
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
    fontSize: 16,
    color: COLORS.textMain,
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
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSub,
  },
  paymentRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cashText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSub,
  },
  totalValue: {
    fontSize: 24,
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
  continueButtonContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  bottomBar: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 60,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  methodItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  methodIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  methodName: {
    fontSize: 19,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  methodSub: {
    fontSize: 15,
    color: COLORS.textSub,
    marginTop: 2,
  },
});
