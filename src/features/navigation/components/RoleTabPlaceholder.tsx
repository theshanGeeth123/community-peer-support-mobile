import { useThemeTone, useThemedClassName } from '@/theme/useAlyvenAppearance';
import type {
    ComponentProps,
} from "react";

import {
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    Ionicons,
} from "@expo/vector-icons";

interface RoleTabPlaceholderProps {
  title: string;
  description: string;

  icon: ComponentProps<
    typeof Ionicons
  >["name"];
}

export default function RoleTabPlaceholder({
  title,
  description,
  icon,
}: RoleTabPlaceholderProps) {
  const themeClass = useThemedClassName();
  const themeTone = useThemeTone();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          themeTone("#F5FAF9", "backgroundColor"),
      }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        className={themeClass("flex-1")}
        contentContainerClassName={themeClass("px-5 pb-8 pt-5")}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className={themeClass("rounded-3xl border border-slate-200 bg-white p-6")}>
          <View className={themeClass("h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50")}>
            <Ionicons
              name={icon}
              size={28}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <Text className={themeClass("mt-5 text-3xl font-bold text-slate-900")}>
            {title}
          </Text>

          <Text className={themeClass("mt-3 text-base leading-6 text-slate-500")}>
            {description}
          </Text>

          <View className={themeClass("mt-6 rounded-2xl bg-slate-50 p-4")}>
            <Text className={themeClass("text-sm font-semibold leading-5 text-slate-600")}>
              This page has its
              own route file.
              The assigned team
              member can implement
              the feature here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}