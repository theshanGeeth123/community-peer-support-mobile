import { useState } from "react";

import {
    ScrollView,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";
import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    Controller,
    useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { authApi } from "@/features/auth/api/auth.api";

import ApiMessage from "@/features/auth/components/ApiMessage";
import AuthButton from "@/features/auth/components/AuthButton";
import AuthInput from "@/features/auth/components/AuthInput";

import {
    changePasswordSchema,
    type ChangePasswordFormData,
} from "@/features/auth/schemas/auth.schemas";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function ChangePasswordScreen() {
  const {
    user,
    logout,
  } = useAuth();

  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(
      changePasswordSchema
    ),

    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleChangePassword = async (
    data: ChangePasswordFormData
  ) => {
    try {
      setApiError(null);

      await authApi.changePassword({
        currentPassword:
          data.currentPassword,

        newPassword:
          data.newPassword,
      });

      await logout();

      router.replace(
        "/(auth)/login"
      );
    } catch (error) {
      setApiError(
        getApiErrorMessage(error)
      );
    }
  };

  if (
    user &&
    !user.canUsePasswordLogin
  ) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <View className="flex-1 justify-center px-6">
          <View className="rounded-3xl border border-slate-200 bg-white p-6">
            <Text className="text-2xl font-bold text-slate-900">
              No password configured
            </Text>

            <Text className="mt-3 leading-6 text-slate-500">
              This account currently uses Google sign-in.
              Use the forgot-password flow to create a
              password for email login.
            </Text>

            <View className="mt-6">
              <AuthButton
                title="Create password"
                onPress={() =>
                  router.push({
                    pathname:
                      "/(auth)/forgot-password",
                  })
                }
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-7">
          <Text className="text-3xl font-bold text-slate-900">
            Change password
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            Enter your current password and choose a new secure password.
          </Text>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-6">
          <ApiMessage message={apiError} />

          <Controller
            control={control}
            name="currentPassword"
            render={({ field }) => (
              <AuthInput
                label="Current password"
                placeholder="Current password"
                isPassword
                value={field.value}
                onChangeText={
                  field.onChange
                }
                onBlur={field.onBlur}
                error={
                  errors.currentPassword
                    ?.message
                }
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field }) => (
              <AuthInput
                label="New password"
                placeholder="New password"
                isPassword
                value={field.value}
                onChangeText={
                  field.onChange
                }
                onBlur={field.onBlur}
                error={
                  errors.newPassword
                    ?.message
                }
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <AuthInput
                label="Confirm new password"
                placeholder="Confirm new password"
                isPassword
                value={field.value}
                onChangeText={
                  field.onChange
                }
                onBlur={field.onBlur}
                error={
                  errors.confirmPassword
                    ?.message
                }
              />
            )}
          />

          <AuthButton
            title="Change password"
            loading={isSubmitting}
            onPress={handleSubmit(
              handleChangePassword
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}