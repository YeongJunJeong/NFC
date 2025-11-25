/**
 * ODI - 메인 화면
 * 진행중인 전시 목록을 표시하는 미니멀한 홈 화면
 */

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ExhibitionCard } from "../components/ExhibitionCard";
import { colors } from "../theme/colors";
import { exhibitions } from "../data/exhibitions";

/**
 * 메인 페이지 컴포넌트
 */
export default function HomeScreen() {
  const router = useRouter();

  // fade-in 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // 전시 카드별 애니메이션
  const cardAnims = useRef(
    Array.from({ length: exhibitions.length }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    // 헤더 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 전시 카드 스태거 애니메이션
    const cardAnimations = cardAnims.map((anim, index) => {
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(100, cardAnimations).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.logo}>ODI</Text>
        </Animated.View>

        {/* 전시 목록 */}
        <View style={styles.exhibitionList}>
          {exhibitions.map((exhibition, index) => (
            <Animated.View
              key={exhibition.id}
              style={[
                {
                  opacity: cardAnims[index].opacity,
                  transform: [{ translateY: cardAnims[index].translateY }],
                },
              ]}
            >
              <ExhibitionCard
                exhibition={exhibition}
                onPress={() => {
                  router.push(`/exhibition/${exhibition.id}`);
                }}
              />
            </Animated.View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  logo: {
    fontSize: 28,
    fontWeight: "200",
    color: colors.text.primary,
    letterSpacing: 4,
  },
  exhibitionList: {
    gap: 16,
  },
});
