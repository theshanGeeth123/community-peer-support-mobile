import type { PropsWithChildren } from "react";

import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";

interface AuthScreenProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export default function AuthScreen({
  title,
  subtitle,
  children,
}: AuthScreenProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-6 py-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center">
          <View className="mb-8">
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
              <Text className="text-2xl font-bold text-white">
                C
              </Text>
            </View>

            <Text className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </Text>

            <Text className="mt-2 text-base leading-6 text-slate-500">
              {subtitle}
            </Text>
          </View>

          <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {children}
          </View>

          <Text className="mt-8 text-center text-xs leading-5 text-slate-400">
            Community Peer Support Network
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}