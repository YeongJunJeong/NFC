/**
 * 전시 작품 오디오 재생 페이지
 * Apple Music 스타일의 오디오 재생 인터페이스
 */

import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions, ScrollView, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "../../../../theme/colors";
import { getArtworkById } from "../../../../data/exhibitions";
import { useDismissGesture } from "../../../../contexts/DismissGestureContext";
import { useResponsive } from "../../../../hooks/useResponsive";

export default function ArtworkAudioScreen() {
  const router = useRouter();
  const { id, artworkId } = useLocalSearchParams<{ id: string; artworkId: string }>();
  const { exhibition, artwork } = useMemo(() => getArtworkById(id, artworkId), [id, artworkId]);
  const { dismissProgress } = useDismissGesture();
  const { width, height, scale, moderateScale } = useResponsive();

  const SCREEN_WIDTH = width;
  const SCREEN_HEIGHT = height;
  const ARTWORK_SIZE = SCREEN_WIDTH * 0.75;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 아래로 드래그할 때만 반응
        return gestureState.dy > 10;
      },
      onPanResponderGrant: () => {
        // 드래그 시작 - dismissProgress는 이미 0
      },
      onPanResponderMove: (_, gestureState) => {
        // 아래로만 드래그 가능
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);

          // 드래그 진행도 (0~1)
          const progress = Math.min(gestureState.dy / SCREEN_HEIGHT, 1);

          // 뒤 페이지 스케일 업을 위한 진행도 업데이트
          // progress가 커질수록 뒤 페이지가 확대되어야 함
          dismissProgress.setValue(progress);

          // 스케일 효과: 1 → 0.92 (최대 8% 축소)
          const scaleValue = 1 - progress * 0.08;
          scaleAnim.setValue(scaleValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // 화면 절반 이상 드래그하거나 빠르게 스와이프하면 닫기
        const shouldClose = gestureState.dy > SCREEN_HEIGHT / 2 || gestureState.vy > 0.8;

        if (shouldClose) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(dismissProgress, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start(() => {
            router.back();
          });
        } else {
          // 원래 위치로 복귀
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              tension: 65,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 65,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.spring(dismissProgress, {
              toValue: 0,
              tension: 65,
              friction: 10,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const duration = status?.isLoaded ? status.durationMillis ?? 0 : 0;

  // 재생 페이지가 마운트될 때 뒤 페이지 축소
  useEffect(() => {
    dismissProgress.setValue(0);

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      // 언마운트 시 dismissProgress를 1로 유지 (뒤 페이지 정상 크기)
      dismissProgress.setValue(1);
    };
  }, [sound]);

  useEffect(() => {
    if (status?.isLoaded && duration > 0) {
      const progress = position / duration;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [position, duration, status?.isLoaded]);

  const formattedPosition = formatMillis(position);
  const formattedDuration = duration ? formatMillis(duration) : artwork?.duration ?? "--:--";
  const progress = duration > 0 ? position / duration : 0;

  // 반응형 스타일
  const styles = useMemo(() => createStyles(scale, moderateScale, ARTWORK_SIZE), [scale, moderateScale, ARTWORK_SIZE]);

  const handleTogglePlayback = async () => {
    if (!artwork) return;

    try {
      if (!sound) {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: artwork.audioUrl }, { shouldPlay: true });

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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorText}>← 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }, { scale: scaleAnim }],
            borderRadius: scale(12),
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: scale(-2) },
            shadowOpacity: 0.3,
            shadowRadius: scale(10),
            elevation: 10,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          {/* 드래그 핸들 바 */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* 아트워크 이미지 */}
          <View style={styles.artworkContainer}>
            <View style={styles.artworkWrapper}>
              <View style={styles.artworkPlaceholder}>
                <View style={styles.artworkGradient}>
                  <Text style={styles.artworkIcon}>🎨</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 작품 정보 */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {artwork.title}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {artwork.artist}
            </Text>
            <Text style={styles.trackAlbum} numberOfLines={1}>
              {exhibition.title}
            </Text>
          </View>

          {/* 진행 바 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formattedPosition}</Text>
              <Text style={styles.timeText}>{formattedDuration}</Text>
            </View>
          </View>

          {/* 재생 컨트롤 */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={() => {}} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.controlButtonText}>🔀</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={() => {}} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.controlButtonText}>⏮</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playPauseButton} onPress={handleTogglePlayback} disabled={isLoading} activeOpacity={0.8}>
              {isLoading ? <ActivityIndicator color="#000" size="large" /> : <Text style={styles.playPauseIcon}>{isPlaying ? "⏸" : "▶"}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={() => {}} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.controlButtonText}>⏭</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={() => {}} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.controlButtonText}>🔁</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function formatMillis(value: number) {
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const createStyles = (scale: (size: number) => number, moderateScale: (size: number, factor?: number) => number, artworkSize: number) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: scale(40),
      paddingTop: scale(8),
    },
    dragHandleContainer: {
      alignItems: "center" as const,
      paddingTop: scale(12),
      paddingBottom: scale(20),
    },
    dragHandle: {
      width: scale(36),
      height: scale(5),
      borderRadius: scale(3),
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    centerContent: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: scale(20),
    },
    errorText: {
      fontSize: moderateScale(16),
      color: colors.text.secondary,
      marginBottom: scale(16),
    },
    artworkContainer: {
      alignItems: "center" as const,
      paddingHorizontal: scale(20),
      marginBottom: scale(40),
    },
    artworkWrapper: {
      width: artworkSize,
      height: artworkSize,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: scale(20) },
      shadowOpacity: 0.5,
      shadowRadius: scale(30),
      elevation: 20,
    },
    artworkPlaceholder: {
      width: "100%",
      height: "100%",
      borderRadius: scale(12),
      overflow: "hidden" as const,
      backgroundColor: "#1a1a1a",
    },
    artworkGradient: {
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    artworkIcon: {
      fontSize: moderateScale(80),
      opacity: 0.3,
    },
    trackInfo: {
      paddingHorizontal: scale(20),
      alignItems: "center" as const,
      marginBottom: scale(40),
    },
    trackTitle: {
      fontSize: moderateScale(24),
      fontWeight: "600" as const,
      color: colors.text.primary,
      textAlign: "center" as const,
      marginBottom: scale(8),
      letterSpacing: -0.5,
    },
    trackArtist: {
      fontSize: moderateScale(19),
      fontWeight: "400" as const,
      color: colors.text.secondary,
      textAlign: "center" as const,
      marginBottom: scale(4),
    },
    trackAlbum: {
      fontSize: moderateScale(15),
      fontWeight: "400" as const,
      color: colors.text.muted,
      textAlign: "center" as const,
    },
    progressContainer: {
      paddingHorizontal: scale(20),
      marginBottom: scale(50),
    },
    progressBar: {
      width: "100%",
      height: scale(4),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: scale(2),
      marginBottom: scale(8),
      overflow: "hidden" as const,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.text.primary,
      borderRadius: scale(2),
    },
    timeContainer: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      paddingHorizontal: scale(2),
    },
    timeText: {
      fontSize: moderateScale(12),
      color: colors.text.muted,
      fontWeight: "400" as const,
    },
    controlsContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingHorizontal: scale(20),
      gap: scale(32),
    },
    controlButton: {
      width: scale(44),
      height: scale(44),
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    controlButtonText: {
      fontSize: moderateScale(24),
      color: colors.text.secondary,
    },
    playPauseButton: {
      width: scale(70),
      height: scale(70),
      borderRadius: scale(35),
      backgroundColor: colors.text.primary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.3,
      shadowRadius: scale(8),
      elevation: 8,
    },
    playPauseIcon: {
      fontSize: moderateScale(32),
      color: colors.background.primary,
      marginLeft: scale(3),
    },
  });
