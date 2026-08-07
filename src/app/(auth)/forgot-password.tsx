import { useState } from "react";

import { Pressable, Text } from "react-native";

import { router } from "expo-router";

import {
    Controller,
    useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { authApi } from "@/features/auth/api/auth.api";

import ApiMessage from "@/features/auth/components/ApiMessage";
import AuthButton from "@/features/auth/components/AuthButton";
import AuthInput from "@/features/auth/components/AuthInput";
import AuthScreen from "@/features/auth/components/AuthScreen";

import {
    forgotPasswordSchema,
    type ForgotPasswordFormData,
} from "@/features/auth/schemas/auth.schemas";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function ForgotPasswordScreen() {
  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(
      forgotPasswordSchema
    ),

    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (
    data: ForgotPasswordFormData
  ) => {
    try {
      setApiError(null);

      await authApi.forgotPassword({
        email: data.email,
      });

      router.push({
        pathname:
          "/(auth)/reset-password",

        params: {
          email: data.email,
        },
      });
    } catch (error) {
      setApiError(
        getApiErrorMessage(error)
      );
    }
  };

  return (
    <AuthScreen
      title="Reset password"
      subtitle="Enter your email and we'll send you a 6-digit reset code."
    >
      <ApiMessage message={apiError} />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <AuthInput
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <AuthButton
        title="Send reset code"
        loading={isSubmitting}
        onPress={handleSubmit(
          handleForgotPassword
        )}
      />

      <Pressable
        className="mt-5"
        onPress={() =>
          router.back()
        }
      >
        <Text className="text-center font-semibold text-indigo-600">
          Back to sign in
        </Text>
      </Pressable>
    </AuthScreen>
  );
}