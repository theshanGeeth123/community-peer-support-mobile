import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

type IconName = keyof typeof Ionicons.glyphMap;

type SectionBannerProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: IconName;
};

/** Shared introduction panel for sections; designed to work in both app themes. */
export default function SectionBanner({ eyebrow, title, description, icon = 'leaf-outline' }: SectionBannerProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: isDark ? '#113A43' : '#DDF4EC', borderColor: isDark ? '#2D5C62' : '#C5E9DE' }]}>
      <View pointerEvents="none" style={[styles.orbitOne, { borderColor: isDark ? '#1D5962' : '#B9E9DD' }]} />
      <View pointerEvents="none" style={[styles.orbitTwo, { backgroundColor: isDark ? '#1E5760' : '#C5F0E8' }]} />
      <View style={styles.topRow}>
        <View style={[styles.icon, { backgroundColor: isDark ? '#1C4B54' : '#FFFFFF' }]}>
          <Ionicons name={icon} size={23} color={colors.teal} />
        </View>
        <View style={[styles.eyebrowPill, { backgroundColor: isDark ? '#23515B' : '#ECFCF8' }]}>
          <View style={[styles.dot, { backgroundColor: colors.teal }]} />
          <Text style={[styles.eyebrow, { color: colors.teal }]}>{eyebrow}</Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
      <View style={[styles.rule, { backgroundColor: isDark ? '#78DDD6' : '#0E7C86' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 22, paddingBottom: 24, borderWidth: 1, borderRadius: 26, marginBottom: 19, overflow: 'hidden' },
  orbitOne: { width: 180, height: 180, borderWidth: 32, borderRadius: 100, position: 'absolute', top: -128, right: -76, opacity: 0.78 },
  orbitTwo: { height: 95, width: 95, borderRadius: 48, position: 'absolute', right: -45, bottom: -50, opacity: 0.8 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 11 },
  icon: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  eyebrowPill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  eyebrow: { fontSize: 9.5, letterSpacing: 1.05, fontWeight: '900' },
  title: { fontWeight: '900', fontSize: 23, letterSpacing: -0.65, lineHeight: 30 },
  description: { maxWidth: 315, marginTop: 8, fontSize: 12.8, lineHeight: 20 },
  rule: { height: 3, width: 38, marginTop: 17, borderRadius: 4 },
});
