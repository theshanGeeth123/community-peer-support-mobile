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

import { Ionicons } from "@expo/vector-icons";

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

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out from this device?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Sign out",
          style: "destructive",

          onPress: () => {
            void logout();
          },
        },
      ]
    );
  };

  const handleLogoutAll = () => {
    Alert.alert(
      "Logout from all devices",
      "This will end all active sessions for your account.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Continue",
          style: "destructive",

          onPress: () => {
            void logoutAll();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className="mb-6">
          <Text className="text-3xl font-bold text-slate-900">
            Profile
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            Manage your personal information
            and account security.
          </Text>
        </View>

        <View className="rounded-3xl bg-indigo-600 p-6">
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Text className="text-2xl font-bold text-white">
                {user?.fullName
                  ?.charAt(0)
                  .toUpperCase() ||
                  "U"}
              </Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-white">
                {user?.fullName}
              </Text>

              <Text className="mt-1 text-indigo-100">
                {user?.email}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row gap-2">
            <View className="rounded-full bg-white/15 px-4 py-2">
              <Text className="text-xs font-bold text-white">
                {user?.role}
              </Text>
            </View>

            <View className="rounded-full bg-white/15 px-4 py-2">
              <Text className="text-xs font-bold text-white">
                {user?.accountStatus}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <View className="mb-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Ionicons
                name="person-outline"
                size={21}
                color="#4f46e5"
              />
            </View>

            <View className="ml-3">
              <Text className="text-lg font-bold text-slate-900">
                Personal Information
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Update your account details
              </Text>
            </View>
          </View>

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

            <View className="min-h-14 flex-row items-center rounded-2xl border border-slate-200 bg-slate-100 px-4">
              <Ionicons
                name="mail-outline"
                size={19}
                color="#64748b"
              />

              <Text className="ml-3 flex-1 text-slate-500">
                {user?.email}
              </Text>

              {user?.isEmailVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#059669"
                />
              )}
            </View>
          </View>

          <AuthButton
            title="Save Changes"
            loading={
              isSubmitting
            }
            onPress={handleSubmit(
              handleUpdateProfile
            )}
          />
        </View>

        <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <View className="mb-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#059669"
              />
            </View>

            <View className="ml-3">
              <Text className="text-lg font-bold text-slate-900">
                Security
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Manage sign-in and sessions
              </Text>
            </View>
          </View>

          <View className="mb-4 rounded-2xl bg-slate-50 p-4">
            <Text className="text-xs font-semibold uppercase text-slate-400">
              Login Methods
            </Text>

            <Text className="mt-2 font-semibold text-slate-700">
              {user?.authProviders?.join(
                ", "
              ) || "LOCAL"}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push(
                "/(app)/change-password"
              )
            }
            className="mb-3 flex-row items-center rounded-2xl border border-slate-200 p-4"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Ionicons
                name="key-outline"
                size={21}
                color="#4f46e5"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-slate-800">
                Change Password
              </Text>

              <Text className="mt-1 text-xs text-slate-500">
                Update your account password
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94a3b8"
            />
          </Pressable>

          <Pressable
            onPress={
              handleLogoutAll
            }
            className="mb-3 flex-row items-center rounded-2xl border border-orange-200 bg-orange-50 p-4"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Ionicons
                name="phone-portrait-outline"
                size={21}
                color="#c2410c"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-orange-800">
                Logout From All Devices
              </Text>

              <Text className="mt-1 text-xs text-orange-600">
                End every active session
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={
              handleLogout
            }
            className="flex-row items-center rounded-2xl border border-red-200 bg-red-50 p-4"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#dc2626"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-red-700">
                Sign Out
              </Text>

              <Text className="mt-1 text-xs text-red-500">
                Sign out from this device
              </Text>
            </View>
          </Pressable>
        </View>

        {user?.role === "ADMIN" && (
          <Pressable
            onPress={() =>
              router.push(
                "/(admin)/users"
              )
            }
            className="mt-6 rounded-3xl bg-slate-900 p-6"
          >
            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color="white"
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-white">
                  Admin User Management
                </Text>

                <Text className="mt-1 text-sm leading-5 text-slate-300">
                  Manage users, roles and
                  account access.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#cbd5e1"
              />
            </View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}