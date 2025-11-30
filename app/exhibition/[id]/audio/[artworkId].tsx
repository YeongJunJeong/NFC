/**
 * 전시 작품 오디오 재생 페이지
 * Apple Music 스타일의 오디오 재생 인터페이스
 */

import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions, ScrollView, PanResponder, ImageBackground, Image, ViewStyle, TextStyle, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
  const [volume, setVolume] = useState(1.0); // 볼륨 상태 (0.0 ~ 1.0)
  const progressAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 웹 환경용 HTML5 Audio
  const webAudioRef = useRef<HTMLAudioElement | null>(null);

  // displayMode 결정 (기본값: standard)
  const displayMode = artwork?.displayMode ?? "standard";
  const isFullscreen = displayMode === "fullscreen";

  // translateY를 기반으로 borderRadius를 동적으로 계산 (드래그 시작하면 바로 둥글게)
  const borderRadiusAnim = translateY.interpolate({
    inputRange: [0, 10],
    outputRange: [0, scale(48)],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 아래로 드래그할 때만 반응
        return gestureState.dy > 10;
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

  // 웹 환경에서는 HTML5 Audio 상태를 직접 관리
  const [webAudioState, setWebAudioState] = useState<{
    isPlaying: boolean;
    position: number;
    duration: number;
  }>({
    isPlaying: false,
    position: 0,
    duration: 0,
  });

  const isPlaying = Platform.OS === "web" ? webAudioState.isPlaying : status?.isLoaded ? status.isPlaying : false;
  const position = Platform.OS === "web" ? webAudioState.position : status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const duration = Platform.OS === "web" ? webAudioState.duration : status?.isLoaded ? status.durationMillis ?? 0 : 0;

  // 재생 페이지가 마운트될 때 뒤 페이지 축소 및 오디오 모드 설정
  useEffect(() => {
    dismissProgress.setValue(0);

    // 오디오 모드 설정 (웹에서는 일부 옵션이 작동하지 않을 수 있음)
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      }).catch((error) => {
        console.warn("Failed to set audio mode:", error);
      });
    }

    return () => {
      // 웹 환경 정리
      if (Platform.OS === "web" && webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = "";
        webAudioRef.current = null;
      }
      // 모바일 환경 정리
      if (Platform.OS !== "web" && sound) {
        sound.unloadAsync().catch((error) => {
          console.warn("Error unloading sound:", error);
        });
      }
      // 언마운트 시 dismissProgress를 1로 유지 (뒤 페이지 정상 크기)
      dismissProgress.setValue(1);
    };
  }, [sound]);

  // 웹 환경에서 HTML5 Audio 이벤트 리스너 설정
  useEffect(() => {
    if (Platform.OS === "web" && webAudioRef.current) {
      const audio = webAudioRef.current;

      const updateState = () => {
        setWebAudioState({
          isPlaying: !audio.paused,
          position: audio.currentTime * 1000, // 밀리초로 변환
          duration: audio.duration * 1000 || 0,
        });
      };

      const handleTimeUpdate = () => {
        updateState();
      };

      const handleLoadedMetadata = () => {
        updateState();
      };

      const handleEnded = () => {
        setWebAudioState((prev) => ({
          ...prev,
          isPlaying: false,
          position: 0,
        }));
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [webAudioRef.current]);

  // 모바일에서 오디오 상태를 주기적으로 폴링
  useEffect(() => {
    if (Platform.OS !== "web" && sound) {
      // 기존 인터벌 정리
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }

      // 주기적으로 상태 업데이트 (500ms)
      statusIntervalRef.current = setInterval(async () => {
        try {
          if (sound) {
            const currentStatus = await sound.getStatusAsync();
            if (currentStatus.isLoaded) {
              setStatus(currentStatus);
            }
          }
        } catch (error) {
          console.warn("Error getting audio status:", error);
          // 에러 발생 시 인터벌 정리
          if (statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
          }
        }
      }, 500);

      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
      };
    }
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
  const styles = useMemo(() => createStyles(scale, moderateScale, ARTWORK_SIZE, isFullscreen), [scale, moderateScale, ARTWORK_SIZE, isFullscreen]);

  const handleTogglePlayback = async () => {
    if (!artwork) return;

    try {
      // 웹 환경에서는 HTML5 Audio API 사용
      if (Platform.OS === "web") {
        if (!webAudioRef.current) {
          setIsLoading(true);

          // audioUrl을 실제 URL로 변환
          let audioUrl: string;
          if (typeof artwork.audioUrl === "string") {
            audioUrl = artwork.audioUrl;
          } else {
            // require()로 로드한 로컬 파일의 경우, 웹에서는 asset URL이 필요
            // Expo의 asset 시스템을 통해 URL 가져오기
            const asset = artwork.audioUrl as any;
            if (typeof asset === "string") {
              // 이미 문자열인 경우
              audioUrl = asset;
            } else if (asset?.uri) {
              audioUrl = asset.uri;
            } else if (asset?.default) {
              audioUrl = typeof asset.default === "string" ? asset.default : asset.default.uri || asset.default;
            } else if (asset?.__packager_asset) {
              // Metro bundler의 asset 정보 사용
              // 웹에서는 일반적으로 번들된 파일의 상대 경로를 사용
              const assetPath = asset.__packager_asset?.httpServerLocation || asset.__packager_asset?.uri;
              if (assetPath) {
                audioUrl = assetPath;
              } else {
                // 폴백: asset 객체 자체를 문자열로 변환 시도
                audioUrl = String(asset);
              }
            } else {
              // 최후의 수단: asset을 문자열로 변환
              audioUrl = String(asset);
            }
          }

          // 웹 환경에서 HTML5 Audio 사용
          const AudioConstructor = typeof window !== "undefined" ? window.Audio : (global as any).Audio;
          const audio = new AudioConstructor(audioUrl) as HTMLAudioElement;
          audio.volume = volume;
          audio.preload = "auto";

          audio.addEventListener("canplay", () => {
            setIsLoading(false);
            setWebAudioState({
              isPlaying: !audio.paused,
              position: audio.currentTime * 1000,
              duration: audio.duration * 1000 || 0,
            });
          });

          audio.addEventListener("error", (e: Event) => {
            console.error("Audio loading error:", e);
            setIsLoading(false);
          });

          webAudioRef.current = audio;
          await audio.play();
          return;
        }

        // 이미 로드된 경우 재생/일시정지 토글
        const audio = webAudioRef.current;
        if (audio.paused) {
          await audio.play();
        } else {
          audio.pause();
        }
        setWebAudioState({
          isPlaying: !audio.paused,
          position: audio.currentTime * 1000,
          duration: audio.duration * 1000 || 0,
        });
        return;
      }

      // 모바일 환경에서는 expo-av 사용
      if (!sound) {
        setIsLoading(true);

        // audioUrl이 require()로 로드한 로컬 파일인지 확인
        let audioSource;
        if (typeof artwork.audioUrl === "string") {
          // URL 문자열인 경우
          audioSource = { uri: artwork.audioUrl };
        } else {
          // require()로 로드한 로컬 파일인 경우
          audioSource = artwork.audioUrl;
        }

        const { sound: newSound } = await Audio.Sound.createAsync(audioSource, {
          shouldPlay: true,
          volume,
        });

        // 초기 상태 가져오기
        const initialStatus = await newSound.getStatusAsync();
        if (initialStatus.isLoaded) {
          setStatus(initialStatus);
        }

        // 네이티브에서는 정상적으로 상태 업데이트 콜백 설정
        try {
          newSound.setOnPlaybackStatusUpdate((nextStatus) => {
            if (nextStatus.isLoaded) {
              setStatus(nextStatus);
            }
          });
        } catch (error) {
          console.warn("Failed to set playback status update:", error);
        }

        setSound(newSound);
        setIsLoading(false);
        return;
      }

      const currentStatus = await sound.getStatusAsync();
      if (!currentStatus.isLoaded) {
        return;
      }

      // 상태 업데이트
      setStatus(currentStatus);

      if (currentStatus.isPlaying) {
        await sound.pauseAsync();
        // pauseAsync 후 상태 다시 가져오기
        const pausedStatus = await sound.getStatusAsync();
        if (pausedStatus.isLoaded) {
          setStatus(pausedStatus);
        }
      } else {
        await sound.playAsync();
        // playAsync 후 상태 다시 가져오기
        const playingStatus = await sound.getStatusAsync();
        if (playingStatus.isLoaded) {
          setStatus(playingStatus);
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsLoading(false);
      // 에러 발생 시 상태 초기화
      if (Platform.OS === "web") {
        if (webAudioRef.current) {
          webAudioRef.current.pause();
          webAudioRef.current.src = "";
          webAudioRef.current = null;
        }
        setWebAudioState({
          isPlaying: false,
          position: 0,
          duration: 0,
        });
      } else {
        if (sound) {
          try {
            await sound.unloadAsync();
          } catch (unloadError) {
            console.warn("Error unloading sound:", unloadError);
          }
          setSound(null);
          setStatus(null);
        }
      }
    }
  };

  // 볼륨 조절 핸들러
  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (Platform.OS === "web") {
      if (webAudioRef.current) {
        webAudioRef.current.volume = newVolume;
      }
    } else {
      if (sound) {
        try {
          await sound.setVolumeAsync(newVolume);
        } catch (error) {
          console.warn("Volume change error", error);
        }
      }
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

  // 배경 컴포넌트 렌더링 (Fullscreen 모드용)
  const renderBackground = () => {
    if (!isFullscreen) return null;

    const bgColor = artwork.backgroundColor ?? "#1a1a1a";

    // 이미지가 있으면 ImageBackground, 없으면 색상 배경
    if (artwork.imageUrl) {
      return (
        <ImageBackground source={artwork.imageUrl} style={styles.fullscreenBackground} resizeMode="cover">
          <View style={styles.fullscreenOverlay} />
        </ImageBackground>
      );
    }

    // 이미지가 없을 때는 그라데이션 효과를 위해 여러 레이어 사용
    return (
      <View style={styles.fullscreenBackground}>
        <View style={[styles.gradientLayer1, { backgroundColor: bgColor }]} />
        <View style={styles.gradientLayer2} />
        <View style={styles.fullscreenOverlay} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }, { scale: scaleAnim }],
            borderTopLeftRadius: borderRadiusAnim, // 드래그 시 위쪽 모서리만 둥글게
            borderTopRightRadius: borderRadiusAnim,
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
        {/* Fullscreen 모드일 때 배경 */}
        {renderBackground()}

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
            {/* 드래그 핸들 바 */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* 아트워크 이미지 (Standard 모드에만 표시) */}
            {!isFullscreen && (
              <View style={styles.artworkContainer}>
                <View style={styles.artworkWrapper}>
                  <View style={styles.artworkPlaceholder}>
                    {artwork.imageUrl ? (
                      <Image source={artwork.imageUrl} style={styles.artworkImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.artworkGradient}>
                        <Text style={styles.artworkIcon}>🎨</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Fullscreen 모드일 때 상단 여백 */}
            {isFullscreen && <View style={styles.fullscreenTopSpacer} />}
          </ScrollView>

          {/* 하단 영역: 그라데이션 배경과 컨트롤 */}
          <View style={styles.bottomContainer} pointerEvents="box-none">
            {/* 자연스러운 그라데이션 배경 (Fullscreen 모드에만) */}
            {isFullscreen && <LinearGradient colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.95)"]} locations={[0, 0.4, 1]} style={styles.gradientBackground} pointerEvents="none" />}

            {/* 작품 정보 */}
            <View style={styles.trackInfo}>
              <AutoScrollText text={artwork.title} style={styles.trackTitle} containerStyle={styles.trackTitleContainer} />
              <Text style={styles.trackArtist} numberOfLines={1} ellipsizeMode="tail">
                {artwork.artist}
              </Text>
              <Text style={styles.trackAlbum} numberOfLines={1} ellipsizeMode="tail">
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
                <Text style={styles.controlButtonText}>⏮</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playPauseButton} onPress={handleTogglePlayback} disabled={isLoading} activeOpacity={0.8}>
                {isLoading ? <ActivityIndicator color="#000" size="large" /> : <Text style={styles.playPauseIcon}>{isPlaying ? "⏸" : "▶"}</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => {}} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.controlButtonText}>⏭</Text>
              </TouchableOpacity>
            </View>

            {/* 볼륨 컨트롤 */}
            <VolumeSlider volume={volume} onVolumeChange={handleVolumeChange} scale={scale} moderateScale={moderateScale} />
          </View>
        </View>
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

// 자동 스크롤 텍스트 컴포넌트 (마키 효과)
interface AutoScrollTextProps {
  text: string;
  style: TextStyle;
  containerStyle?: ViewStyle;
  delay?: number;
  speed?: number;
}

function AutoScrollText({ text, style, containerStyle, delay = 2000, speed = 50 }: AutoScrollTextProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);
  const textWidth = useRef(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopAllAnimations = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startAnimation = () => {
    if (containerWidth.current === 0 || textWidth.current === 0) return;

    // 텍스트가 컨테이너보다 짧으면 중앙 정렬 (스크롤 불필요)
    if (textWidth.current <= containerWidth.current) {
      translateX.setValue(0);
      return;
    }

    stopAllAnimations();

    // 스크롤 거리 계산
    const scrollDistance = textWidth.current - containerWidth.current + 20; // 여유 공간 추가

    // 초기 위치: 0 (중앙 정렬 상태)
    translateX.setValue(0);

    timeoutRef.current = setTimeout(() => {
      animationRef.current = Animated.loop(
        Animated.sequence([
          // 왼쪽으로 스크롤 (전체 텍스트 보이기)
          Animated.timing(translateX, {
            toValue: -scrollDistance,
            duration: (scrollDistance / speed) * 1000,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
          // 중앙으로 복귀
          Animated.timing(translateX, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ])
      );
      animationRef.current.start();
    }, delay);
  };

  const handleContainerLayout = (event: { nativeEvent: { layout: { width: number } } }) => {
    const width = event.nativeEvent.layout.width;
    // 패딩 고려 (좌우 각 10px)
    const padding = 20;
    const actualWidth = width - padding;
    if (actualWidth > 0 && containerWidth.current !== actualWidth) {
      containerWidth.current = actualWidth;
      setTimeout(() => startAnimation(), 200);
    }
  };

  const handleTextLayout = (event: { nativeEvent: { layout: { width: number } } }) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && textWidth.current !== width) {
      textWidth.current = width;
      setTimeout(() => startAnimation(), 200);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAnimations();
    };
  }, []);

  useEffect(() => {
    stopAllAnimations();
    translateX.setValue(0);
    containerWidth.current = 0;
    textWidth.current = 0;

    const timer = setTimeout(() => {
      // 레이아웃 재측정 후 애니메이션 시작
      startAnimation();
    }, 300);

    return () => clearTimeout(timer);
  }, [text]);

  // 스타일에서 textAlign 제거 (컨테이너에서 중앙 정렬 처리)
  const textStyle = { ...style };
  delete (textStyle as any).textAlign;

  return (
    <View
      style={[
        {
          overflow: "hidden",
          paddingHorizontal: 10, // 컨테이너에 패딩 추가로 텍스트가 잘리지 않도록
        },
        containerStyle,
      ]}
      onLayout={handleContainerLayout}
    >
      <Animated.View
        style={{
          flexDirection: "row" as const,
          alignItems: "center" as const,
          justifyContent: "center" as const,
          transform: [{ translateX }],
        }}
      >
        <Text style={textStyle} onLayout={handleTextLayout} numberOfLines={1}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}

// 볼륨 슬라이더 컴포넌트
interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  scale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
}

function VolumeSlider({ volume, onVolumeChange, scale, moderateScale }: VolumeSliderProps) {
  const sliderWidth = useRef(0);
  const panX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // 터치 시작 위치에서 볼륨 계산
        const touchX = evt.nativeEvent.locationX;
        const newVolume = Math.max(0, Math.min(1, touchX / sliderWidth.current));
        onVolumeChange(newVolume);
      },
      onPanResponderMove: (evt) => {
        // 드래그 중 볼륨 계산
        const touchX = evt.nativeEvent.locationX;
        const newVolume = Math.max(0, Math.min(1, touchX / sliderWidth.current));
        onVolumeChange(newVolume);
      },
    })
  ).current;

  const handleLayout = (event: { nativeEvent: { layout: { width: number } } }) => {
    sliderWidth.current = event.nativeEvent.layout.width;
  };

  // 볼륨 아이콘 결정
  const getVolumeIcon = () => {
    if (volume === 0) return "🔇";
    if (volume < 0.33) return "🔈";
    if (volume < 0.66) return "🔉";
    return "🔊";
  };

  return (
    <View style={volumeStyles(scale, moderateScale).container}>
      <Text style={volumeStyles(scale, moderateScale).icon}>{getVolumeIcon()}</Text>
      <View style={volumeStyles(scale, moderateScale).sliderContainer} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View style={volumeStyles(scale, moderateScale).track}>
          <View style={[volumeStyles(scale, moderateScale).fill, { width: `${volume * 100}%` }]} />
        </View>
      </View>
      <Text style={volumeStyles(scale, moderateScale).iconRight}>🔊</Text>
    </View>
  );
}

const volumeStyles = (scale: (size: number) => number, moderateScale: (size: number, factor?: number) => number) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(20),
      marginTop: scale(28),
      gap: scale(12),
    },
    icon: {
      fontSize: moderateScale(16),
      opacity: 0.6,
    },
    iconRight: {
      fontSize: moderateScale(16),
      opacity: 0.6,
    },
    sliderContainer: {
      flex: 1,
      height: scale(32),
      justifyContent: "center",
    },
    track: {
      width: "100%",
      height: scale(6),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: scale(3),
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: scale(3),
    },
  });

