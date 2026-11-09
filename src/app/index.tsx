import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Root Index route:
 * Directs the opening flow to /onboarding ("Never Miss a Care Task") right after the
 * Coral Logo Splash screen, guaranteeing the Figma prototype sequence is always followed.
 */
export default function IndexScreen() {
  return <Redirect href="/onboarding" />;
}
