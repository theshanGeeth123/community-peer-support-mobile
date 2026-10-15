import { useThemedStyles } from '@/theme/useAlyvenAppearance';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/theme/brand';

type BrandMarkProps = {
  compact?: boolean;
  light?: boolean;
};

/** Shows the brand asset, without changing app navigation or authentication. */
export default function BrandMark({ compact = false, light = false }: BrandMarkProps) {
  const themeStyles = useThemedStyles(styles);

  return (
    <View style={themeStyles.row}>
      <Image
        source={require('../../../../assets/images/logo.png')}
        resizeMode="contain"
        style={compact ? themeStyles.smallIcon : themeStyles.icon}
        accessibilityLabel="ALYVEN logo"
      />
      <View style={themeStyles.copy}>
        <Text style={[themeStyles.wordmark, compact && themeStyles.smallWordmark, light && themeStyles.light]}>
          ALYVEN
        </Text>
        {!compact && (
          <Text style={[themeStyles.tagline, light && themeStyles.taglineLight]}>A Place to Be Heard.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 62, height: 62 },
  smallIcon: { width: 40, height: 40 },
  copy: { marginLeft: 9 },
  wordmark: { color: Brand.navy, fontSize: 25, fontWeight: '900', letterSpacing: 4.4 },
  smallWordmark: { fontSize: 17, letterSpacing: 2.9 },
  light: { color: Brand.white },
  tagline: { color: Brand.teal, fontSize: 11, letterSpacing: 1, marginTop: -1, fontWeight: '600' },
  taglineLight: { color: Brand.mint },
});
