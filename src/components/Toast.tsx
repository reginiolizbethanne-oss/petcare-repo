import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
}

type ToastListener = (data: ToastData | null) => void;

let nextToastId = 1;
const listeners = new Set<ToastListener>();

export function showToast(
  message: string,
  type: ToastType = 'success',
  title?: string
) {
  const data: ToastData = {
    id: nextToastId++,
    message,
    type,
    title,
  };
  listeners.forEach((l) => l(data));
}

export function hideToast() {
  listeners.forEach((l) => l(null));
}

export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastData | null>(null);

  const [translateY] = useState(() => new Animated.Value(-100));
  const [opacity] = useState(() => new Animated.Value(0));
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrent(null);
    });
  }, [opacity, translateY]);

  useEffect(() => {
    const listener: ToastListener = (data) => {
      if (!data) {
        dismiss();
        return;
      }
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
      setCurrent(data);

      translateY.setValue(-80);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          speed: 18,
          bounciness: 4,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      dismissTimer.current = setTimeout(() => {
        dismiss();
      }, 3000);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [dismiss, opacity, translateY]);

  if (!current) return null;

  const getColors = () => {
    switch (current.type) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#10B981',
          iconColor: '#059669',
          icon: 'checkmark-circle' as const,
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#EF4444',
          iconColor: '#DC2626',
          icon: 'alert-circle' as const,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#F59E0B',
          iconColor: '#D97706',
          icon: 'warning' as const,
          defaultTitle: 'Notice',
        };
      default:
        return {
          bg: '#F0F9FF',
          border: '#0284C7',
          iconColor: '#0284C7',
          icon: 'information-circle' as const,
          defaultTitle: 'Info',
        };
    }
  };

  const colors = getColors();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + 8 }]}
    >
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <Pressable
          onPress={dismiss}
          style={styles.inner}
          accessibilityRole="alert"
          accessibilityLabel={`${colors.defaultTitle}: ${current.message}`}
        >
          <Ionicons name={colors.icon} size={24} color={colors.iconColor} />
          <View style={styles.textWrap}>
            <Text style={[styles.title, { color: colors.iconColor }]}>
              {current.title || colors.defaultTitle}
            </Text>
            <Text style={[styles.message, { color: theme.text }]}>
              {current.message}
            </Text>
          </View>
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
    lineHeight: 18,
  },
});
