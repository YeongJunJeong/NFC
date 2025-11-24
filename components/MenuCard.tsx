/**
 * 메뉴 카드 컴포넌트
 * Opal 스타일: 미니멀하고 세련된 카드 UI
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { shadows } from '../theme/shadows';

interface MenuCardProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * 메뉴 카드 컴포넌트
 * @param title - 카드에 표시할 타이틀 텍스트
 * @param onPress - 카드 클릭 시 실행할 함수
 * @param style - 추가 스타일 (선택사항)
 */
export const MenuCard: React.FC<MenuCardProps> = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}  // 더 부드러운 터치 피드백
      // 웹에서 호버 효과를 위한 접근성 속성
      {...(Platform.OS === 'web' && {
        // @ts-ignore - 웹 전용 속성
        onMouseEnter: (e: any) => {
          e.currentTarget.style.backgroundColor = colors.background.cardHover;
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
        },
        onMouseLeave: (e: any) => {
          e.currentTarget.style.backgroundColor = colors.background.card;
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        },
      })}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 12,              // 더 부드러운 모서리
    padding: 40,                   // 더 넓은 패딩
    minHeight: 140,                // 더 높은 카드
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',  // 미묘한 보더
    // 그림자 효과
    ...shadows.card,
    // 웹에서 부드러운 전환 효과
    ...(Platform.OS === 'web' && {
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',  // 더 부드러운 easing
      cursor: 'pointer',
    } as any),
  } as ViewStyle,
  title: {
    ...typography.cardTitle,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '300',            // 더 얇은 폰트
  } as TextStyle,
});

