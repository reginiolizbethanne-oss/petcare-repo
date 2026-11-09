
import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
  Line,
} from 'react-native-svg';

// ============================================================================
// 1. CUTE PUPPY PEEKING (Faithfully crafted from reference image)
// Floppy caramel ears, white forehead blaze, big shiny round dark eyes,
// cute open smiling mouth with pink tongue, rosy blushing cheeks,
// and two cute white paws resting over the border.
// ============================================================================
export function CutePuppyPeeking({
  width = 175,
  height = 150,
  style,
}: {
  width?: number;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.wrapper, style]}>
      <Svg width={width} height={height} viewBox="0 0 170 145">
        {/* Floating Heart near puppy top-left */}
        <G transform="translate(38, 8) rotate(-12)">
          <Path
            d="M 10 3.5 C 6 -1.5, 0 1, 0 6.5 C 0 12, 10 17.5, 10 17.5 C 10 17.5, 20 12, 20 6.5 C 20 1, 14 -1.5, 10 3.5 Z"
            fill="#EFA391"
          />
        </G>

        {/* Sparkle / Sunburst lines top-left near heart */}
        <G stroke="#E6A15C" strokeWidth="2.8" strokeLinecap="round">
          <Line x1="16" y1="36" x2="26" y2="42" />
          <Line x1="26" y1="22" x2="33" y2="30" />
          <Line x1="42" y1="14" x2="44" y2="22" />
        </G>

        {/* Left Floppy Ear (Drooping caramel brown with dark outline) */}
        <Path
          d="M 38 48 C 22 48, 14 62, 18 84 C 21 98, 36 102, 46 90 C 50 82, 48 62, 38 48 Z"
          fill="#C4834E"
          stroke="#5A3825"
          strokeWidth="2.2"
        />
        {/* Inner ear shadow */}
        <Path
          d="M 26 62 C 22 72, 24 88, 34 94 C 36 86, 36 70, 26 62 Z"
          fill="#A4602E"
          opacity={0.35}
        />

        {/* Right Floppy Ear (Drooping caramel brown with dark outline) */}
        <Path
          d="M 124 48 C 140 48, 148 62, 144 84 C 141 98, 126 102, 116 90 C 112 82, 114 62, 124 48 Z"
          fill="#C4834E"
          stroke="#5A3825"
          strokeWidth="2.2"
        />
        <Path
          d="M 136 62 C 140 72, 138 88, 128 94 C 126 86, 126 70, 136 62 Z"
          fill="#A4602E"
          opacity={0.35}
        />

        {/* Puppy Body/Chest Behind Paws */}
        <Path
          d="M 46 98 C 46 98, 56 122, 81 122 C 106 122, 116 98, 116 98 L 126 135 L 36 135 Z"
          fill="#C4834E"
          stroke="#5A3825"
          strokeWidth="2.2"
        />
        {/* White Chest Patch */}
        <Path
          d="M 60 102 C 68 116, 81 118, 81 118 C 81 118, 94 116, 102 102 L 100 135 L 62 135 Z"
          fill="#FFFFFF"
        />

        {/* Puppy Head Base (Caramel / Golden brown) */}
        <Ellipse
          cx="81"
          cy="74"
          rx="45"
          ry="40"
          fill="#D6945B"
          stroke="#5A3825"
          strokeWidth="2.2"
        />

        {/* White Forehead Blaze & Snout Area */}
        <Path
          d="M 81 38 C 76 46, 70 58, 64 68 C 58 76, 58 90, 70 94 C 77 96, 85 96, 92 94 C 104 90, 104 76, 98 68 C 92 58, 86 46, 81 38 Z"
          fill="#FFFFFF"
          stroke="#5A3825"
          strokeWidth="2.2"
        />

        {/* Rosy Blushing Cheeks */}
        <Ellipse cx="50" cy="85" rx="9" ry="5.5" fill="#FFA592" opacity={0.65} />
        <Ellipse cx="112" cy="85" rx="9" ry="5.5" fill="#FFA592" opacity={0.65} />

        {/* Eyes (Big, Joyful, Round with Specular Highlights) */}
        {/* Left Eye */}
        <Circle cx="62" cy="69" r="6.5" fill="#2E1C14" />
        <Circle cx="60" cy="66.5" r="2.4" fill="#FFFFFF" />
        <Circle cx="64" cy="71" r="1.1" fill="#FFFFFF" />

        {/* Right Eye */}
        <Circle cx="100" cy="69" r="6.5" fill="#2E1C14" />
        <Circle cx="98" cy="66.5" r="2.4" fill="#FFFFFF" />
        <Circle cx="102" cy="71" r="1.1" fill="#FFFFFF" />

        {/* Cute Eyebrows */}
        <Path
          d="M 56 58 C 60 55, 66 55, 68 58"
          stroke="#8A4E27"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 94 58 C 96 55, 102 55, 106 58"
          stroke="#8A4E27"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cute Dark Brown Nose */}
        <Path
          d="M 76 77 C 76 73, 86 73, 86 77 C 86 81, 81 84, 81 84 C 81 84, 76 81, 76 77 Z"
          fill="#2A170F"
        />
        <Circle cx="79" cy="76" r="1" fill="#FFFFFF" opacity={0.7} />

        {/* Happy Smiling Open Mouth */}
        <Path
          d="M 73 84 C 77 87, 81 87, 81 87 C 81 87, 85 87, 89 84"
          stroke="#2A170F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Open Mouth cavity */}
        <Path
          d="M 73 85 C 73 96, 89 96, 89 85 Z"
          fill="#631B15"
          stroke="#2A170F"
          strokeWidth="1.5"
        />
        {/* Pink Tongue Hanging Out */}
        <Path
          d="M 76 88 C 76 98, 86 98, 86 88 Z"
          fill="#FF7E8E"
        />

        {/* Paws Resting Directly Over The Edge */}
        {/* Left Paw */}
        <G transform="translate(44, 118)">
          <Path
            d="M 3 24 C 0 16, 2 6, 12 6 C 22 6, 26 16, 23 24 Z"
            fill="#FFFFFF"
            stroke="#5A3825"
            strokeWidth="2.2"
          />
          {/* Paw Toe Separators */}
          <Line x1="9" y1="12" x2="9" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
          <Line x1="16" y1="12" x2="16" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
        </G>

        {/* Right Paw */}
        <G transform="translate(93, 118)">
          <Path
            d="M 3 24 C 0 16, 2 6, 12 6 C 22 6, 26 16, 23 24 Z"
            fill="#FFFFFF"
            stroke="#5A3825"
            strokeWidth="2.2"
          />
          {/* Paw Toe Separators */}
          <Line x1="9" y1="12" x2="9" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
          <Line x1="16" y1="12" x2="16" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
        </G>
      </Svg>
    </View>
  );
}

