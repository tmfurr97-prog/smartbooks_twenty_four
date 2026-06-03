import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function Verification() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      // Get origin URL from env (no hardcoded fallback — each environment provides its own)
      const originUrl = process.env.EXPO_PUBLIC_BACKEND_URL?.replace('/api', '') || '';

      const response = await api.post('/api/payments/verification/create-checkout', {
        origin_url: originUrl,
      });

      // Open Stripe checkout in browser
      const { url } = response.data;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open payment page');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to start verification'
      );
    } finally {
      setLoading(false);
    }
  };

  if (user?.is_verified) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.title}>Already Verified!</Text>
          <Text style={styles.subtitle}>
            Your account is verified and ready to use all features.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons name="home" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        <Text style={styles.title}>Get Furrst-Checked</Text>
        <Text style={styles.subtitle}>
          The one-time verification that pays for itself in your first booking.
        </Text>

        <View style={styles.savingsCard}>
          <View style={styles.savingsHeader}>
            <Ionicons name="trending-down" size={18} color={COLORS.surface} />
            <Text style={styles.savingsHeaderText}>Lock in 8% service fee — forever</Text>
          </View>
          <View style={styles.savingsRow}>
            <Text style={styles.savingsRowLabel}>Without Furrst-Check</Text>
            <Text style={styles.savingsRowValue}>14% service fee</Text>
          </View>
          <View style={styles.savingsRow}>
            <Text style={styles.savingsRowLabel}>With Furrst-Check</Text>
            <Text style={[styles.savingsRowValue, styles.savingsRowGood]}>8% service fee</Text>
          </View>
          <View style={styles.savingsExample}>
            <Text style={styles.savingsExampleText}>
              On a $1,000 trip: you save <Text style={styles.savingsHighlight}>$60</Text>{' '}
              every time — and keep saving on every future booking.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>You also get:</Text>

          <View style={styles.feature}>
            <Ionicons name="finger-print" size={22} color={COLORS.primary} />
            <Text style={styles.featureText}>
              ID-verified status — only verified members can book.
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="ribbon" size={22} color={COLORS.primary} />
            <Text style={styles.featureText}>
              Verified badge on your profile — hosts trust you faster.
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="chatbubbles" size={22} color={COLORS.primary} />
            <Text style={styles.featureText}>
              Direct messaging with hosts (unverified guests can't contact owners).
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="heart" size={22} color={COLORS.primary} />
            <Text style={styles.featureText}>
              Save favorites and rebook in one tap.
            </Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>One-time fee · pays for itself in 1 trip</Text>
          <Text style={styles.price}>$14.99</Text>
          <Text style={styles.priceNote}>Secure payment via Stripe</Text>
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.surface} />
              <Text style={styles.verifyButtonText}>Get Furrst-Checked</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          You'll be redirected to Stripe's secure payment page.{'\n'}
          We never store your card information.
        </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    marginLeft: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  successIcon: {
    alignItems: 'center',
    marginVertical: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  savingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 0,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  savingsHeaderText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  savingsRowLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  savingsRowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  savingsRowGood: {
    color: COLORS.success || '#1B5E20',
  },
  savingsExample: {
    padding: SPACING.md,
    backgroundColor: '#F0F7F0',
  },
  savingsExampleText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  savingsHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  featureText: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  priceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.surface,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  priceNote: {
    fontSize: 14,
    color: COLORS.surface,
    opacity: 0.8,
  },
  verifyButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    minHeight: 48,
    ...SHADOWS.medium,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 18,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
  },
  disclaimer: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
});
