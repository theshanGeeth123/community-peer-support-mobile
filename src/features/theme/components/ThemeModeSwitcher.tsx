import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/** Accessible app-wide appearance setting. No navigation or server state affected. */
export default function ThemeModeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, setMode, colors } = useTheme();
  if (compact) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        accessibilityHint="Changes the appearance across ALYVEN" onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
        <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} color={colors.teal} size={20} />
      </Pressable>
    );
  }
  return (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
      borderRadius: 22, padding: 17, marginBottom: 17 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 13 }}>
        <Ionicons name="color-palette-outline" size={21} color={colors.teal} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Appearance</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 3 }}>Choose the look that feels right for you.</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: 15, padding: 5, gap: 6 }}>
        {(['light', 'dark'] as const).map((option) => {
          const selected = mode === option;
          return (
            <Pressable key={option} accessibilityRole="button"
              accessibilityState={{ selected }} accessibilityLabel={`${option === 'light' ? 'Light' : 'Dark'} theme`}
              onPress={() => setMode(option)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center',
                justifyContent: 'center', minHeight: 44, borderRadius: 12,
                backgroundColor: selected ? colors.teal : 'transparent' }}>
              <Ionicons name={option === 'light' ? 'sunny-outline' : 'moon-outline'} size={18}
                color={selected ? (mode === 'dark' ? colors.onTeal : '#FFFFFF') : colors.muted} />
              <Text style={{ fontWeight: '800', fontSize: 13, marginLeft: 7,
                color: selected ? (mode === 'dark' ? colors.onTeal : '#FFFFFF') : colors.muted }}>
                {option === 'light' ? 'Light' : 'Dark'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
