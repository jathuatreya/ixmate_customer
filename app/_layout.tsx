import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RequestProvider } from "../contexts/RequestContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { SessionProvider } from "../ctx";

import { useSession } from "../ctx";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ThemeProvider>
          <RequestProvider>
            <ThemeProviderBridge />
          </RequestProvider>
        </ThemeProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

function ThemeProviderBridge() {
  const { theme } = useTheme();
  return (
    <NavThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <RootLayoutNav />
    </NavThemeProvider>
  );
}

function RootLayoutNav() {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      // Hide splash screen once auth state is determined
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-request" options={{ headerShown: false }} />
      <Stack.Screen name="request-location" options={{ headerShown: false }} />
      <Stack.Screen name="request-details" options={{ headerShown: false }} />
      <Stack.Screen name="review-request" options={{ headerShown: false }} />
      <Stack.Screen
        name="available-workers"
        options={{ headerShown: true, title: "Select Professional" }}
      />
      <Stack.Screen
        name="payment"
        options={{ headerShown: true, title: "Payment" }}
      />
      <Stack.Screen
        name="request-status"
        options={{ headerShown: true, title: "Booking Status" }}
      />
      <Stack.Screen
        name="rate-experience"
        options={{ headerShown: true, title: "Rate Service" }}
      />
      <Stack.Screen
        name="profile"
        options={{ headerShown: true, title: "Profile" }}
      />
      <Stack.Screen
        name="my-requests"
        options={{ headerShown: true, title: "My Requests" }}
      />
      <Stack.Screen
        name="chat"
        options={{ headerShown: true, title: "Messages" }}
      />
      <Stack.Screen name="client-home" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
