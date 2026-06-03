import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

/**
 * Friendly "Sign in to continue" empty state used by protected tabs
 * (Bookings, Favorites, Messages, Profile) when the user isn't logged in.
 */
export default function SignInPrompt({ icon = 'lock-closed', title, subtitle }: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push('/(auth)/register')}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryBtnText}>
          New here? <Text style={styles.secondaryBtnTextStrong}>Create an account</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
    maxWidth: 320,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 10,
    minWidth: 220,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  primaryBtnText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  secondaryBtnTextStrong: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
