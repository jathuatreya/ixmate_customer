import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzoYpbrb-N2Z01MGcyIimS2eig4j4fsvk",
  authDomain: "fix-mate-a013e.firebaseapp.com",
  projectId: "fix-mate-a013e",
  storageBucket: "fix-mate-a013e.firebasestorage.app",
  messagingSenderId: "212419866755",
  appId: "1:212419866755:web:0571ba0398a74e984d2bb6",
  measurementId: "G-DS2EV277DX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence based on platform
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { Platform } from "react-native";

// @ts-ignore: getReactNativePersistence is available in native builds but missing from web types
import { getReactNativePersistence } from "firebase/auth";

let auth: Auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics conditionally
let analytics: any;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((err) => {
    console.log("Analytics not supported", err);
  });

export { analytics, app, auth, db };

