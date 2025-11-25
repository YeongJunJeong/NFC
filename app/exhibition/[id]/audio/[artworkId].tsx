/**
 * 전시 작품 오디오 재생 페이지
 * 특정 작품의 오디오 가이드를 재생/일시정지할 수 있는 화면
 */

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../../../../theme/colors";
import { getArtworkById } from "../../../../data/exhibitions";

export default function ArtworkAudioScreen() {
  const router = useRouter();
  const { id, artworkId } = useLocalSearchParams<{ id: string; artworkId: string }>();
  const { exhibition, artwork } = useMemo(() => getArtworkById(id, artworkId), [id, artworkId]);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const duration = status?.isLoaded ? status.durationMillis ?? 0 : 0;

  const formattedPosition = formatMillis(position);
  const formattedDuration = duration ? formatMillis(duration) : artwork?.duration ?? "--:--";

  const handleTogglePlayback = async () => {
    if (!artwork) return;

    try {
      if (!sound) {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: artwork.audioUrl },
          { shouldPlay: true }
        );

        newSound.setOnPlaybackStatusUpdate((nextStatus) => {
          if (nextStatus.isLoaded) {
            setStatus(nextStatus);
          }
        });

        setSound(newSound);
        setIsLoading(false);
        return;
      }

      const currentStatus = await sound.getStatusAsync();
      if (!currentStatus.isLoaded) {
        return;
      }

      if (currentStatus.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.warn("Audio playback error", error);
      setIsLoading(false);
    }
  };

  if (!exhibition || !artwork) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>작품 정보를 찾을 수 없습니다.</Text>
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
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>ODI</Text>
        </View>

        {/* 작품 정보 */}
        <View style={styles.artworkInfo}>
          <Text style={styles.exhibitionName}>{exhibition.title}</Text>
          <Text style={styles.artworkTitle}>{artwork.title}</Text>
          <Text style={styles.artworkArtist}>{artwork.artist}</Text>
        </View>

        {/* 플레이어 */}
        <View style={styles.playerCard}>
          <Text style={styles.sectionLabel}>오디오 가이드</Text>
          <View style={styles.wavePlaceholder}>
            <Text style={styles.waveText}>∿∿∿∿∿∿</Text>
          </View>
          <Text style={styles.durationLabel}>
            {formattedPosition} / {formattedDuration}
          </Text>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handleTogglePlayback}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.playButtonText}>{isPlaying ? "일시정지" : "재생"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function formatMillis(value: number) {
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 22,
    fontWeight: "200",
    color: colors.text.primary,
    letterSpacing: 3,
    marginLeft: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 22,
    color: colors.text.primary,
    fontWeight: "300",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  artworkInfo: {
    marginBottom: 32,
  },
  exhibitionName: {
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  artworkTitle: {
    fontSize: 24,
    fontWeight: "300",
    color: colors.text.primary,
    marginBottom: 6,
  },
  artworkArtist: {
    fontSize: 16,
    fontWeight: "300",
    color: colors.text.secondary,
  },
  playerCard: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    flex: 1,
    justifyContent: "space-between",
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.text.muted,
    letterSpacing: 0.4,
  },
  wavePlaceholder: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  waveText: {
    fontSize: 32,
    color: colors.text.secondary,
    letterSpacing: 6,
  },
  durationLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: colors.background.cardHover,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  playButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  playButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "400",
    letterSpacing: 1.2,
  },
});


