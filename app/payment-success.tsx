import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle, Home, FileText } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#10B981",
  primaryDark: "#059669",
  background: "#020617",
  surface: "#0f172a",
  textMain: "#f8fafc",
  textSub: "#94a3b8",
  border: "#1e293b",
};

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { id, amount } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient colors={["#064e3b", "#065f46"]} style={styles.iconBg}>
            <CheckCircle size={80} color={COLORS.primary} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Your payment of LKR {Number(amount || 0).toFixed(2)} has been received and your booking is fully confirmed.
        </Text>

        {id && (
          <View style={styles.idBadge}>
            <FileText size={16} color={COLORS.textSub} style={{ marginRight: 8 }} />
            <Text style={styles.idText}>
              Reference: #{String(id).slice(-6).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/client-home")}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.btnGradient}
            >
              <Home size={20} color="white" />
              <Text style={styles.btnText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              router.push({ pathname: "/request-status", params: { id } })
            }
          >
            <FileText size={20} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>View Service Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSub,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  idBadge: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  idText: {
    fontFamily: "monospace",
    color: COLORS.textMain,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  btnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
