import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SmoothPressable } from '@/components/SmoothPressable';
import { showToast } from '@/components/Toast';
import { useSettings } from '@/settings/SettingsContext';
import { useTheme } from '@/theme';
import {
  ReminderCalendarIllustration,
  HealthCareIllustration,
} from '@/components/OnboardingIllustrations';
import {
  CutePuppyPeeking,
  CuteCatPeeking,
  CutePawPrint,
  CuteBone,
  CuteSunburst,
  WavyTopBanner,
  WavyBottomBanner,
  CareTaskTopLeftWave,
  CareTaskTopRightWave,
  CareTaskBottomWave,
  CareTaskDashes,
  FourPointStar,
} from '@/components/CutePetDecorations';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Never Miss a Care Task',
    description:
      'Set custom reminders for feeding, medication, grooming, and vaccine schedules. Stay on top of every care task.',
    Illustration: ReminderCalendarIllustration,
  },
  {
    title: 'Track Daily Health & Meals',
    description:
      'Keep accurate logs of your pet\u2019s daily nutrition, health observations, and weight milestones safely on your device.',
    Illustration: HealthCareIllustration,
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { settings, update } = useSettings();

  // Stage 0: Slide 1 ("Never Miss a Care Task")
  // Stage 1: Slide 2 ("Track Daily Health & Meals")
  // Stage 2: User Name Setup ("What should we call you?") - Exact reference match
  const [stage, setStage] = useState<number>(0);

  // User nickname input
  const [nickname, setNickname] = useState(settings.nickname || '');
  const [saving, setSaving] = useState(false);
  const initializedRef = React.useRef(!!settings.nickname);

  React.useEffect(() => {
    if (!initializedRef.current && settings.nickname) {
      setNickname(settings.nickname);
      initializedRef.current = true;
    }
  }, [settings.nickname]);

  const trimmedNickname = nickname.trim();

  const handleNextSlide = () => {
    if (stage < SLIDES.length - 1) {
      setStage(stage + 1);
    } else {
      setStage(2);
    }
  };

  const handleSkipToName = () => {
    if (settings.onboarded && settings.nickname) {
      router.replace('/(tabs)' as Href);
    } else {
      setStage(2);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!trimmedNickname) {
      showToast('Please enter your name or nickname.', 'warning', 'Name Required');
      return;
    }
    setSaving(true);
    try {
      await update('nickname', trimmedNickname);
      await update('onboarded', true);
      showToast(`Welcome to PetCare, ${trimmedNickname}! 🎉`, 'success', 'Welcome!');
      router.replace('/(tabs)' as Href);
    } catch (err) {
      console.warn('Failed to complete onboarding:', err);
      await update('onboarded', true);
      router.replace('/(tabs)' as Href);
    } finally {
      setSaving(false);
    }
  };

  const isNameSetup = stage === 2;
  const isCareTask = stage === 0;
  const isHealthStage = stage === 1;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isCareTask
            ? '#FDECDC'
            : isHealthStage
              ? '#FCF8F5'
              : isNameSetup
                ? '#FDF8F2'
                : theme.background,
        },
      ]}
    >
      {/* Decorative Wavy Background and Paws for Care Task Screen (Stage 0) */}
      {isCareTask && (
        <>
          <View style={styles.careCornerTopLeft} pointerEvents="none">
            <CareTaskTopLeftWave width={170} height={180} />
          </View>
          <View style={styles.careCornerTopRight} pointerEvents="none">
            <CareTaskTopRightWave width={175} height={140} />
          </View>
          <View style={styles.careBottomBannerContainer} pointerEvents="none">
            <CareTaskBottomWave width={Math.max(width, 800)} height={110} />
          </View>

          {/* Floating Paw Prints */}
          <CutePawPrint size={28} color="#F8BFA8" opacity={0.65} style={styles.carePawTopLeft} />
          <CutePawPrint size={32} color="#F8BFA8" opacity={0.65} style={styles.carePawMidLeft} />
          <CutePawPrint size={26} color="#F8BFA8" opacity={0.6} style={styles.carePawBottomLeft} />
          <CutePawPrint size={28} color="#F8BFA8" opacity={0.65} style={styles.carePawTopRight} />
          <CutePawPrint size={30} color="#F8BFA8" opacity={0.65} style={styles.carePawBottomRight} />
        </>
      )}

      {/* Decorative Wavy Background, Paws, and Sparkles for Health Screen (Stage 1) */}
      {isHealthStage && (
        <>
          <View style={styles.careCornerTopLeft} pointerEvents="none">
            <CareTaskTopLeftWave width={170} height={180} />
          </View>
          <View style={styles.careCornerTopRight} pointerEvents="none">
            <CareTaskTopRightWave width={175} height={140} />
          </View>
          <View style={styles.careBottomBannerContainer} pointerEvents="none">
            <CareTaskBottomWave width={Math.max(width, 800)} height={110} />
          </View>

          {/* Floating Paw Prints */}
          <CutePawPrint size={26} color="#F6C5AF" opacity={0.65} style={styles.healthPawTopLeft} />
          <CutePawPrint size={30} color="#F6C5AF" opacity={0.65} style={styles.healthPawMidLeft} />
          <CutePawPrint size={28} color="#F6C5AF" opacity={0.6} style={styles.healthPawBottomLeft} />
          <CutePawPrint size={28} color="#F6C5AF" opacity={0.65} style={styles.healthPawMidRight} />
          <CutePawPrint size={32} color="#F6C5AF" opacity={0.65} style={styles.healthPawBottomRight} />

          {/* Floating Golden 4-point Sparkle Stars (✦) */}
          <FourPointStar size={16} color="#F5A623" opacity={0.9} style={styles.healthStarMidLeft} />
          <FourPointStar size={18} color="#F5A623" opacity={0.9} style={styles.healthStarMidRight} />
          <FourPointStar size={15} color="#F5A623" opacity={0.85} style={styles.healthStarTopRight} />
        </>
      )}

      {/* Decorative Wavy Background Banners for Name Setup */}
      {isNameSetup && (
        <>
          <View style={styles.topBannerContainer} pointerEvents="none">
            <WavyTopBanner width={Math.max(width, 800)} height={105} />
          </View>
          <View style={styles.bottomBannerContainer} pointerEvents="none">
            <WavyBottomBanner width={Math.max(width, 800)} height={95} />
          </View>
        </>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          {stage > 0 ? (
            <SmoothPressable
              onPress={() => setStage(stage - 1)}
              style={styles.backButtonPill}
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backButtonText}>Back</Text>
            </SmoothPressable>
          ) : (
            <View style={styles.placeholderButton} />
          )}

          {stage === 0 ? (
            <SmoothPressable
              onPress={handleSkipToName}
              style={styles.careSkipButtonPill}
              accessibilityLabel="Skip intro"
            >
              <Text style={styles.careSkipText}>Skip</Text>
            </SmoothPressable>
          ) : stage === 1 ? (
            <SmoothPressable
              onPress={handleSkipToName}
              style={styles.healthSkipButtonPill}
              accessibilityLabel="Skip intro"
            >
              <Text style={styles.healthSkipButtonText}>Skip</Text>
            </SmoothPressable>
          ) : (
            <View style={styles.placeholderButton} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isCareTask && styles.careScrollContent,
            isHealthStage && styles.healthScrollContent,
            isNameSetup && styles.nameSetupScrollContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* STAGE 0: "Never Miss a Care Task" (Exact Reference Recreation) */}
          {stage === 0 ? (
            <View style={styles.careSlideWrapper}>
              {/* Illustration: Puppy, Kitten, Calendar and Reminder Cards */}
              <View style={styles.careIllustrationWrapper}>
                <Image
                  source={require('../../assets/images/onboarding-care-illustration.png')}
                  style={styles.careIllustrationImage}
                  resizeMode="contain"
                  accessibilityLabel="Puppy and kitten with care task calendar and floating cards"
                />
              </View>

              {/* Title with flanking angled coral tick marks */}
              <View style={styles.careTitleRow}>
                <CareTaskDashes direction="left" color="#FA7350" />
                <Text style={styles.careTitleText}>Never Miss a Care Task</Text>
                <CareTaskDashes direction="right" color="#FA7350" />
              </View>

              {/* Description */}
              <Text style={styles.careDescriptionText}>
                Set custom reminders for feeding, medication,{'\n'}grooming, and vaccine schedules. Stay on top of{'\n'}every care task.
              </Text>

              {/* Page Indicator: Active coral capsule + inactive peach dot */}
              <View style={styles.careDotsRow}>
                <View style={styles.careActiveDot} />
                <View style={styles.careInactiveDot} />
              </View>

              {/* Action Button: Next */}
              <View style={styles.careButtonWrapper}>
                <SmoothPressable
                  onPress={handleNextSlide}
                  style={styles.careNextButton}
                  accessibilityLabel="Next"
                >
                  <Text style={styles.careNextButtonText}>Next</Text>
                </SmoothPressable>
              </View>
            </View>
          ) : stage === 1 ? (
            /* STAGE 1: "Track Daily Health & Meals" (Exact Reference Recreation) */
            <View style={styles.healthSlideWrapper}>
              {/* Illustration: Dog, Cat, Calendar with Clock, Food Bowl, and Checklist Clipboard */}
              <View style={styles.healthIllustrationWrapper}>
                <Image
                  source={require('../../assets/images/onboarding-health-illustration.png')}
                  style={styles.healthIllustrationImage}
                  resizeMode="contain"
                  accessibilityLabel="Dog and cat with calendar, clock, food bowl, and health checklist"
                />
              </View>

              {/* Title Card Banner with flanking coral sunbursts */}
              <View style={styles.healthTitleBannerOuter}>
                <CuteSunburst direction="left" color="#FA7350" size={26} />

                <View style={styles.healthTitleBannerCard}>
                  {/* Top center divider line with paw icon */}
                  <View style={styles.bannerPawDividerRow}>
                    <View style={styles.bannerDividerLine} />
                    <CutePawPrint size={18} color="#B36B3D" opacity={0.9} />
                    <View style={styles.bannerDividerLine} />
                  </View>
                  <Text style={styles.healthTitleText}>Track Daily Health & Meals</Text>
                </View>

                <CuteSunburst direction="right" color="#FA7350" size={26} />
              </View>

              {/* Description */}
              <Text style={styles.healthDescriptionText}>
                Keep accurate logs of your pet’s daily nutrition,{'\n'}health observations, and weight milestones safely on{'\n'}your device.
              </Text>

              {/* Three Onboarding Progress Indicators (Inactive, Active, Inactive) */}
              <View style={styles.healthDotsRow}>
                <View style={styles.healthInactiveDot} />
                <View style={styles.healthActiveDot} />
                <View style={styles.healthInactiveDot} />
              </View>

              {/* Large Orange Next Button */}
              <View style={styles.healthButtonWrapper}>
                <SmoothPressable
                  onPress={handleNextSlide}
                  style={styles.healthNextButton}
                  accessibilityLabel="Next"
                >
                  <Text style={styles.healthNextButtonText}>Next →</Text>
                </SmoothPressable>
              </View>
            </View>
          ) : (
            /* STAGE 2: USER NAME SETUP ("What should we call you?") - Exact Reference Match */
            <View style={styles.nameSetupWrapper}>
              {/* Floating Paw Prints in background */}
              <CutePawPrint
                size={34}
                color="#ECD8C3"
                opacity={0.65}
                style={styles.floatingPawTopLeft}
              />
              <CutePawPrint
                size={32}
                color="#ECD8C3"
                opacity={0.65}
                style={styles.floatingPawTopRight}
              />

              {/* Center Avatar Badge with Sunburst Accents */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarSunburstLeft}>
                  <View style={[styles.sunburstDash, { transform: [{ rotate: '-45deg' }] }]} />
                </View>
                <View style={styles.avatarSunburstTop}>
                  <View style={[styles.sunburstDash, { transform: [{ rotate: '0deg' }] }]} />
                </View>
                <View style={styles.avatarSunburstRight}>
                  <View style={[styles.sunburstDash, { transform: [{ rotate: '45deg' }] }]} />
                </View>

                {/* Main Avatar Circle */}
                <View style={styles.avatarBadge}>
                  <Ionicons name="person" size={44} color="#5A3825" />
                </View>
              </View>

              {/* Main Title with Sunburst Rays on sides */}
              <View style={styles.titleRow}>
                <CuteSunburst direction="left" color="#E6A15C" size={26} />
                <Text style={styles.nameSetupTitle}>What should we call you?</Text>
                <CuteSunburst direction="right" color="#E6A15C" size={26} />
              </View>

              {/* Subtitle Description */}
              <Text style={styles.nameSetupDescription}>
                Enter your name or nickname so we can{'\n'}personalize your PetCare dashboard.
              </Text>

              {/* Curved Accent Smile Arc Line Underneath */}
              <View style={styles.smileUnderline} />

              {/* Peeking Pets & Card Section */}
              <View style={styles.petsCardWrapper}>
                {/* Cute Puppy on Left with Paws overlapping top edge */}
                <View style={styles.puppyContainer} pointerEvents="none">
                  <CutePuppyPeeking width={160} height={136} />
                </View>

                {/* Cute Cat on Right with Paws overlapping top edge */}
                <View style={styles.catContainer} pointerEvents="none">
                  <CuteCatPeeking width={160} height={136} />
                </View>

                {/* Input Card Container */}
                <View style={styles.inputOuterContainer}>
                  {/* Attached Tab Badge: 🐾 Your Name / Nickname */}
                  <View style={styles.inputTabBadge}>
                    <Text style={styles.inputTabPaw}>🐾</Text>
                    <Text style={styles.inputTabText}>Your Name / Nickname</Text>
                  </View>

                  {/* Input Pill Box */}
                  <View style={styles.inputPillBox}>
                    <TextInput
                      accessibilityLabel="Your Name or Nickname"
                      value={nickname}
                      onChangeText={(val) => {
                        initializedRef.current = true;
                        setNickname(val);
                      }}
                      placeholder="e.g., Alex"
                      placeholderTextColor="#B5A496"
                      autoFocus
                      maxLength={30}
                      returnKeyType="done"
                      onSubmitEditing={handleFinishOnboarding}
                      style={styles.textInput}
                    />
                    {/* Watermark Paw on right */}
                    <CutePawPrint size={24} color="#D7C4B2" opacity={0.65} />
                  </View>

                  {/* Helper Note with Orange Info Circle */}
                  <View style={styles.helperRow}>
                    <View style={styles.infoIconCircle}>
                      <Text style={styles.infoIconText}>i</Text>
                    </View>
                    <Text style={styles.helperNote}>
                      We&apos;ll use this to greet you on your Dashboard.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button: Continue to Dashboard */}
              <View style={styles.buttonWrapper}>
                <SmoothPressable
                  onPress={handleFinishOnboarding}
                  disabled={saving || !trimmedNickname}
                  style={[
                    styles.primaryPillButton,
                    {
                      opacity: trimmedNickname && !saving ? 1 : 0.7,
                    },
                  ]}
                >
                  <View style={styles.buttonInnerRow}>
                    <Text style={styles.buttonPaw}>🐾</Text>
                    <Text style={styles.primaryButtonText}>
                      {saving ? 'Loading...' : 'Continue to Dashboard →'}
                    </Text>
                  </View>
                </SmoothPressable>
              </View>

              {/* Bottom Decorative Bone in corner */}
              <View style={styles.bottomBoneWrapper} pointerEvents="none">
                <CuteBone size={44} color="#FFFFFF" strokeColor="#5A3825" />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 105,
    zIndex: 0,
  },
  careCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 170,
    height: 180,
    zIndex: 0,
  },
  careCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 175,
    height: 140,
    zIndex: 0,
  },
  careBottomBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    zIndex: 0,
  },
  carePawTopLeft: {
    position: 'absolute',
    top: 75,
    left: '8%',
    zIndex: 0,
  },
  carePawMidLeft: {
    position: 'absolute',
    top: 170,
    left: '4%',
    zIndex: 0,
  },
  carePawBottomLeft: {
    position: 'absolute',
    bottom: 110,
    left: '12%',
    zIndex: 0,
  },
  carePawTopRight: {
    position: 'absolute',
    top: 80,
    right: '10%',
    zIndex: 0,
  },
  carePawBottomRight: {
    position: 'absolute',
    bottom: 115,
    right: '8%',
    zIndex: 0,
  },
  careSkipButtonPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  careSkipText: {
    color: '#3E2723',
    fontSize: 13,
    fontWeight: '700',
  },
  careScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  careSlideWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 6,
    paddingBottom: 20,
    zIndex: 1,
  },
  careIllustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  careIllustrationImage: {
    width: Math.min(width * 0.92, 492),
    height: Math.min(width * 0.92 * (210 / 492), 210),
    maxWidth: 492,
    maxHeight: 210,
  },
  careTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  careTitleText: {
    fontSize: width < 360 ? 20 : 23,
    fontWeight: '800',
    color: '#442111',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  careDescriptionText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#6F4E37',
    textAlign: 'center',
    maxWidth: 350,
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  careDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  careActiveDot: {
    width: 20,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#FF6438',
  },
  careInactiveDot: {
    width: 6,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#FFCFBD',
  },
  careButtonWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 2,
  },
  careNextButton: {
    width: '100%',
    maxWidth: 440,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6438',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6438',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  careNextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  healthScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  healthSlideWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 6,
    paddingBottom: 20,
    zIndex: 1,
  },
  healthPawTopLeft: {
    position: 'absolute',
    top: 75,
    left: '8%',
    zIndex: 0,
  },
  healthPawMidLeft: {
    position: 'absolute',
    top: 195,
    left: '3%',
    zIndex: 0,
  },
  healthPawBottomLeft: {
    position: 'absolute',
    bottom: 110,
    left: '9%',
    zIndex: 0,
  },
  healthPawMidRight: {
    position: 'absolute',
    top: 195,
    right: '3%',
    zIndex: 0,
  },
  healthPawBottomRight: {
    position: 'absolute',
    bottom: 115,
    right: '8%',
    zIndex: 0,
  },
  healthStarMidLeft: {
    position: 'absolute',
    top: 265,
    left: '11%',
    zIndex: 0,
  },
  healthStarMidRight: {
    position: 'absolute',
    top: 265,
    right: '11%',
    zIndex: 0,
  },
  healthStarTopRight: {
    position: 'absolute',
    top: 85,
    right: '18%',
    zIndex: 0,
  },
  healthSkipButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#5A3825',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#5A3825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  healthSkipButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E271E',
  },
  healthIllustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  healthIllustrationImage: {
    width: Math.min(width * 0.94, 520),
    height: Math.min(width * 0.94 * (257 / 700), 191),
    maxWidth: 520,
    maxHeight: 191,
  },
  healthTitleBannerOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
    gap: 6,
    marginBottom: 12,
  },
  healthTitleBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E8CFB7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#5A3825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerPawDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bannerDividerLine: {
    width: 32,
    height: 2,
    backgroundColor: '#D6B49E',
    borderRadius: 1,
  },
  healthTitleText: {
    fontSize: width < 360 ? 19 : 22,
    fontWeight: '800',
    color: '#3E2010',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  healthDescriptionText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#6F4E37',
    textAlign: 'center',
    maxWidth: 360,
    alignSelf: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  healthDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  healthActiveDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FF6438',
  },
  healthInactiveDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F0CAB8',
  },
  healthButtonWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 2,
  },
  healthNextButton: {
    width: '100%',
    maxWidth: 440,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6438',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6438',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  healthNextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomBannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 95,
    zIndex: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    minHeight: 46,
    zIndex: 10,
  },
  backButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#5A3825',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#5A3825',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3E271E',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3E271E',
  },
  skipButtonPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderButton: {
    width: 44,
    height: 32,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    zIndex: 1,
  },
  nameSetupScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationWrapper: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSetupWrapper: {
    width: '100%',
    maxWidth: 720,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  floatingPawTopLeft: {
    position: 'absolute',
    top: 4,
    left: 24,
  },
  floatingPawTopRight: {
    position: 'absolute',
    top: 4,
    right: 24,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  avatarBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FBE8D5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ECD4BC',
  },
  avatarSunburstLeft: {
    position: 'absolute',
    left: -14,
    top: 16,
  },
  avatarSunburstTop: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  avatarSunburstRight: {
    position: 'absolute',
    right: -14,
    top: 16,
  },
  sunburstDash: {
    width: 9,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E6A15C',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  nameSetupTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    color: '#3E271E',
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: Math.min(width * 0.88, 340),
  },
  nameSetupDescription: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    color: '#7D6B5D',
  },
  smileUnderline: {
    width: 52,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E6A15C',
    marginTop: 8,
    marginBottom: 20,
  },
  petsCardWrapper: {
    width: '100%',
    position: 'relative',
    marginTop: 20,
    marginBottom: 20,
  },
  puppyContainer: {
    position: 'absolute',
    top: -108,
    left: 8,
    zIndex: 3,
  },
  catContainer: {
    position: 'absolute',
    top: -108,
    right: 8,
    zIndex: 3,
  },
  inputOuterContainer: {
    width: '100%',
    position: 'relative',
    paddingTop: 16,
  },
  inputTabBadge: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5E3D2',
    borderWidth: 1.5,
    borderColor: '#5A3825',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  inputTabPaw: {
    fontSize: 12,
  },
  inputTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3E271E',
  },
  inputPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1.8,
    borderColor: '#5A3825',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    shadowColor: '#5A3825',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#3E271E',
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({ outlineWidth: 0, outlineColor: 'transparent' } as unknown as object)
      : {}),
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  infoIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E89138',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 12,
  },
  helperNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D6B5D',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 8,
  },
  primaryPillButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5A3825',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A3825',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonPaw: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomBoneWrapper: {
    position: 'absolute',
    bottom: -10,
    right: 8,
    transform: [{ rotate: '42deg' }],
    zIndex: 1,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 6,
  },
  introNextButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