const createStyles = (scale: (size: number) => number, moderateScale: (size: number, factor?: number) => number, artworkSize: number, isFullscreen: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
    container: {
      flex: 1,
      backgroundColor: isFullscreen ? "transparent" : colors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: scale(8),
    },
    dragHandleContainer: {
      alignItems: "center" as const,
      paddingTop: scale(8),
      paddingBottom: scale(12),
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
      marginTop: scale(20),
      marginBottom: scale(32),
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
    artworkImage: {
      width: "100%",
      height: "100%",
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
      marginBottom: scale(32),
    },
    trackTitleContainer: {
      width: "100%",
      marginBottom: scale(8),
      alignItems: "center" as const,
    },
    trackTitle: {
      fontSize: moderateScale(24),
      fontWeight: "600" as const,
      color: colors.text.primary,
      textAlign: "center" as const,
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
      marginBottom: scale(16),
    },
    progressBar: {
      width: "100%",
      height: scale(6),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: scale(3),
      marginBottom: scale(8),
      overflow: "hidden" as const,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.text.primary,
      borderRadius: scale(3),
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
      marginTop: scale(16),
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
    // Fullscreen 모드 전용 스타일
    fullscreenBackground: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
    },
    fullscreenOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.4)", // 반투명 오버레이
    },
    gradientLayer1: {
      ...StyleSheet.absoluteFillObject,
    },
    gradientLayer2: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      opacity: 0.8,
    },
    fullscreenTopSpacer: {
      height: scale(80), // Standard 모드의 아트워크를 대체하는 여백
    },
    bottomContainer: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: scale(50),
    },
    gradientBackground: {
      position: "absolute" as const,
      top: -scale(150), // 위로 확장하여 자연스러운 블렌딩
      left: 0,
      right: 0,
      bottom: 0,
    },
  });
