import { useState } from "react";

import {
    Pressable,
    Text,
    View,
} from "react-native";

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
    registerSchema,
    type RegisterFormData,
} from "@/features/auth/schemas/auth.schemas";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function RegisterScreen() {
  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegister = async (
    data: RegisterFormData
  ) => {
    try {
      setApiError(null);

      const response =
        await authApi.register({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        });

      router.push({
        pathname: "/(auth)/verify-email",
        params: {
          email: response.data.email,
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
      title="Create account"
      subtitle="Join a safe and supportive community."
    >
      <ApiMessage message={apiError} />

      <Controller
        control={control}
        name="fullName"
        render={({ field }) => (
          <AuthInput
            label="Full name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.fullName?.message}
          />
        )}
      />

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

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <AuthInput
            label="Password"
            placeholder="Create a strong password"
            isPassword
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <AuthInput
            label="Confirm password"
            placeholder="Re-enter your password"
            isPassword
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={
              errors.confirmPassword?.message
            }
          />
        )}
      />

      <Text className="mb-5 text-xs leading-5 text-slate-400">
        Use at least 8 characters including uppercase,
        lowercase, a number and a special character.
      </Text>

      <AuthButton
        title="Create account"
        loading={isSubmitting}
        onPress={handleSubmit(
          handleRegister
        )}
      />

      <View className="mt-6 flex-row justify-center">
        <Text className="text-slate-500">
          Already have an account?{" "}
        </Text>

        <Pressable
          onPress={() =>
            router.replace("/(auth)/login")
          }
        >
          <Text className="font-bold text-indigo-600">
            Sign in
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}