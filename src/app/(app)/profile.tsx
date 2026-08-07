import {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import { router } from "expo-router";

import {
    Controller,
    useForm,
} from "react-hook-form";

import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    authApi,
} from "@/features/auth/api/auth.api";

import ApiMessage from "@/features/auth/components/ApiMessage";
import AuthButton from "@/features/auth/components/AuthButton";
import AuthInput from "@/features/auth/components/AuthInput";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

import {
    updateProfileSchema,
    type UpdateProfileFormData,
} from "@/features/auth/schemas/auth.schemas";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function ProfileScreen() {
  const {
    user,
    setCurrentUser,
    logout,
    logoutAll,
  } = useAuth();

  const [
    apiError,
    setApiError,
  ] = useState<string | null>(
    null
  );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<UpdateProfileFormData>({
      resolver: zodResolver(
        updateProfileSchema
      ),

      defaultValues: {
        fullName:
          user?.fullName ?? "",
      },
    });

  useEffect(() => {
    reset({
      fullName:
        user?.fullName ?? "",
    });
  }, [
    user?.fullName,
    reset,
  ]);

  const handleUpdateProfile =
    async (
      data: UpdateProfileFormData
    ) => {
      try {
        setApiError(null);
        setSuccessMessage(null);

        const response =
          await authApi.updateProfile({
            fullName:
              data.fullName,
          });

        setCurrentUser(
          response.data.user
        );

        setSuccessMessage(
          "Profile updated successfully."
        );
      } catch (error) {
        setApiError(
          getApiErrorMessage(
            error
          )
        );
      }
    };

  const performLogout =
    async () => {
      await logout();

      router.replace(
        "/(auth)/login"
      );
    };

  const performLogoutAll =
    async () => {
      await logoutAll();

      router.replace(
        "/(auth)/login"
      );
    };

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Sign out",
          style: "destructive",

          onPress: () => {
            void performLogout();
          },
        },
      ]
    );
  };

  const handleLogoutAll =
    () => {
      Alert.alert(
        "Logout from all devices",
        "This will end all active login sessions for your account.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Continue",
            style: "destructive",

            onPress: () => {
              void performLogoutAll();
            },
          },
        ]
      );
    };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className="mb-7 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-900">
              Profile
            </Text>

            <Text className="mt-1 text-slate-500">
              Manage your account
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.back()
            }
            className="rounded-xl bg-slate-200 px-4 py-2"
          >
            <Text className="font-semibold text-slate-700">
              Back
            </Text>
          </Pressable>
        </View>

        <View className="mb-6 rounded-3xl bg-indigo-600 p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Text className="text-2xl font-bold text-white">
              {user?.fullName
                ?.charAt(0)
                .toUpperCase() ??
                "U"}
            </Text>
          </View>

          <Text className="mt-4 text-2xl font-bold text-white">
            {user?.fullName}
          </Text>

          <Text className="mt-1 text-indigo-100">
            {user?.email}
          </Text>

          <View className="mt-4 self-start rounded-full bg-white/20 px-4 py-2">
            <Text className="text-xs font-bold text-white">
              {user?.role}
            </Text>
          </View>
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-6">
          <Text className="mb-5 text-xl font-bold text-slate-900">
            Personal Information
          </Text>

          <ApiMessage
            message={apiError}
          />

          <ApiMessage
            message={
              successMessage
            }
            type="success"
          />

          <Controller
            control={control}
            name="fullName"
            render={({
              field,
            }) => (
              <AuthInput
                label="Full name"
                placeholder="Enter your full name"
                autoCapitalize="words"
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
                  errors
                    .fullName
                    ?.message
                }
              />
            )}
          />

          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-slate-700">
              Email address
            </Text>

            <View className="min-h-14 justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4">
              <Text className="text-slate-500">
                {user?.email}
              </Text>
            </View>
          </View>

          <AuthButton
            title="Save changes"
            loading={
              isSubmitting
            }
            onPress={handleSubmit(
              handleUpdateProfile
            )}
          />
        </View>

        <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <Text className="text-xl font-bold text-slate-900">
            Security
          </Text>

          <Text className="mt-2 text-sm leading-5 text-slate-500">
            Login methods:{" "}
            {user?.authProviders.join(
              ", "
            )}
          </Text>

          <Pressable
            onPress={() =>
              router.push(
                "/(app)/change-password"
              )
            }
            className="mt-5 min-h-14 justify-center rounded-2xl border border-slate-200 px-4"
          >
            <Text className="font-semibold text-slate-800">
              Change Password
            </Text>
          </Pressable>

          <Pressable
            onPress={
              handleLogoutAll
            }
            className="mt-3 min-h-14 justify-center rounded-2xl border border-orange-200 bg-orange-50 px-4"
          >
            <Text className="font-semibold text-orange-700">
              Logout From All Devices
            </Text>
          </Pressable>

          <Pressable
            onPress={
              handleLogout
            }
            className="mt-3 min-h-14 justify-center rounded-2xl border border-red-200 bg-red-50 px-4"
          >
            <Text className="font-semibold text-red-700">
              Sign Out
            </Text>
          </Pressable>
        </View>

        {user?.role ===
          "ADMIN" && (
          <Pressable
            onPress={() =>
              router.push(
                "/(admin)/users"
              )
            }
            className="mt-6 rounded-3xl bg-slate-900 p-6"
          >
            <Text className="text-lg font-bold text-white">
              Admin User Management
            </Text>

            <Text className="mt-1 text-sm text-slate-300">
              Manage users, roles
              and account access
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}