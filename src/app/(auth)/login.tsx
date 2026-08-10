import {
  useState,
} from "react";

import {
  ActivityIndicator,
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

const DEMO_PASSWORD =
  "Test@12345";

const DEMO_ACCOUNTS = [
  {
    role: "USER",
    label: "User",
    email:
      "user.test@example.com",
    icon:
      "person-outline" as const,
  },

  {
    role: "PEER_SUPPORTER",
    label: "Peer Supporter",
    email:
      "peer.test@example.com",
    icon:
      "people-outline" as const,
  },

  {
    role: "MODERATOR",
    label: "Moderator",
    email:
      "moderator.test@example.com",
    icon:
      "shield-checkmark-outline" as const,
  },

  {
    role: "ADMIN",
    label: "Admin",
    email:
      "admin.test@example.com",
    icon:
      "settings-outline" as const,
  },
];

export default function LoginScreen() {
  const {
    login,
  } = useAuth();

  const [
    apiError,
    setApiError,
  ] = useState<string | null>(
    null
  );

  const [
    demoLoadingRole,
    setDemoLoadingRole,
  ] = useState<
    string | null
  >(null);

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
       * Navigation happens automatically
       * after AuthContext updates the user.
       *
       * The auth layout redirects each role
       * to its correct home screen.
       */
    } catch (error) {
      setApiError(
        getApiErrorMessage(
          error
        )
      );
    }
  };

  const handleDemoLogin =
    async (
      role: string,
      email: string
    ) => {
      try {
        setApiError(null);

        setDemoLoadingRole(
          role
        );

        await login({
          email,
          password:
            DEMO_PASSWORD,
        });

        /*
         * No manual router navigation here.
         *
         * Role-based redirect happens
         * automatically after login.
         */
      } catch (error) {
        setApiError(
          getApiErrorMessage(
            error
          )
        );
      } finally {
        setDemoLoadingRole(
          null
        );
      }
    };

  const isDemoLoginLoading =
    demoLoadingRole !== null;

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to continue to your peer-support community."
    >
      <ApiMessage
        message={apiError}
      />

      {/*
       * DEVELOPMENT-ONLY DEMO LOGIN
       *
       * These buttons are shown only while
       * running the app in development mode.
       */}
      {__DEV__ && (
        <View className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <View className="mb-3 flex-row items-center">
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Ionicons
                name="flash-outline"
                size={17}
                color="#b45309"
              />
            </View>

            <View className="flex-1">
              <Text className="font-bold text-amber-900">
                Demo Login
              </Text>

              <Text className="mt-0.5 text-xs text-amber-700">
                Quick access for role testing
              </Text>
            </View>
          </View>

          <View className="gap-2">
            {DEMO_ACCOUNTS.map(
              (
                account
              ) => {
                const isCurrentLoading =
                  demoLoadingRole ===
                  account.role;

                const isDisabled =
                  isSubmitting ||
                  isDemoLoginLoading;

                return (
                  <Pressable
                    key={
                      account.role
                    }
                    disabled={
                      isDisabled
                    }
                    onPress={() =>
                      handleDemoLogin(
                        account.role,
                        account.email
                      )
                    }
                    className={`min-h-12 flex-row items-center rounded-xl border px-4 ${
                      isDisabled
                        ? "border-slate-200 bg-slate-100"
                        : "border-amber-200 bg-white active:bg-amber-100"
                    }`}
                  >
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                      {isCurrentLoading ? (
                        <ActivityIndicator
                          size="small"
                          color="#4f46e5"
                        />
                      ) : (
                        <Ionicons
                          name={
                            account.icon
                          }
                          size={
                            18
                          }
                          color="#4f46e5"
                        />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="font-semibold text-slate-800">
                        {
                          account.label
                        }
                      </Text>

                      <Text
                        numberOfLines={
                          1
                        }
                        className="text-xs text-slate-500"
                      >
                        {
                          account.email
                        }
                      </Text>
                    </View>

                    <Ionicons
                      name="arrow-forward-outline"
                      size={18}
                      color="#64748b"
                    />
                  </Pressable>
                );
              }
            )}
          </View>
        </View>
      )}

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
            autoCorrect={
              false
            }
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
        disabled={
          isDemoLoginLoading
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
           * separately.
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