import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { scale, verticalScale, moderateScale, radius } from '../../theme/responsive';
import { useStore } from '../../store/useStore';

interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = verticalScale(140),
  barColor,
}) => {
  const { colors } = useStore();
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - verticalScale(30);
  const barWidth = scale(28);
  const gap = scale(14);
  const totalSvgWidth = data.length * (barWidth + gap) + gap;

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${totalSvgWidth} ${height}`}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = index * (barWidth + gap) + gap;
          const y = chartHeight - barHeight;

          return (
            <React.Fragment key={item.label}>
              {/* Background bar slot */}
              <Rect
                x={x}
                y={0}
                width={barWidth}
                height={chartHeight}
                fill={colors.backgroundSecondary}
                rx={radius.sm}
              />
              {/* Value bar */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor || colors.secondary}
                rx={radius.sm}
              />
              {/* Label */}
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight + verticalScale(18)}
                fontSize={moderateScale(10)}
                fill={colors.textSecondary}
                fontWeight="600"
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

interface DueRatioBarProps {
  paid: number;
  due: number;
}

export const DueRatioBar: React.FC<DueRatioBarProps> = ({ paid, due }) => {
  const { colors, t } = useStore();
  const total = paid + due || 1;
  const paidPercent = Math.round((paid / total) * 100);
  const duePercent = 100 - paidPercent;

  return (
    <View style={styles.ratioContainer}>
      <View style={styles.ratioHeader}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={[styles.ratioLabel, { color: colors.textSecondary }]}>
            {t.paidStatus}: ৳{paid.toLocaleString()} ({paidPercent}%)
          </Text>
        </View>

        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <Text style={[styles.ratioLabel, { color: colors.textSecondary }]}>
            {t.dueStatus}: ৳{due.toLocaleString()} ({duePercent}%)
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.backgroundSecondary }]}>
        <View
          style={[
            styles.segment,
            {
              width: `${paidPercent}%`,
              backgroundColor: colors.success,
              borderTopLeftRadius: radius.pill,
              borderBottomLeftRadius: radius.pill,
            },
          ]}
        />
        <View
          style={[
            styles.segment,
            {
              width: `${duePercent}%`,
              backgroundColor: colors.danger,
              borderTopRightRadius: radius.pill,
              borderBottomRightRadius: radius.pill,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: verticalScale(10),
  },
  ratioContainer: {
    marginVertical: verticalScale(12),
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: radius.pill,
    marginRight: scale(6),
  },
  ratioLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  track: {
    flexDirection: 'row',
    height: verticalScale(10),
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
});