// ============================================================================
// 2. CUTE CAT PEEKING (Faithfully crafted from reference image)
// Pointed cat ears with pink inner ear, tabby grey patch over right ear/eye,
// smiling squinting crescent eyes (^ ^), cute whiskers, pink cat nose and mouth,
// and two cute white paws resting over the border.
// ============================================================================
export function CuteCatPeeking({
  width = 175,
  height = 150,
  style,
}: {
  width?: number;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.wrapper, style]}>
      <Svg width={width} height={height} viewBox="0 0 170 145">
        {/* Floating Heart near kitten top-right */}
        <G transform="translate(112, 10) rotate(15)">
          <Path
            d="M 10 3.5 C 6 -1.5, 0 1, 0 6.5 C 0 12, 10 17.5, 10 17.5 C 10 17.5, 20 12, 20 6.5 C 20 1, 14 -1.5, 10 3.5 Z"
            fill="#EFA391"
          />
        </G>

        {/* Sparkle / Sunburst lines top-right */}
        <G stroke="#E6A15C" strokeWidth="2.8" strokeLinecap="round">
          <Line x1="154" y1="36" x2="144" y2="42" />
          <Line x1="144" y1="22" x2="137" y2="30" />
          <Line x1="128" y1="14" x2="126" y2="22" />
        </G>

        {/* Left Ear (White with dark outline) */}
        <Path
          d="M 40 58 L 28 22 C 42 24, 58 36, 62 48 Z"
          fill="#FFFFFF"
          stroke="#5A3825"
          strokeWidth="2.2"
        />
        {/* Left Inner Ear Pink */}
        <Path d="M 40 50 L 33 30 C 42 32, 52 40, 54 46 Z" fill="#FFA5B5" />

        {/* Right Ear (Grey Tabby with dark outline) */}
        <Path
          d="M 122 58 L 134 22 C 120 24, 104 36, 100 48 Z"
          fill="#8A786E"
          stroke="#5A3825"
          strokeWidth="2.2"
        />
        {/* Right Inner Ear Pink */}
        <Path d="M 122 50 L 129 30 C 120 32, 110 40, 108 46 Z" fill="#FFA5B5" />

        {/* Kitten Body/Chest Behind Paws */}
        <Path
          d="M 48 98 C 48 98, 58 122, 81 122 C 104 122, 114 98, 114 98 L 124 135 L 38 135 Z"
          fill="#FAF3EC"
          stroke="#5A3825"
          strokeWidth="2.2"
        />

        {/* Head Base - White Cat Face */}
        <Ellipse
          cx="81"
          cy="74"
          rx="45"
          ry="38"
          fill="#FFFFFF"
          stroke="#5A3825"
          strokeWidth="2.2"
        />

        {/* Tabby Grey Patch over right ear and right eye */}
        <Path
          d="M 81 36 C 96 36, 116 46, 123 58 C 130 68, 126 84, 116 92 C 106 97, 93 90, 88 72 C 85 58, 83 44, 81 36 Z"
          fill="#8A786E"
        />

        {/* Blushing Cheeks */}
        <Ellipse cx="50" cy="84" rx="9" ry="5.5" fill="#FFA592" opacity={0.65} />
        <Ellipse cx="112" cy="84" rx="9" ry="5.5" fill="#FFA592" opacity={0.65} />

        {/* Cheerful Squinting Happy Crescent Eyes (^ ^) */}
        {/* Left Eye */}
        <Path
          d="M 52 69 Q 62 61 70 69"
          stroke="#2E1C14"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eye (White outline on grey patch) */}
        <Path
          d="M 92 69 Q 100 61 110 69"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Whiskers */}
        {/* Left Whiskers */}
        <Line x1="26" y1="74" x2="44" y2="76" stroke="#5A3825" strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="24" y1="82" x2="44" y2="81" stroke="#5A3825" strokeWidth="1.6" strokeLinecap="round" />
        <Line x1="28" y1="90" x2="46" y2="85" stroke="#5A3825" strokeWidth="1.6" strokeLinecap="round" />

        {/* Right Whiskers (White/bright on grey) */}
        <Line x1="136" y1="74" x2="118" y2="76" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="138" y1="82" x2="118" y2="81" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="134" y1="90" x2="116" y2="85" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

        {/* Cute Pink Cat Nose */}
        <Path
          d="M 77 78 L 85 78 L 81 83 Z"
          fill="#FF7E8E"
        />

        {/* Cute Smiling Cat Mouth (ω) */}
        <Path
          d="M 72 84 C 75 88, 80 88, 81 84 C 82 88, 87 88, 90 84"
          stroke="#2E1C14"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Small Open Pink Smile Tongue */}
        <Path
          d="M 77 86 C 77 92, 85 92, 85 86 Z"
          fill="#FF7E8E"
          stroke="#2E1C14"
          strokeWidth="1.2"
        />

        {/* Paws Resting Directly Over The Edge */}
        {/* Left Paw */}
        <G transform="translate(44, 118)">
          <Path
            d="M 3 24 C 0 16, 2 6, 12 6 C 22 6, 26 16, 23 24 Z"
            fill="#FFFFFF"
            stroke="#5A3825"
            strokeWidth="2.2"
          />
          <Line x1="9" y1="12" x2="9" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
          <Line x1="16" y1="12" x2="16" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
        </G>

        {/* Right Paw */}
        <G transform="translate(93, 118)">
          <Path
            d="M 3 24 C 0 16, 2 6, 12 6 C 22 6, 26 16, 23 24 Z"
            fill="#FFFFFF"
            stroke="#5A3825"
            strokeWidth="2.2"
          />
          <Line x1="9" y1="12" x2="9" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
          <Line x1="16" y1="12" x2="16" y2="23" stroke="#5A3825" strokeWidth="2" strokeLinecap="round" />
        </G>
      </Svg>
    </View>
  );
}

