import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen since we removed the AnimatedSplashOverlay
    SplashScreen.hideAsync();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
