/**
 * 전시 오디오 가이드 페이지
 * 특정 전시의 오디오 가이드를 제공하는 페이지
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

/**
 * 전시 데이터 (임시)
 * TODO: 실제 API에서 데이터를 가져오도록 수정
 */
const exhibitionData: Record<string, any> = {
  "1": {
    id: "1",
    title: "현대 미술의 흐름",
    subtitle: "2024.01.15 - 2024.03.31",
    location: "국립현대미술관",
    description: "20세기부터 현재까지의 현대 미술 작품들을 한눈에",
    artworks: [
      {
        id: "1-1",
        title: "작품 1",
        artist: "작가명",
        audioUrl: "/audio/1-1.mp3",
        duration: "3:24",
      },
      {
        id: "1-2",
        title: "작품 2",
        artist: "작가명",
        audioUrl: "/audio/1-2.mp3",
        duration: "4:12",
      },
      {
        id: "1-3",
        title: "작품 3",
        artist: "작가명",
        audioUrl: "/audio/1-3.mp3",
        duration: "2:45",
      },
    ],
  },
  "2": {
    id: "2",
    title: "인상주의의 빛",
    subtitle: "2024.02.01 - 2024.04.30",
    location: "서울시립미술관",
    description: "모네, 르누아르 등 인상주의 거장들의 작품 전시",
    artworks: [
      {
        id: "2-1",
        title: "작품 1",
        artist: "작가명",
        audioUrl: "/audio/2-1.mp3",
        duration: "3:24",
      },
      {
        id: "2-2",
        title: "작품 2",
        artist: "작가명",
        audioUrl: "/audio/2-2.mp3",
        duration: "4:12",
      },
    ],
  },
  "3": {
    id: "3",
    title: "한국 현대 조각",
    subtitle: "2024.02.10 - 2024.05.15",
    location: "예술의전당",
    description: "한국 현대 조각가들의 작품을 만나보세요",
    artworks: [
      {
        id: "3-1",
        title: "작품 1",
        artist: "작가명",
        audioUrl: "/audio/3-1.mp3",
        duration: "3:24",
      },
    ],
  },
};

/**
 * 전시 오디오 가이드 페이지 컴포넌트
 */
export default function ExhibitionGuideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<any>(null);

  useEffect(() => {
    if (id && exhibitionData[id]) {
      setExhibition(exhibitionData[id]);
    }
  }, [id]);

  if (!exhibition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <Text style={styles.errorText}>전시를 찾을 수 없습니다</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
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
          {exhibition.artworks.map((artwork: any, index: number) => (
            <TouchableOpacity
              key={artwork.id}
              style={styles.artworkCard}
              onPress={() => {
                // TODO: 오디오 재생 페이지로 이동
                console.log("Play audio:", artwork.audioUrl);
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: "300",
  },
  headerContent: {
    flex: 1,
  },
  logo: {
    fontSize: 22,
    fontWeight: "200",
    color: colors.text.primary,
    letterSpacing: 3,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  exhibitionInfo: {
    marginBottom: 40,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  title: {
    fontSize: 22,
    fontWeight: "300",
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  location: {
    fontSize: 14,
    fontWeight: "300",
    color: colors.text.secondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "300",
    color: colors.text.muted,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    fontWeight: "300",
    color: colors.text.secondary,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  artworkList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  artworkCard: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    ...(Platform.OS === "web" && {
      transition: "all 0.3s ease",
      cursor: "pointer",
    } as any),
  },
  artworkNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  artworkNumberText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.secondary,
  },
  artworkContent: {
    flex: 1,
  },
  artworkTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
    marginBottom: 4,
  },
  artworkArtist: {
    fontSize: 13,
    fontWeight: "300",
    color: colors.text.secondary,
  },
  artworkDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  artworkDurationText: {
    fontSize: 13,
    fontWeight: "300",
    color: colors.text.muted,
  },
  playIcon: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "300",
  },
});

