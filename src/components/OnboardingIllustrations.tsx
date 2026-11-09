import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';

export function ReminderCalendarIllustration() {
  return (
    <View style={styles.container}>
      <Svg width={280} height={200} viewBox="0 0 280 200">
        {/* Soft Peach Accent Circle in background */}
        <Circle cx="216" cy="154" r="22" fill="#FDE8DE" />
        <Circle cx="216" cy="154" r="14" fill="#F8DFD2" opacity={0.65} />

        {/* ========================================================
            1. CALENDAR CARD (Left)
           ======================================================== */}
        <G>
          {/* Subtle drop shadow backplate */}
          <Rect
            x="38"
            y="32"
            width="144"
            height="116"
            rx="18"
            fill="#6B4226"
            opacity={0.06}
          />
          {/* Main Calendar Body Card */}
          <Rect
            x="36"
            y="28"
            width="144"
            height="116"
            rx="18"
            fill="#FFFFFF"
            stroke="#EBDCC9"
            strokeWidth="1.5"
          />

          {/* Top Caramel Header of Calendar */}
          <Path
            d="M 36 46 A 18 18 0 0 1 54 28 L 162 28 A 18 18 0 0 1 180 46 L 180 58 L 36 58 Z"
            fill="#6B4226"
          />

          {/* Paw Icon inside Calendar Header */}
          <G transform="translate(48, 36) scale(0.68)">
            {/* 4 Toes */}
            <Circle cx="12" cy="7" r="3.2" fill="#FFFFFF" opacity={0.95} />
            <Circle cx="19" cy="3" r="3.4" fill="#FFFFFF" opacity={0.95} />
            <Circle cx="27" cy="3" r="3.4" fill="#FFFFFF" opacity={0.95} />
            <Circle cx="34" cy="7" r="3.2" fill="#FFFFFF" opacity={0.95} />
            {/* Palm Pad */}
            <Path
              d="M 14 14 C 14 11, 32 11, 32 14 C 34 20, 31 23, 23 23 C 15 23, 12 20, 14 14 Z"
              fill="#FFFFFF"
              opacity={0.95}
            />
          </G>

          {/* Header decorative dots */}
          <Circle cx="152" cy="43" r="2.5" fill="#FFFFFF" opacity={0.8} />
          <Circle cx="162" cy="43" r="2.5" fill="#FFFFFF" opacity={0.8} />

          {/* Calendar Grid Dates */}
          {/* Row 1 */}
          <Circle cx="56" cy="72" r="3.5" fill="#EBDCC9" />
          <Circle cx="76" cy="72" r="3.5" fill="#EBDCC9" />
          <Circle cx="96" cy="72" r="3.5" fill="#EBDCC9" />
          <Circle cx="116" cy="72" r="3.5" fill="#EBDCC9" />
          <Circle cx="136" cy="72" r="3.5" fill="#EBDCC9" />

          {/* Row 2 (with marked reminder dates in Warm Caramel) */}
          <Circle cx="56" cy="94" r="3.5" fill="#EBDCC9" />
          <Circle cx="76" cy="94" r="4.5" fill="#E07A5F" />
          <Circle cx="96" cy="94" r="3.5" fill="#EBDCC9" />
          <Circle cx="116" cy="94" r="3.5" fill="#EBDCC9" />
          <Circle cx="136" cy="94" r="4.5" fill="#E07A5F" />

          {/* Row 3 */}
          <Circle cx="56" cy="116" r="4.5" fill="#E07A5F" />
          <Circle cx="76" cy="116" r="3.5" fill="#EBDCC9" />
          <Circle cx="96" cy="116" r="3.5" fill="#EBDCC9" />
          <Circle cx="116" cy="116" r="3.5" fill="#EBDCC9" />
          <Circle cx="136" cy="116" r="3.5" fill="#EBDCC9" />
        </G>

        {/* ========================================================
            2. FLOATING TASK CARDS (Right Overlap)
           ======================================================== */}
        {/* Floating Card 1: Completed Task (Sage Green Check) */}
        <G>
          <Rect
            x="144"
            y="25"
            width="98"
            height="26"
            rx="9"
            fill="#6B4226"
            opacity={0.05}
          />
          <Rect
            x="142"
            y="22"
            width="98"
            height="26"
            rx="9"
            fill="#FFFFFF"
            stroke="#EBDCC9"
            strokeWidth="1.2"
          />
          {/* Green Check Badge */}
          <Circle cx="156" cy="35" r="7" fill="#48A974" />
          <Path
            d="M 153.5 35 L 155.5 37 L 159 33"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Text Bars */}
          <Rect x="168" y="31" width="48" height="4" rx="2" fill="#3D2619" />
          <Rect x="168" y="38" width="28" height="3" rx="1.5" fill="#8D7B6D" />
        </G>

        {/* Floating Card 2: Upcoming Task (Terracotta Dot) */}
        <G>
          <Rect
            x="148"
            y="59"
            width="94"
            height="26"
            rx="9"
            fill="#6B4226"
            opacity={0.05}
          />
          <Rect
            x="146"
            y="56"
            width="94"
            height="26"
            rx="9"
            fill="#FFFFFF"
            stroke="#EBDCC9"
            strokeWidth="1.2"
          />
          {/* Dot */}
          <Circle cx="159" cy="69" r="6" fill="#E07A5F" />
          {/* Text Bars */}
          <Rect x="171" y="65" width="46" height="4" rx="2" fill="#3D2619" />
          <Rect x="171" y="72" width="30" height="3" rx="1.5" fill="#8D7B6D" />
        </G>

        {/* Floating Card 3: Pending Task (Amber Dot) */}
        <G>
          <Rect
            x="142"
            y="93"
            width="96"
            height="26"
            rx="9"
            fill="#6B4226"
            opacity={0.05}
          />
          <Rect
            x="140"
            y="90"
            width="96"
            height="26"
            rx="9"
            fill="#FFFFFF"
            stroke="#EBDCC9"
            strokeWidth="1.2"
          />
          {/* Amber Dot */}
          <Circle cx="154" cy="103" r="6" fill="#E67E22" />
          {/* Text Bars */}
          <Rect x="166" y="99" width="48" height="4" rx="2" fill="#3D2619" />
          <Rect x="166" y="106" width="26" height="3" rx="1.5" fill="#8D7B6D" />
        </G>
      </Svg>
    </View>
  );
}

