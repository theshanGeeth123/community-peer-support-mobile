import { Image, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/theme/brand';

type BrandMarkProps = {
  compact?: boolean;
  light?: boolean;
};

/** Shows the brand asset, without changing app navigation or authentication. */
export default function BrandMark({ compact = false, light = false }: BrandMarkProps) {
  return (
    <View style={styles.row}>
      <Image
        source={require('../../../../assets/images/logo.png')}
        resizeMode="contain"
        style={compact ? styles.smallIcon : styles.icon}
        accessibilityLabel="ALYVEN logo"
      />
      <View style={styles.copy}>
        <Text style={[styles.wordmark, compact && styles.smallWordmark, light && styles.light]}>
          ALYVEN
        </Text>
        {!compact && (
          <Text style={[styles.tagline, light && styles.taglineLight]}>A Place to Be Heard.</Text>
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