// ============================================================================
// 3. CUTE PAW PRINT (Scalable Vector)
// ============================================================================
export function CutePawPrint({
  size = 24,
  color = '#ECD9C6',
  opacity = 1,
  style,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
        <Circle cx="6" cy="7" r="2.2" fill={color} />
        <Circle cx="10" cy="4" r="2.5" fill={color} />
        <Circle cx="14" cy="4" r="2.5" fill={color} />
        <Circle cx="18" cy="7" r="2.2" fill={color} />
        <Path
          d="M 7 13 C 7 10.5, 17 10.5, 17 13 C 18.5 17, 16 19.5, 12 19.5 C 8 19.5, 5.5 17, 7 13 Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

// ============================================================================
// 4. CUTE DOG BONE (From Reference Image bottom-right)
// White bone with dark outline tilted at 45 degrees
// ============================================================================
export function CuteBone({
  size = 46,
  color = '#FFFFFF',
  strokeColor = '#5A3825',
  style,
}: {
  size?: number;
  color?: string;
  strokeColor?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      <Svg width={size} height={size * 0.55} viewBox="0 0 44 24">
        <Path
          d="M 10 4 C 6 0, 1 2, 2 8 C 0 13, 5 17, 10 13 L 34 13 C 39 17, 44 13, 42 8 C 43 2, 38 0, 34 4 L 10 4 Z"
          fill={color}
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// ============================================================================
// 5. SUNBURST RAYS (Flanking title in Reference Image)
// 3 angled tick lines
// ============================================================================
export function CuteSunburst({
  direction = 'left',
  color = '#E6A15C',
  size = 28,
}: {
  direction?: 'left' | 'right';
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      style={direction === 'right' ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <G stroke={color} strokeWidth="3" strokeLinecap="round">
        <Line x1="4" y1="14" x2="13" y2="14" />
        <Line x1="7" y1="7" x2="15" y2="12" />
        <Line x1="7" y1="21" x2="15" y2="16" />
      </G>
    </Svg>
  );
}

// ============================================================================
// 6. WAVY TOP BANNER (Organic cream & caramel curves from reference image)
// ============================================================================
export function WavyTopBanner({
  width = 800,
  height = 95,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 800 95"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      {/* Background Soft Cream/Caramel Wave */}
      <Path
        d="M 0 0 L 800 0 L 800 60 C 680 85, 540 40, 400 62 C 260 84, 120 48, 0 72 Z"
        fill="#F3E5D4"
      />
      {/* Foreground Caramel Ribbon */}
      <Path
        d="M 0 0 L 800 0 L 800 38 C 700 62, 580 20, 400 38 C 220 56, 100 24, 0 46 Z"
        fill="#E8CFB7"
      />
      {/* Right Corner Accent Paw Silhouette in Caramel Ribbon */}
      <G transform="translate(720, 10) scale(1.1)">
        <Circle cx="8" cy="9" r="3.2" fill="#FFFFFF" opacity={0.88} />
        <Circle cx="16" cy="4" r="3.8" fill="#FFFFFF" opacity={0.88} />
        <Circle cx="24" cy="4" r="3.8" fill="#FFFFFF" opacity={0.88} />
        <Circle cx="32" cy="9" r="3.2" fill="#FFFFFF" opacity={0.88} />
        <Path
          d="M 10 16 C 10 13, 30 13, 30 16 C 33 23, 27 26, 20 26 C 13 26, 7 23, 10 16 Z"
          fill="#FFFFFF"
          opacity={0.88}
        />
      </G>
    </Svg>
  );
}

// ============================================================================
// 7. WAVY BOTTOM BANNER (Organic bottom wave from reference image)
// ============================================================================
export function WavyBottomBanner({
  width = 800,
  height = 85,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 800 85"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      <Path
        d="M 0 38 C 140 18, 280 50, 420 28 C 560 8, 680 44, 800 22 L 800 85 L 0 85 Z"
        fill="#F3E5D4"
      />
      <Path
        d="M 0 54 C 160 36, 300 62, 440 42 C 580 24, 700 52, 800 40 L 800 85 L 0 85 Z"
        fill="#E8CFB7"
      />
    </Svg>
  );
}

// ============================================================================
// 8. CARE TASK TOP-LEFT CORNER WAVE (From Reference Image)
// Organic coral & peach wavy shapes in top left corner
// ============================================================================
export function CareTaskTopLeftWave({
  width = 170,
  height = 180,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 170 180" style={StyleSheet.absoluteFill}>
      {/* Outer soft peach wave */}
      <Path
        d="M 0 0 L 165 0 C 145 45, 120 80, 85 115 C 50 150, 22 168, 0 180 Z"
        fill="#FFD2C2"
        opacity={0.88}
      />
      {/* Inner coral layer */}
      <Path
        d="M 0 0 L 125 0 C 105 35, 82 65, 55 95 C 30 125, 12 142, 0 155 Z"
        fill="#FA8564"
      />
    </Svg>
  );
}

// ============================================================================
// 9. CARE TASK TOP-RIGHT CORNER WAVE (From Reference Image)
// Organic coral & peach wavy shapes in top right corner behind Skip button
// ============================================================================
export function CareTaskTopRightWave({
  width = 175,
  height = 140,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 175 140" style={StyleSheet.absoluteFill}>
      {/* Outer soft peach wave */}
      <Path
        d="M 175 0 L 15 0 C 45 35, 78 58, 112 78 C 140 95, 160 115, 175 140 Z"
        fill="#FFD2C2"
        opacity={0.88}
      />
      {/* Inner coral layer */}
      <Path
        d="M 175 0 L 68 0 C 92 28, 120 48, 140 68 C 158 84, 168 96, 175 112 Z"
        fill="#FA8564"
      />
    </Svg>
  );
}

// ============================================================================
// 10. CARE TASK BOTTOM WAVY BANNER (From Reference Image)
// Continuous organic bottom wave rising into bottom-left and bottom-right
// ============================================================================
export function CareTaskBottomWave({
  width = 800,
  height = 110,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 800 110"
      preserveAspectRatio="none"
      style={StyleSheet.absoluteFill}
    >
      {/* Outer soft peach wave */}
      <Path
        d="M 0 15 C 130 55, 260 75, 400 68 C 540 62, 670 40, 800 10 L 800 110 L 0 110 Z"
        fill="#FFD2C2"
        opacity={0.9}
      />
      {/* Inner coral layer */}
      <Path
        d="M 0 45 C 140 75, 270 90, 400 84 C 530 78, 660 62, 800 38 L 800 110 L 0 110 Z"
        fill="#FA8564"
      />
    </Svg>
  );
}

// ============================================================================
// 11. CARE TASK DASHES (From Reference Image)
// Slanted coral tick marks flanking the "Never Miss a Care Task" title
// ============================================================================
export function CareTaskDashes({
  direction = 'left',
  color = '#FA7350',
}: {
  direction?: 'left' | 'right';
  color?: string;
}) {
  return (
    <Svg
      width={24}
      height={22}
      viewBox="0 0 24 22"
      style={direction === 'right' ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      {/* Upper dash */}
      <Line
        x1="18"
        y1="3"
        x2="9"
        y2="12"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Lower dash */}
      <Line
        x1="11"
        y1="11"
        x2="4"
        y2="19"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ============================================================================
// 12. FOUR POINT DIAMOND SPARKLE STAR (From Reference Image)
// Golden sparkle stars scattered in background (✦)
// ============================================================================
export function FourPointStar({
  size = 18,
  color = '#F5A623',
  opacity = 0.85,
  style,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.wrapper, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M 12 0 C 12 7, 17 12, 24 12 C 17 12, 12 17, 12 24 C 12 17, 7 12, 0 12 C 7 12, 12 7, 12 0 Z"
          fill={color}
          opacity={opacity}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
