/**
 * Expo Router 루트 레이아웃
 * 전역 네비게이션 설정 및 다크 테마 적용
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false, // 헤더 숨김 (커스텀 헤더 사용)
          contentStyle: {
            backgroundColor: '#000000', // 순수 블랙 배경
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="exhibition/[id]" />
      </Stack>
    </>
  );
}

