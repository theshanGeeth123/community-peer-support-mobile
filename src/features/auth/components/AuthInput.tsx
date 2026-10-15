import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={themeStyles.wrapper}>
      <Text style={themeStyles.label}>{label}</Text>
      <View style={[themeStyles.field, focused && themeStyles.focused, !!error && themeStyles.errored]}>
        <TextInput
          {...props}
          style={themeStyles.input}
          placeholderTextColor={themeTone("#93A5AD", "placeholderTextColor")}
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
            <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={themeTone(Brand.teal, "color")} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={themeStyles.error}>{error}</Text>}
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
