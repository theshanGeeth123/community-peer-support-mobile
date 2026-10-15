import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRoleHomeRoute } from '@/features/navigation/roleNavigation';
import { hasCompletedOnboarding } from '@/features/onboarding/onboarding.storage';
import { useTheme } from '@/theme/ThemeProvider';

export default function IndexScreen() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    void hasCompletedOnboarding().then((completed) => {
      if (mounted) setOnboardingComplete(completed);
    });
    return () => { mounted = false; };
  }, []);

  if (isInitializing || onboardingComplete === null) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href={getRoleHomeRoute(user.role)} />;
  }

  if (!onboardingComplete) {
    return <Redirect href={'/onboarding' as Href} />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
