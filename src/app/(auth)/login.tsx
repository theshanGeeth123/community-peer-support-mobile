import { useThemeTone, useThemedClassName } from '@/theme/useAlyvenAppearance';
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
  const themeClass = useThemedClassName();
  const themeTone = useThemeTone();

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
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

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
        className={themeClass("mb-5 self-end")}
        onPress={() =>
          router.push(
            "/(auth)/forgot-password"
          )
        }
      >
        <Text className={themeClass("font-semibold text-indigo-600")}>
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

      <View className={themeClass("mt-6 flex-row justify-center")}>
        <Text className={themeClass("text-slate-500")}>
          Don't have an account?{" "}
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              "/(auth)/register"
            )
          }
        >
          <Text className={themeClass("font-bold text-indigo-600")}>
            Create account
          </Text>
        </Pressable>
      </View>

      {/*
       * DEVELOPMENT-ONLY DEMO LOGIN
       *
       * These buttons are shown only while
       * running the app in development mode.
       */}
      {__DEV__ && (
        <View className={themeClass("mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3")}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Demo accounts for testing"
            accessibilityState={{ expanded: showDemoAccounts }}
            onPress={() => setShowDemoAccounts((current) => !current)}
            className={themeClass("min-h-12 flex-row items-center rounded-xl px-2")}
          >
            <View className={themeClass("mr-3 h-10 w-10 items-center justify-center rounded-xl bg-indigo-50")}>
              <Ionicons name="code-slash-outline" size={19} color={themeTone("#0E7C86", "color")} />
            </View>
            <View className={themeClass("flex-1")}>
              <Text className={themeClass("font-bold text-slate-900")}>Testing access</Text>
              <Text className={themeClass("mt-1 text-xs text-slate-500")}>
                Development-only role shortcuts
              </Text>
            </View>
            <Ionicons
              name={showDemoAccounts ? "chevron-up-outline" : "chevron-down-outline"}
              size={20}
              color={themeTone("#64808C", "color")}
            />
          </Pressable>
          {showDemoAccounts && (
            <View className={themeClass("mt-3 gap-2 border-t border-slate-200 pt-3")}>
              {DEMO_ACCOUNTS.map((account) => {
                const isCurrentLoading = demoLoadingRole === account.role;
                const isDisabled = isSubmitting || isDemoLoginLoading;
                return (
                  <Pressable
                    key={account.role}
                    disabled={isDisabled}
                    accessibilityRole="button"
                    accessibilityLabel={`Sign in as demo ${account.label}`}
                    onPress={() => handleDemoLogin(account.role, account.email)}
                    className={themeClass(`min-h-14 flex-row items-center rounded-xl border px-3 ${
                      isDisabled
                        ? "border-slate-200 bg-slate-100"
                        : "border-slate-200 bg-white active:bg-indigo-50"
                    }`)}
                  >
                    <View className={themeClass("mr-3 h-9 w-9 items-center justify-center rounded-xl bg-indigo-50")}>
                      {isCurrentLoading ? (
                        <ActivityIndicator size="small" color={themeTone("#0E7C86", "color")} />
                      ) : (
                        <Ionicons name={account.icon} size={19} color={themeTone("#0E7C86", "color")} />
                      )}
                    </View>
                    <View className={themeClass("flex-1")}>
                      <Text className={themeClass("font-semibold text-slate-900")}>{account.label}</Text>
                      <Text numberOfLines={1} className={themeClass("mt-0.5 text-xs text-slate-500")}>
                        {account.email}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward-outline" size={19} color={themeTone("#0E7C86", "color")} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

    </AuthScreen>
  );
}