import { useState } from "react";

import {
    Pressable,
    Text,
} from "react-native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

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
    type VerifyOtpFormData,
    verifyOtpSchema,
} from "@/features/auth/schemas/auth.schemas";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function VerifyEmailScreen() {
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

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [isResending, setIsResending] =
    useState(false);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(
      verifyOtpSchema
    ),

    defaultValues: {
      otp: "",
    },
  });

  const handleVerify = async (
    data: VerifyOtpFormData
  ) => {
    if (!email) {
      setApiError(
        "Email address is missing. Please register again."
      );
      return;
    }

    try {
      setApiError(null);
      setSuccessMessage(null);

      await authApi.verifyEmail({
        email,
        otp: data.otp,
      });

      router.replace({
        pathname: "/(auth)/login",
      });
    } catch (error) {
      setApiError(
        getApiErrorMessage(error)
      );
    }
  };

  const handleResend = async () => {
    if (!email || isResending) {
      return;
    }

    try {
      setApiError(null);
      setSuccessMessage(null);
      setIsResending(true);

      const response =
        await authApi.resendVerificationOtp(
          email
        );

      setSuccessMessage(
        response.message
      );
    } catch (error) {
      setApiError(
        getApiErrorMessage(error)
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthScreen
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${
        email || "your email address"
      }.`}
    >
      <ApiMessage message={apiError} />

      <ApiMessage
        message={successMessage}
        type="success"
      />

      <Controller
        control={control}
        name="otp"
        render={({ field }) => (
          <AuthInput
            label="Verification code"
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

      <AuthButton
        title="Verify email"
        loading={isSubmitting}
        onPress={handleSubmit(
          handleVerify
        )}
      />

      <Pressable
        className="mt-5"
        disabled={isResending}
        onPress={handleResend}
      >
        <Text className="text-center font-semibold text-indigo-600">
          {isResending
            ? "Sending..."
            : "Didn't receive a code? Resend"}
        </Text>
      </Pressable>
    </AuthScreen>
  );
}