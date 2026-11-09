import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme';
import type { WeightEntry } from '@/db/types';

interface WeightChartProps {
  entries: WeightEntry[];
  unit?: string;
  petName?: string;
}

export function WeightChart({ entries, unit = 'kg', petName }: WeightChartProps) {
  const theme = useTheme();

  if (entries.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          No weight entries recorded yet. Add your first entry to see growth trends!
        </Text>
      </View>
    );
  }

  const sorted = [...entries].sort((a, b) => a.logged_at - b.logged_at);
  const currentWeight = sorted[sorted.length - 1].weight;
  const initialWeight = sorted[0].weight;
  const diff = Number((currentWeight - initialWeight).toFixed(1));
  const diffSign = diff > 0 ? `+${diff}` : `${diff}`;

  const weights = sorted.map((e) => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW === 0 ? 2 : maxW - minW;

  const chartWidth = Dimensions.get('window').width - 64;
  const chartHeight = 140;
  const padX = 20;
  const padY = 24;

  const getX = (index: number) => {
    if (sorted.length <= 1) return chartWidth / 2;
    return padX + (index / (sorted.length - 1)) * (chartWidth - 2 * padX);
  };

  const getY = (val: number) => {
    return (
      chartHeight -
      padY -
      ((val - minW) / range) * (chartHeight - 2 * padY)
    );
  };

  // Build SVG path
  let pathD = '';
  let fillD = '';
  if (sorted.length > 1) {
    sorted.forEach((e, i) => {
      const x = getX(i);
      const y = getY(e.weight);
      if (i === 0) {
        pathD += `M ${x} ${y}`;
        fillD += `M ${x} ${chartHeight} L ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        fillD += ` L ${x} ${y}`;
      }
    });
    fillD += ` L ${getX(sorted.length - 1)} ${chartHeight} Z`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            {petName ? `${petName}'s Weight History` : 'Weight History'}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {sorted.length} {sorted.length === 1 ? 'measurement' : 'measurements'} recorded
          </Text>
        </View>

        <View style={styles.metricWrap}>
          <Text style={[styles.metricVal, { color: theme.weight }]}>
            {currentWeight} {unit}
          </Text>
          {sorted.length > 1 && (
            <View style={[styles.diffBadge, { backgroundColor: theme.weightLight }]}>
              <Text style={[styles.diffText, { color: theme.weight }]}>
                {diffSign} {unit}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={theme.weight} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={theme.weight} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line
            x1={padX}
            y1={padY}
            x2={chartWidth - padX}
            y2={padY}
            stroke={theme.border}
            strokeDasharray="4,4"
            strokeWidth="1"
          />
          <Line
            x1={padX}
            y1={chartHeight / 2}
            x2={chartWidth - padX}
            y2={chartHeight / 2}
            stroke={theme.border}
            strokeDasharray="4,4"
            strokeWidth="1"
          />
          <Line
            x1={padX}
            y1={chartHeight - padY}
            x2={chartWidth - padX}
            y2={chartHeight - padY}
            stroke={theme.border}
            strokeDasharray="4,4"
            strokeWidth="1"
          />

          {/* Fill under line */}
          {sorted.length > 1 && <Path d={fillD} fill="url(#weightGrad)" />}

          {/* Line */}
          {sorted.length > 1 && (
            <Path
              d={pathD}
              fill="none"
              stroke={theme.weight}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {sorted.map((item, idx) => {
            const cx = getX(idx);
            const cy = getY(item.weight);
            const isLast = idx === sorted.length - 1;
            return (
              <React.Fragment key={item.id}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={isLast ? 6 : 4}
                  fill={isLast ? theme.weight : theme.card}
                  stroke={theme.weight}
                  strokeWidth={2}
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Date labels */}
      <View style={styles.dateLabels}>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {new Date(sorted[0].logged_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </Text>
        {sorted.length > 2 && (
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {new Date(sorted[Math.floor(sorted.length / 2)].logged_at).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {new Date(sorted[sorted.length - 1].logged_at).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
