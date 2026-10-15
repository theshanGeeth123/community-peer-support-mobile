import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Brand } from '@/theme/brand';

interface AuthButtonProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export default function AuthButton({ title, loading = false, disabled = false, onPress }: AuthButtonProps) {
  const isDisabled = loading || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={Brand.white} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Brand.teal },
  disabled: { opacity: 0.56 },
  pressed: { backgroundColor: Brand.tealDark },
  text: { color: Brand.white, fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },
});
