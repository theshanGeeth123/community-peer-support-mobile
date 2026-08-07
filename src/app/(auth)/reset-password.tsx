import { useState } from "react";

import { router, useLocalSearchParams } from "expo-router";

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
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "@/features/auth/schemas/auth.schemas";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function ResetPasswordScreen() {
  const params =
    useLocalSearchParams<{
      email?: string;
    }>();

  const email =
    typeof params.email === "string"
      ? params.email
      : "";

  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(
      resetPasswordSchema
    ),

    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleResetPassword = async (
    data: ResetPasswordFormData
  ) => {
    if (!email) {
      setApiError(
        "Email address is missing. Please request a new reset code."
      );
      return;
    }

    try {
      setApiError(null);

      await authApi.resetPassword({
        email,
        otp: data.otp,
        newPassword:
          data.newPassword,
      });

      router.replace(
        "/(auth)/login"
      );
    } catch (error) {
      setApiError(
        getApiErrorMessage(error)
      );
    }
  };

  return (
    <AuthScreen
      title="Create new password"
      subtitle={`Enter the reset code sent to ${
        email || "your email"
      } and choose a new password.`}
    >
      <ApiMessage message={apiError} />

      <Controller
        control={control}
        name="otp"
        render={({ field }) => (
          <AuthInput
            label="Reset code"
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            value={field.value}
            onChangeText={(value) =>
              field.onChange(
                value.replace(/\D/g, "")
              )
            }
            onBlur={field.onBlur}
            error={errors.otp?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field }) => (
          <AuthInput
            label="New password"
            placeholder="Enter new password"
            isPassword
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={
              errors.newPassword?.message
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
            placeholder="Re-enter new password"
            isPassword
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={
              errors.confirmPassword
                ?.message
            }
          />
        )}
      />

      <AuthButton
        title="Reset password"
        loading={isSubmitting}
        onPress={handleSubmit(
          handleResetPassword
        )}
      />
    </AuthScreen>
  );
}