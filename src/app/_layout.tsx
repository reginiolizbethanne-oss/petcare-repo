import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getDb } from '@/db/client';
import { refreshModelStatus } from '@/ai/local';
import { DownloadStatusIndicator } from '@/components/DownloadStatusIndicator';
import { PopupProvider } from '@/components/Popup';
import { ToastHost } from '@/components/Toast';
import { AccessibilityPreferences, useReduceMotion } from '@/components/AccessibilityPreferences';
import { SettingsProvider, useSettings } from '@/settings/SettingsContext';
import { PetProvider } from '@/context/PetContext';
import { useTheme } from '@/theme';
import { AppSplashScreen } from '@/components/AppSplashScreen';
import { useReminderWatcher } from '@/services/useReminderWatcher';

// Keep native splash visible until our animated splash overlay takes over
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    // Open + migrate the database and read the local model's on-disk
    // state before rendering any screen.
    Promise.all([getDb(), refreshModelStatus()])
      .catch((e) => console.warn('Init failed:', e))
      .finally(() => setDbReady(true));
  }, []);

  useEffect(() => {
    if (dbReady && splashFinished) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [dbReady, splashFinished]);

  return (
    <SettingsProvider>
      <AccessibilityPreferences>
        <PopupProvider>
          <PetProvider>
            <View style={{ flex: 1, width: '100%', height: '100%' }}>
              <RootNavigator />
              <ToastHost />
              {/* Coral Logo Splash Screen is rendered as a top-level overlay so it is 100% GUARANTEED to show FIRST */}
              {!splashFinished && (
                <AppSplashScreen
                  minDisplayTimeMs={2500}
                  onFinish={() => setSplashFinished(true)}
                />
              )}
            </View>
          </PetProvider>
        </PopupProvider>
      </AccessibilityPreferences>
    </SettingsProvider>
  );
}

/** Root stack navigator: handles initial index redirection, onboarding, and tabs. */
function RootNavigator() {
  const theme = useTheme();
  const { settings, ready } = useSettings();
  const reduceMotion = useReduceMotion();
  useReminderWatcher();

  // Keep the OS background colour (keyboard area, splash fade) in sync.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background);
  }, [theme.background]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
          animation: reduceMotion ? 'none' : 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pet-form" options={{ presentation: 'modal', title: 'Pet Profile' }} />
        <Stack.Screen name="log-meal" options={{ presentation: 'modal', title: 'Log Meal' }} />
        <Stack.Screen name="add-reminder" options={{ presentation: 'modal', title: 'Reminder' }} />
        <Stack.Screen name="log-health" options={{ presentation: 'modal', title: 'Health Notes' }} />
        <Stack.Screen name="weight-entry" options={{ presentation: 'modal', title: 'Weight Tracker' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="chat-settings" options={{ title: 'Chat settings' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
      </Stack>
      <DownloadStatusIndicator />
    </>
  );
}
