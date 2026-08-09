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

import type {
    UserRole,
} from "@/features/auth/types/auth.types";

import RoleGuard from "./RoleGuard";

interface RoleFeatureScreenProps {
  allowedRoles: UserRole[];
  title: string;
  description: string;
  icon: ComponentProps<
    typeof Ionicons
  >["name"];
  note: string;
}

export default function RoleFeatureScreen({
  allowedRoles,
  title,
  description,
  icon,
  note,
}: RoleFeatureScreenProps) {
  return (
    <RoleGuard
      allowedRoles={allowedRoles}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor:
            "#f8fafc",
        }}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-4"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View className="rounded-3xl border border-slate-200 bg-white p-6">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Ionicons
                name={icon}
                size={28}
                color="#4f46e5"
              />
            </View>

            <Text className="mt-5 text-3xl font-bold text-slate-900">
              {title}
            </Text>

            <Text className="mt-3 text-base leading-6 text-slate-500">
              {description}
            </Text>

            <View className="mt-6 rounded-2xl bg-indigo-50 p-4">
              <Text className="text-sm font-bold text-indigo-900">
                Feature Workspace
              </Text>

              <Text className="mt-2 text-sm leading-5 text-indigo-700">
                {note}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </RoleGuard>
  );
}