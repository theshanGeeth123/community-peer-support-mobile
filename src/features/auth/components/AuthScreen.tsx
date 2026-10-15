import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandMark from '@/features/branding/components/BrandMark';
import { Brand } from '@/theme/brand';

interface AuthScreenProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export default function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View pointerEvents="none" style={styles.topShape} />
          <View style={styles.brandRow}>
            <BrandMark />
            <View style={styles.safetyBadge}>
              <Text style={styles.safetyText}>SAFE SPACES</Text>
            </View>
          </View>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>CONNECT  ·  SHARE  ·  BELONG</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.formCard}>{children}</View>
          <View style={styles.footer}>
            <View style={styles.footerRule} />
            <Text style={styles.footerText}>Real people. Safer spaces. Brighter tomorrows.</Text>
            <Text style={styles.footerBrand}>ALYVEN  ·  A PLACE TO BE HEARD</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Brand.background },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 36 },
  topShape: { position: 'absolute', right: -140, top: -210, width: 360, height: 360, borderRadius: 180, backgroundColor: Brand.mint, opacity: 0.7 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  safetyBadge: { backgroundColor: Brand.white, borderColor: Brand.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8 },
  safetyText: { color: Brand.teal, fontWeight: '800', fontSize: 9, letterSpacing: 0.7 },
  hero: { marginTop: 35, marginBottom: 24 },
  eyebrow: { color: Brand.teal, fontWeight: '800', fontSize: 10, letterSpacing: 1.6 },
  title: { color: Brand.navy, fontSize: 35, fontWeight: '900', letterSpacing: -1.1, marginTop: 11 },
  subtitle: { color: Brand.secondaryText, fontSize: 14, lineHeight: 21, maxWidth: 340, marginTop: 9 },
  formCard: { backgroundColor: Brand.white, borderColor: Brand.border, borderWidth: 1, borderRadius: 27, padding: 22, shadowColor: Brand.navy, shadowOpacity: 0.045, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  footer: { alignItems: 'center', marginTop: 30 },
  footerRule: { backgroundColor: Brand.aqua, width: 38, height: 3, borderRadius: 2, marginBottom: 15 },
  footerText: { color: Brand.secondaryText, fontSize: 11.5, textAlign: 'center' },
  footerBrand: { color: Brand.teal, letterSpacing: 1.2, fontSize: 9, fontWeight: '800', marginTop: 9 },
});
