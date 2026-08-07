import {
  useState,
} from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import ApiMessage from "@/features/auth/components/ApiMessage";
import AuthButton from "@/features/auth/components/AuthButton";
import AuthInput from "@/features/auth/components/AuthInput";
import AuthScreen from "@/features/auth/components/AuthScreen";

import {
  loginSchema,
  type LoginFormData,
} from "@/features/auth/schemas/auth.schemas";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

export default function LoginScreen() {
  const { login } = useAuth();

  const [
    apiError,
    setApiError,
  ] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<LoginFormData>({
      resolver: zodResolver(
        loginSchema
      ),

      defaultValues: {
        email: "",
        password: "",
      },
    });

  const handleLogin = async (
    data: LoginFormData
  ) => {
    try {
      setApiError(null);

      await login({
        email:
          data.email.trim(),
        password:
          data.password,
      });

      /*
       * Do not manually navigate here.
       *
       * Auth state changes after login and
       * (auth)/_layout.tsx redirects the user
       * to /(app)/home automatically.
       */
    } catch (error) {
      setApiError(
        getApiErrorMessage(
          error
        )
      );
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue to your peer-support community."
    >
      <ApiMessage
        message={apiError}
      />

      <Controller
        control={control}
        name="email"
        render={({
          field,
        }) => (
          <AuthInput
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={
              field.value
            }
            onChangeText={
              field.onChange
            }
            onBlur={
              field.onBlur
            }
            error={
              errors.email
                ?.message
            }
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({
          field,
        }) => (
          <AuthInput
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={
              field.value
            }
            onChangeText={
              field.onChange
            }
            onBlur={
              field.onBlur
            }
            error={
              errors.password
                ?.message
            }
          />
        )}
      />

      <Pressable
        className="mb-5 self-end"
        onPress={() =>
          router.push(
            "/(auth)/forgot-password"
          )
        }
      >
        <Text className="font-semibold text-indigo-600">
          Forgot password?
        </Text>
      </Pressable>

      <AuthButton
        title="Sign In"
        loading={
          isSubmitting
        }
        onPress={handleSubmit(
          handleLogin
        )}
      />

      <View className="my-6 flex-row items-center">
        <View className="h-px flex-1 bg-slate-200" />

        <Text className="mx-3 text-sm text-slate-400">
          or continue with
        </Text>

        <View className="h-px flex-1 bg-slate-200" />
      </View>

      <Pressable
        className="min-h-14 flex-row items-center justify-center rounded-2xl border border-slate-300 bg-white"
        onPress={() => {
          /*
           * Google Login will be integrated
           * after the tab navigation work
           * is completed.
           */
        }}
      >
        <Ionicons
          name="logo-google"
          size={20}
          color="#334155"
        />

        <Text className="ml-3 font-bold text-slate-700">
          Continue with Google
        </Text>
      </Pressable>

      <View className="mt-6 flex-row justify-center">
        <Text className="text-slate-500">
          Don't have an account?{" "}
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              "/(auth)/register"
            )
          }
        >
          <Text className="font-bold text-indigo-600">
            Create account
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}