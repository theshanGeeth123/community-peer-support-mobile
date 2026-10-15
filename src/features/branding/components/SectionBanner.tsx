import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/theme/brand';

type IconName = keyof typeof Ionicons.glyphMap;

type SectionBannerProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: IconName;
};

/** Compact section introduction for feed, discovery, and community screens. */
export default function SectionBanner({ eyebrow, title, description, icon = 'leaf-outline' }: SectionBannerProps) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  return (
    <View style={themeStyles.panel}>
      <View pointerEvents="none" style={themeStyles.accentCircle} />
      <View style={themeStyles.row}>
        <View style={themeStyles.iconContainer}>
          <Ionicons name={icon} size={23} color={themeTone(Brand.teal, "color")} />
        </View>
        <Text style={themeStyles.eyebrow}>{eyebrow}</Text>
      </View>
      <Text style={themeStyles.title}>{title}</Text>
      <Text style={themeStyles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 19, paddingBottom: 21, borderRadius: 22, backgroundColor: Brand.mint, marginBottom: 18, overflow: 'hidden' },
  accentCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 35, borderColor: '#B8E7DC', top: -100, right: -74, opacity: 0.65 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { height: 36, width: 36, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  eyebrow: { color: Brand.teal, fontSize: 10, fontWeight: '900', letterSpacing: 1.15 },
  title: { color: Brand.navy, fontSize: 22, fontWeight: '800', letterSpacing: -0.45 },
  description: { color: '#416E78', fontSize: 12.5, lineHeight: 19, marginTop: 7, maxWidth: 300 },
});
