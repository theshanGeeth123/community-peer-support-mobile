import { useState } from "react";

import {
    Pressable,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  error,
  isPassword = false,
  ...props
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700">
        {label}
      </Text>

      <View
        className={`flex-row items-center rounded-2xl border bg-slate-50 px-4 ${
          error
            ? "border-red-400"
            : "border-slate-200"
        }`}
      >
        <TextInput
          {...props}
          className="min-h-14 flex-1 text-base text-slate-900"
          placeholderTextColor="#94a3b8"
          secureTextEntry={
            isPassword && !isPasswordVisible
          }
        />

        {isPassword && (
          <Pressable
            onPress={() =>
              setIsPasswordVisible((current) => !current)
            }
            hitSlop={10}
          >
            <Text className="font-semibold text-indigo-600">
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>

      {error && (
        <Text className="mt-1.5 text-sm text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
}