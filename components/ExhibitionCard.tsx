/**
 * 전시 카드 컴포넌트
 * 진행중인 전시 정보를 표시하는 미니멀한 카드
 */

import React, { useMemo } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";
import type { Exhibition } from "../data/exhibitions";
import { useResponsive } from "../hooks/useResponsive";

interface ExhibitionCardProps {
  exhibition: Exhibition;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * 전시 카드 컴포넌트
 */
export const ExhibitionCard: React.FC<ExhibitionCardProps> = ({
  exhibition,
  onPress,
  style,
}) => {
  const { scale, moderateScale } = useResponsive();
  const styles = useMemo(() => createStyles(scale, moderateScale), [scale, moderateScale]);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
      {...(Platform.OS === "web" && {
        // @ts-ignore - 웹 전용 속성
        onMouseEnter: (e: any) => {
          e.currentTarget.style.backgroundColor = colors.background.cardHover;
          e.currentTarget.style.transform = "translateY(-2px)";
        },
        onMouseLeave: (e: any) => {
          e.currentTarget.style.backgroundColor = colors.background.card;
          e.currentTarget.style.transform = "translateY(0)";
        },
      })}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{exhibition.title}</Text>
          <Text style={styles.location}>{exhibition.location}</Text>
        </View>
        <Text style={styles.subtitle}>{exhibition.subtitle}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {exhibition.description}
        </Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (scale: (size: number) => number, moderateScale: (size: number, factor?: number) => number) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background.card,
      borderRadius: scale(8),
      padding: scale(20),
      flexDirection: "row" as const,
      alignItems: "center" as const,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.03)",
      ...(Platform.OS === "web" && {
        transition: "all 0.3s ease",
        cursor: "pointer",
      } as any),
    } as ViewStyle,
    content: {
      flex: 1,
      marginRight: scale(16),
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: scale(8),
    },
    title: {
      fontSize: moderateScale(17),
      fontWeight: "300" as const,
      color: colors.text.primary,
      flex: 1,
      marginRight: scale(12),
      letterSpacing: 0.3,
    } as TextStyle,
    location: {
      fontSize: moderateScale(12),
      fontWeight: "300" as const,
      color: colors.text.muted,
      letterSpacing: 0.2,
    } as TextStyle,
    subtitle: {
      fontSize: moderateScale(11),
      fontWeight: "300" as const,
      color: colors.text.muted,
      marginBottom: scale(10),
      letterSpacing: 0.2,
    } as TextStyle,
    description: {
      fontSize: moderateScale(13),
      fontWeight: "300" as const,
      color: colors.text.secondary,
      lineHeight: moderateScale(18),
      letterSpacing: 0.2,
    } as TextStyle,
    arrow: {
      width: scale(32),
      height: scale(32),
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    arrowText: {
      fontSize: moderateScale(18),
      color: colors.text.muted,
      fontWeight: "200" as const,
    } as TextStyle,
  });