export function HealthCareIllustration() {
  return (
    <View style={styles.container}>
      <Svg width={280} height={200} viewBox="0 0 280 200">
        {/* Soft Warm Halo */}
        <Circle cx="210" cy="150" r="22" fill="#FDE8DE" />
        <Circle cx="210" cy="150" r="14" fill="#F8DFD2" opacity={0.65} />

        {/* Main Pet Health Dashboard Card */}
        <G>
          <Rect
            x="42"
            y="33"
            width="144"
            height="114"
            rx="18"
            fill="#6B4226"
            opacity={0.06}
          />
          <Rect
            x="40"
            y="30"
            width="144"
            height="114"
            rx="18"
            fill="#FFFFFF"
            stroke="#EBDCC9"
            strokeWidth="1.5"
          />

          {/* Top Header */}
          <Path
            d="M 40 48 A 18 18 0 0 1 58 30 L 166 30 A 18 18 0 0 1 184 48 L 184 60 L 40 60 Z"
            fill="#6B4226"
          />

          {/* Heart Beat Pulse Icon */}
          <Path
            d="M 52 45 L 60 45 L 63 38 L 68 52 L 72 41 L 75 45 L 85 45"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Metric Bar in Card */}
          <Rect x="54" y="74" width="70" height="6" rx="3" fill="#3D2619" />
          <Rect x="54" y="84" width="45" height="4" rx="2" fill="#8D7B6D" />

          {/* Mini Weight Line Chart */}
          <Path
            d="M 54 122 L 75 116 L 98 118 L 122 108 L 145 104 L 168 98"
            stroke="#48A974"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx="168" cy="98" r="4.5" fill="#48A974" />
          <Circle cx="168" cy="98" r="2" fill="#FFFFFF" />
        </G>

        {/* Floating Health Badge 1 */}
        <G>
          <Rect x="150" y="27" width="94" height="28" rx="10" fill="#6B4226" opacity={0.05} />
          <Rect x="148" y="24" width="94" height="28" rx="10" fill="#FFFFFF" stroke="#EBDCC9" strokeWidth="1.2" />
          <Circle cx="162" cy="38" r="7" fill="#DD6B7B" />
          <Path d="M 158 38 L 166 38 M 162 34 L 162 42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <Rect x="174" y="34" width="46" height="4" rx="2" fill="#3D2619" />
          <Rect x="174" y="41" width="28" height="3" rx="1.5" fill="#8D7B6D" />
        </G>

        {/* Floating Health Badge 2 */}
        <G>
          <Rect x="154" y="63" width="90" height="28" rx="10" fill="#6B4226" opacity={0.05} />
          <Rect x="152" y="60" width="90" height="28" rx="10" fill="#FFFFFF" stroke="#EBDCC9" strokeWidth="1.2" />
          <Circle cx="166" cy="74" r="7" fill="#E07A5F" />
          <Circle cx="166" cy="74" r="3" fill="#FFFFFF" />
          <Rect x="178" y="70" width="44" height="4" rx="2" fill="#3D2619" />
          <Rect x="178" y="77" width="26" height="3" rx="1.5" fill="#8D7B6D" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});
