import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Text as SvgText,
  Line,
} from 'react-native-svg';

interface AppSplashScreenProps {
  onFinish?: () => void;
  minDisplayTimeMs?: number;
}

const { width, height } = Dimensions.get('window');

// Vibrant Coral-Orange background matching the reference design
const SPLASH_BG_COLOR = '#FF6E4A';

// ============================================================================
// 1. WATERMARK BACKGROUND PAW PRINT
// ============================================================================
function WatermarkPaw({ size = 130, opacity = 0.16 }: { size?: number; opacity?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      <Circle cx="24" cy="28" r="11" fill="#FFFFFF" />
      <Circle cx="44" cy="17" r="12" fill="#FFFFFF" />
      <Circle cx="64" cy="17" r="12" fill="#FFFFFF" />
      <Circle cx="84" cy="28" r="11" fill="#FFFFFF" />
      <Path
        d="M 28 54 C 28 42, 80 42, 80 54 C 88 74, 72 86, 54 86 C 36 86, 20 74, 28 54 Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

// ============================================================================
// 2. SUNBURST SPARKLE ACCENT (3 Radiating Dashes)
// ============================================================================
function SparkleAccent({ rotation = '0deg', size = 32 }: { rotation?: string; size?: number }) {
  return (
    <View style={{ transform: [{ rotate: rotation }] }}>
      <Svg width={size} height={size} viewBox="0 0 30 30">
        <G stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round">
          <Line x1="6" y1="22" x2="14" y2="16" />
          <Line x1="12" y1="12" x2="20" y2="6" />
          <Line x1="18" y1="20" x2="26" y2="14" />
        </G>
      </Svg>
    </View>
  );
}

// ============================================================================
// 3. CURVED SMILE ARC LINE
// ============================================================================
function CurvedSmileArc() {
  return (
    <Svg width={220} height={18} viewBox="0 0 220 18">
      <Path
        d="M 12 14 Q 110 3 208 14"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// ============================================================================
// 4. MINI PAW WITH DIVIDER LINES (Below Tagline)
// ============================================================================
function PawDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Svg width={22} height={20} viewBox="0 0 24 22">
        <Circle cx="5" cy="6" r="2.2" fill="#FFFFFF" />
        <Circle cx="10" cy="3" r="2.5" fill="#FFFFFF" />
        <Circle cx="15" cy="3" r="2.5" fill="#FFFFFF" />
        <Circle cx="20" cy="6" r="2.2" fill="#FFFFFF" />
        <Path
          d="M 6 12 C 6 10, 19 10, 19 12 C 20.5 16, 17 18.5, 12.5 18.5 C 8 18.5, 4.5 16, 6 12 Z"
          fill="#FFFFFF"
        />
      </Svg>
      <View style={styles.dividerLine} />
    </View>
  );
}

// ============================================================================
// 5. MAIN APP SPLASH SCREEN COMPONENT
// ============================================================================
export function AppSplashScreen({
  onFinish,
  minDisplayTimeMs = 2600,
}: AppSplashScreenProps) {
  const useNative = Platform.OS !== 'web';

  // Smooth fade-in and fade-out
  const [fadeAnim] = useState(() => new Animated.Value(1));
  // Breathing pulse on the heart logo badge
  const [pulseAnim] = useState(() => new Animated.Value(0.96));

  useEffect(() => {
    // 1. Breathing pulse on logo badge
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1100,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.96,
          duration: 1100,
          useNativeDriver: useNative,
        }),
      ])
    );
    pulseLoop.start();

    // 2. Minimum display timer before fading out smoothly
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: useNative,
      }).start(() => {
        pulseLoop.stop();
        if (onFinish) {
          onFinish();
        }
      });
    }, minDisplayTimeMs);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [fadeAnim, minDisplayTimeMs, onFinish, pulseAnim, useNative]);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: useNative,
    }).start(() => {
      if (onFinish) onFinish();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable style={styles.pressableWrap} onPress={handleDismiss}>
        {/* Ambient Top-Left Paw Watermark */}
        <View style={styles.watermarkTopLeft} pointerEvents="none">
          <WatermarkPaw size={140} opacity={0.16} />
        </View>

        {/* Ambient Bottom-Right Paw Watermark */}
        <View style={styles.watermarkBottomRight} pointerEvents="none">
          <WatermarkPaw size={160} opacity={0.16} />
        </View>

        {/* Ambient Radial Glow Halo in background */}
        <View style={styles.ambientHalo} pointerEvents="none" />

        {/* Main Content Section */}
        <View style={styles.centerSection} pointerEvents="none">
          {/* 1. Heart Logo Badge with Dog & Cat Illustration and Paw Print */}
          <View style={styles.logoBadgeContainer}>
            {/* Sparkle on upper-right of heart */}
            <View style={styles.sparkleTopRight}>
              <SparkleAccent rotation="20deg" size={34} />
            </View>

            {/* Breathing Heart Logo Badge */}
            <Animated.View
              style={[
                styles.heartLogoShadow,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Image
                source={require('../../assets/images/petcare-logo-heart.png')}
                style={styles.heartLogoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* 2. "PetCare" App Name with Paw Print on 'e' */}
          <View style={styles.titleContainer}>
            <Svg width={280} height={75} viewBox="0 0 280 75">
              {/* White Outline Sticker Backplate */}
              <SvgText
                x="72"
                y="54"
                textAnchor="middle"
                fontSize="56"
                fontWeight="900"
                stroke="#FFFFFF"
                strokeWidth="13"
                strokeLinejoin="round"
                fill="#FFFFFF"
              >
                Pet
              </SvgText>
              <SvgText
                x="180"
                y="54"
                textAnchor="middle"
                fontSize="56"
                fontWeight="900"
                stroke="#FFFFFF"
                strokeWidth="13"
                strokeLinejoin="round"
                fill="#FFFFFF"
              >
                Care
              </SvgText>

              {/* Paw Print on top of 'e' of Care (White outline + Dark Brown fill) */}
              <G transform="translate(216, 2) scale(0.72)">
                {/* White outline for paw */}
                <Circle cx="6" cy="7" r="3.4" fill="#FFFFFF" />
                <Circle cx="11" cy="3" r="3.8" fill="#FFFFFF" />
                <Circle cx="16" cy="3" r="3.8" fill="#FFFFFF" />
                <Circle cx="21" cy="7" r="3.4" fill="#FFFFFF" />
                <Path
                  d="M 6 12 C 6 9.5, 21 9.5, 21 12 C 22.8 17.5, 19 21, 13.5 21 C 8 21, 4.2 17.5, 6 12 Z"
                  fill="#FFFFFF"
                />

                {/* Dark Brown Paw */}
                <Circle cx="6" cy="7" r="2.5" fill="#4D230F" />
                <Circle cx="11" cy="3" r="2.8" fill="#4D230F" />
                <Circle cx="16" cy="3" r="2.8" fill="#4D230F" />
                <Circle cx="21" cy="7" r="2.5" fill="#4D230F" />
                <Path
                  d="M 7 13 C 7 10.5, 20 10.5, 20 13 C 21.5 17, 18 19.5, 13.5 19.5 C 9 19.5, 5.5 17, 7 13 Z"
                  fill="#4D230F"
                />
              </G>

              {/* Chocolate Brown "Pet" */}
              <SvgText
                x="72"
                y="54"
                textAnchor="middle"
                fontSize="56"
                fontWeight="900"
                fill="#4D230F"
              >
                Pet
              </SvgText>

              {/* Vibrant Orange "Care" */}
              <SvgText
                x="180"
                y="54"
                textAnchor="middle"
                fontSize="56"
                fontWeight="900"
                fill="#ED6523"
              >
                Care
              </SvgText>
            </Svg>
          </View>

          {/* 3. Curved Smile Arc Line */}
          <View style={styles.smileArcWrapper}>
            <CurvedSmileArc />
          </View>

          {/* 4. Tagline with Radiating Sparkle Dashes on Sides */}
          <View style={styles.taglineSection}>
            {/* Sparkle on Left */}
            <SparkleAccent rotation="-50deg" size={28} />

            {/* Tagline Text */}
            <Text style={styles.taglineText}>
              Smart reminders and daily care logs{'\n'}for your pets.
            </Text>

            {/* Sparkle on Right */}
            <SparkleAccent rotation="50deg" size={28} />
          </View>

          {/* 5. Paw Divider Below Tagline */}
          <View style={styles.pawDividerContainer}>
            <PawDivider />
          </View>
        </View>

        {/* Footer spacer */}
        <View style={styles.footerSpacer} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999999,
    backgroundColor: SPLASH_BG_COLOR,
    overflow: 'hidden',
  },
  pressableWrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Math.max(height * 0.04, 32),
  },
  watermarkTopLeft: {
    position: 'absolute',
    top: 36,
    left: 20,
    transform: [{ rotate: '-18deg' }],
  },
  watermarkBottomRight: {
    position: 'absolute',
    bottom: 40,
    right: 18,
    transform: [{ rotate: '20deg' }],
  },
  ambientHalo: {
    position: 'absolute',
    top: height * 0.18,
    alignSelf: 'center',
    width: width * 0.95,
    height: width * 0.95,
    borderRadius: (width * 0.95) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.065)',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 500,
  },
  logoBadgeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -4,
    right: -16,
    zIndex: 2,
  },
  heartLogoShadow: {
    shadowColor: '#8C2E12',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  heartLogoImage: {
    width: 236,
    height: 180,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  smileArcWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: 10,
  },
  taglineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 380,
    paddingHorizontal: 12,
  },
  taglineText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  pawDividerContainer: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dividerLine: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  footerSpacer: {
    height: 10,
  },
});
