import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Species } from '@/db/types';

interface PetAvatarProps {
  uri?: string | null;
  species?: Species;
  size?: number;
  name?: string;
  borderColor?: string;
}

export function PetAvatar({ uri, species = 'Dog', size = 52, name, borderColor }: PetAvatarProps) {
  const getFallbackIcon = () => {
    switch (species) {
      case 'Cat':
        return '🐱';
      case 'Bird':
        return '🦜';
      case 'Rabbit':
        return '🐰';
      case 'Hamster':
        return '🐹';
      case 'Fish':
        return '🐠';
      default:
        return '🐶';
    }
  };

  const radius = size / 2;

  if (uri && (uri.startsWith('http') || uri.startsWith('file://') || uri.startsWith('data:'))) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: borderColor || 'rgba(0,0,0,0.08)',
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor: borderColor || 'rgba(0,0,0,0.08)',
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.52 }}>{getFallbackIcon()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: '#F0F2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    backgroundColor: '#FFEFEA',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
