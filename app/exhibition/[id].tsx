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
import { getExhibitionById } from "../../data/exhibitions";
import type { Exhibition } from "../../data/exhibitions";

/**
 * 전시 오디오 가이드 페이지 컴포넌트
 */
export default function ExhibitionGuideScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | undefined>(undefined);

  useEffect(() => {
    setExhibition(getExhibitionById(id));
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

