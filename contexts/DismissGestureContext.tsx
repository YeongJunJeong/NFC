/**
 * 드래그 제스처 상태를 공유하기 위한 Context
 * 오디오 재생 페이지의 드래그 상태를 이전 페이지에 전달
 */

import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';

interface DismissGestureContextType {
  dismissProgress: Animated.Value;
}

const DismissGestureContext = createContext<DismissGestureContextType | null>(null);

export function DismissGestureProvider({ children }: { children: React.ReactNode }) {
  // 초기값을 1로 설정 (평상시 = 정상 크기)
  const dismissProgress = useRef(new Animated.Value(1)).current;

  return (
    <DismissGestureContext.Provider value={{ dismissProgress }}>
      {children}
    </DismissGestureContext.Provider>
  );
}

export function useDismissGesture() {
  const context = useContext(DismissGestureContext);
  if (!context) {
    throw new Error('useDismissGesture must be used within DismissGestureProvider');
  }
  return context;
}

export function useDismissGestureOptional() {
  return useContext(DismissGestureContext);
}

