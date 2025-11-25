/**
 * 전시 오디오 가이드 페이지
 * 특정 전시의 오디오 가이드를 제공하는 페이지
 */

import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../theme/colors";
import { getExhibitionById } from "../../data/exhibitions";
import type { Exhibition } from "../../data/exhibitions";
import { useDismissGestureOptional } from "../../contexts/DismissGestureContext";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * 전시 오디오 가이드 페이지 컴포넌트
 */
export default function ExhibitionGuideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | undefined>(undefined);
  const dismissGesture = useDismissGestureOptional();
  const { scale: scaleFunc, moderateScale } = useResponsive();

  useEffect(() => {
    setExhibition(getExhibitionById(id));
  }, [id]);

  // 드래그 진행도에 따라 스케일 계산
  // dismissProgress = 0 (재생 페이지 열림) → scale = 0.9 (축소)
  // dismissProgress = 1 (드래그 완료) → scale = 1.0 (정상 크기로 복귀)
  const scaleAnim =
    dismissGesture?.dismissProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
      extrapolate: "clamp",
    }) || new Animated.Value(1);

  // 반응형 스타일
  const styles = useMemo(() => createStyles(scaleFunc, moderateScale), [scaleFunc, moderateScale]);

  if (!exhibition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <Text style={styles.errorText}>전시를 찾을 수 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.logo}>ODI</Text>
            </View>
          </View>

          {/* 전시 정보 */}
          <View style={styles.exhibitionInfo}>
            <Text style={styles.title}>{exhibition.title}</Text>
            <Text style={styles.location}>{exhibition.location}</Text>
            <Text style={styles.subtitle}>{exhibition.subtitle}</Text>
            <Text style={styles.description}>{exhibition.description}</Text>
          </View>

          {/* 작품 목록 */}
          <View style={styles.artworkList}>
            <Text style={styles.sectionTitle}>오디오 가이드</Text>
            {exhibition.artworks.map((artwork, index) => (
              <TouchableOpacity
                key={artwork.id}
                style={styles.artworkCard}
                onPress={() => {
                  router.push(`/exhibition/${exhibition.id}/audio/${artwork.id}`);
                }}
              >
                <View style={styles.artworkNumber}>
                  <Text style={styles.artworkNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.artworkContent}>
                  <Text style={styles.artworkTitle}>{artwork.title}</Text>
                  <Text style={styles.artworkArtist}>{artwork.artist}</Text>
                </View>
                <View style={styles.artworkDuration}>
                  <Text style={styles.artworkDurationText}>{artwork.duration}</Text>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (scale: (size: number) => number, moderateScale: (size: number, factor?: number) => number) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    animatedContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: scale(20),
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: scale(20),
      paddingTop: scale(20),
      paddingBottom: scale(40),
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: scale(32),
    },
    backButton: {
      width: scale(40),
      height: scale(40),
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: scale(12),
    },
    backButtonText: {
      fontSize: moderateScale(24),
      color: colors.text.primary,
      fontWeight: "300" as const,
    },
    headerContent: {
      flex: 1,
    },
    logo: {
      fontSize: moderateScale(22),
      fontWeight: "200" as const,
      color: colors.text.primary,
      letterSpacing: 3,
    },
    errorText: {
      fontSize: moderateScale(16),
      color: colors.text.secondary,
      marginBottom: scale(20),
    },
    exhibitionInfo: {
      marginBottom: scale(40),
      paddingBottom: scale(24),
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.05)",
    },
    title: {
      fontSize: moderateScale(22),
      fontWeight: "300" as const,
      color: colors.text.primary,
      marginBottom: scale(8),
      letterSpacing: 0.3,
    },
    location: {
      fontSize: moderateScale(14),
      fontWeight: "300" as const,
      color: colors.text.secondary,
      marginBottom: scale(8),
      letterSpacing: 0.3,
    },
    subtitle: {
      fontSize: moderateScale(13),
      fontWeight: "300" as const,
      color: colors.text.muted,
      marginBottom: scale(16),
      letterSpacing: 0.2,
    },
    description: {
      fontSize: moderateScale(15),
      fontWeight: "300" as const,
      color: colors.text.secondary,
      lineHeight: moderateScale(22),
      letterSpacing: 0.2,
    },
    artworkList: {
      gap: scale(12),
    },
    sectionTitle: {
      fontSize: moderateScale(16),
      fontWeight: "400" as const,
      color: colors.text.primary,
      marginBottom: scale(16),
      letterSpacing: 0.5,
    },
    artworkCard: {
      backgroundColor: colors.background.card,
      borderRadius: scale(8),
      padding: scale(16),
      flexDirection: "row" as const,
      alignItems: "center" as const,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.03)",
      ...(Platform.OS === "web" &&
        ({
          transition: "all 0.3s ease",
          cursor: "pointer",
        } as any)),
    },
    artworkNumber: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: scale(16),
    },
    artworkNumberText: {
      fontSize: moderateScale(14),
      fontWeight: "400" as const,
      color: colors.text.secondary,
    },
    artworkContent: {
      flex: 1,
    },
    artworkTitle: {
      fontSize: moderateScale(16),
      fontWeight: "400" as const,
      color: colors.text.primary,
      marginBottom: scale(4),
    },
    artworkArtist: {
      fontSize: moderateScale(13),
      fontWeight: "300" as const,
      color: colors.text.secondary,
    },
    artworkDuration: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: scale(12),
    },
    artworkDurationText: {
      fontSize: moderateScale(13),
      fontWeight: "300" as const,
      color: colors.text.muted,
    },
    playIcon: {
      fontSize: moderateScale(16),
      color: colors.text.primary,
      fontWeight: "300" as const,
    },
  });
