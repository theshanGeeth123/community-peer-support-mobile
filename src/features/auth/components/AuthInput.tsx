import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/theme/brand';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export default function AuthInput({ label, error, isPassword = false, ...props }: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.focused, !!error && styles.errored]}>
        <TextInput
          {...props}
          style={styles.input}
          placeholderTextColor="#93A5AD"
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            onPress={() => setIsPasswordVisible(value => !value)}
            hitSlop={10}
          >
            <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={Brand.teal} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 17 },
  label: { fontSize: 12.5, fontWeight: '800', color: Brand.navy, marginBottom: 8 },
  field: { borderWidth: 1.2, borderColor: Brand.border, backgroundColor: Brand.background, borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  focused: { borderColor: Brand.teal, backgroundColor: Brand.white },
  errored: { borderColor: Brand.danger },
  input: { flex: 1, minHeight: 53, color: Brand.navy, fontSize: 14.5, paddingVertical: 10 },
  error: { color: Brand.danger, fontSize: 12, marginTop: 6 },
});
