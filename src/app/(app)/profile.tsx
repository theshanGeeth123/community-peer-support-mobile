import { useEffect, useState } from "react";

import {
  ActivityIndicator,
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

import * as ImagePicker from "expo-image-picker";

import {
  Ionicons,
} from "@expo/vector-icons";

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

import UserAvatar from "@/features/navigation/components/UserAvatar";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

const MAX_PROFILE_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_PROFILE_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const getDefaultImageFileName = (
  mimeType?: string | null
) => {
  if (mimeType === "image/png") {
    return `profile-${Date.now()}.png`;
  }

  if (mimeType === "image/webp") {
    return `profile-${Date.now()}.webp`;
  }

  return `profile-${Date.now()}.jpg`;
};

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

  const [
    isAvatarUploading,
    setIsAvatarUploading,
  ] = useState(false);

  const [
    isAvatarRemoving,
    setIsAvatarRemoving,
  ] = useState(false);

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

  const clearMessages = () => {
    setApiError(null);
    setSuccessMessage(null);
  };

  const handleUpdateProfile =
    async (
      data: UpdateProfileFormData
    ) => {
      try {
        clearMessages();

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

  const handleChooseProfilePicture =
    async () => {
      if (
        isAvatarUploading ||
        isAvatarRemoving
      ) {
        return;
      }

      try {
        clearMessages();

        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permissionResult.granted
        ) {
          Alert.alert(
            "Photo permission required",
            "Please allow photo access so you can choose a profile picture."
          );

          return;
        }

        const pickerResult =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: [
                "images",
              ],

              allowsEditing: true,

              aspect: [
                1,
                1,
              ],

              quality: 0.85,
            }
          );

        if (
          pickerResult.canceled ||
          pickerResult.assets.length ===
            0
        ) {
          return;
        }

        const asset =
          pickerResult.assets[0];

        if (!asset.uri) {
          setApiError(
            "Unable to read the selected image. Please choose another image."
          );

          return;
        }

        if (
          asset.fileSize &&
          asset.fileSize >
            MAX_PROFILE_IMAGE_SIZE
        ) {
          setApiError(
            "Profile image must be 5 MB or smaller."
          );

          return;
        }

        if (
          asset.mimeType &&
          !ALLOWED_PROFILE_IMAGE_TYPES.has(
            asset.mimeType
          )
        ) {
          setApiError(
            "Please choose a JPEG, PNG, or WebP image."
          );

          return;
        }

        setIsAvatarUploading(
          true
        );

        const response =
          await authApi.uploadProfileImage(
            {
              uri:
                asset.uri,

              fileName:
                asset.fileName ??
                getDefaultImageFileName(
                  asset.mimeType
                ),

              mimeType:
                asset.mimeType ??
                "image/jpeg",
            }
          );

        setCurrentUser(
          response.data.user
        );

        setSuccessMessage(
          user?.avatarUrl
            ? "Profile picture updated successfully."
            : "Profile picture added successfully."
        );
      } catch (error) {
        setApiError(
          getApiErrorMessage(
            error
          )
        );
      } finally {
        setIsAvatarUploading(
          false
        );
      }
    };

  const removeProfilePicture =
    async () => {
      try {
        clearMessages();

        setIsAvatarRemoving(
          true
        );

        const response =
          await authApi.removeProfileImage();

        setCurrentUser(
          response.data.user
        );

        setSuccessMessage(
          "Profile picture removed successfully."
        );
      } catch (error) {
        setApiError(
          getApiErrorMessage(
            error
          )
        );
      } finally {
        setIsAvatarRemoving(
          false
        );
      }
    };

  const handleRemoveProfilePicture =
    () => {
      if (
        !user?.avatarUrl ||
        isAvatarUploading ||
        isAvatarRemoving
      ) {
        return;
      }

      Alert.alert(
        "Remove profile picture",
        "Are you sure you want to remove your current profile picture?",
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Remove",

            style:
              "destructive",

            onPress: () => {
              void removeProfilePicture();
            },
          },
        ]
      );
    };

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out from this device?",
      [
        {
          text:
            "Cancel",

          style:
            "cancel",
        },

        {
          text:
            "Sign out",

          style:
            "destructive",

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
          text:
            "Cancel",

          style:
            "cancel",
        },

        {
          text:
            "Continue",

          style:
            "destructive",

          onPress: () => {
            void logoutAll();
          },
        },
      ]
    );
  };

  const avatarBusy =
    isAvatarUploading ||
    isAvatarRemoving;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          "#f8fafc",
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
            Manage your personal
            information and account
            security.
          </Text>
        </View>

        <View className="rounded-3xl bg-indigo-600 p-6">
          <View className="items-center">
            <Pressable
              onPress={() => {
                void handleChooseProfilePicture();
              }}
              disabled={
                avatarBusy
              }
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
              style={{
                opacity:
                  avatarBusy
                    ? 0.7
                    : 1,
              }}
            >
              <View className="rounded-full border-4 border-white/30 bg-white p-1">
                <UserAvatar
                  fullName={
                    user?.fullName
                  }
                  avatarUrl={
                    user?.avatarUrl
                  }
                  size={88}
                />
              </View>

              <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                {isAvatarUploading ? (
                  <ActivityIndicator
                    size="small"
                    color="#4f46e5"
                  />
                ) : (
                  <Ionicons
                    name="camera"
                    size={18}
                    color="#4f46e5"
                  />
                )}
              </View>
            </Pressable>

            <Text className="mt-4 text-xl font-bold text-white">
              {user?.fullName}
            </Text>

            <Text className="mt-1 text-indigo-100">
              {user?.email}
            </Text>

            <View className="mt-4 flex-row gap-2">
              <View className="rounded-full bg-white/15 px-4 py-2">
                <Text className="text-xs font-bold text-white">
                  {user?.role}
                </Text>
              </View>

              <View className="rounded-full bg-white/15 px-4 py-2">
                <Text className="text-xs font-bold text-white">
                  {
                    user?.accountStatus
                  }
                </Text>
              </View>
            </View>

            <View className="mt-5 w-full flex-row gap-3">
              <Pressable
                onPress={() => {
                  void handleChooseProfilePicture();
                }}
                disabled={
                  avatarBusy
                }
                className="min-h-12 flex-1 flex-row items-center justify-center rounded-2xl bg-white"
                style={{
                  opacity:
                    avatarBusy
                      ? 0.65
                      : 1,
                }}
              >
                {isAvatarUploading ? (
                  <ActivityIndicator
                    size="small"
                    color="#4f46e5"
                  />
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={18}
                    color="#4f46e5"
                  />
                )}

                <Text className="ml-2 font-bold text-indigo-600">
                  {user?.avatarUrl
                    ? "Change Photo"
                    : "Add Photo"}
                </Text>
              </Pressable>

              {user?.avatarUrl && (
                <Pressable
                  onPress={
                    handleRemoveProfilePicture
                  }
                  disabled={
                    avatarBusy
                  }
                  className="min-h-12 flex-1 flex-row items-center justify-center rounded-2xl bg-white/15"
                  style={{
                    opacity:
                      avatarBusy
                        ? 0.65
                        : 1,
                  }}
                >
                  {isAvatarRemoving ? (
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#ffffff"
                    />
                  )}

                  <Text className="ml-2 font-bold text-white">
                    Remove
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View className="mt-5">
          <ApiMessage
            message={
              apiError
            }
          />

          <ApiMessage
            message={
              successMessage
            }
            type="success"
          />
        </View>

        <View className="mt-2 rounded-3xl border border-slate-200 bg-white p-6">
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
                Personal
                Information
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Update your account
                details
              </Text>
            </View>
          </View>

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
                Manage sign-in and
                sessions
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
                Update your account
                password
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
                Logout From All
                Devices
              </Text>

              <Text className="mt-1 text-xs text-orange-600">
                End every active
                session
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
                Sign out from this
                device
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
                  Admin User
                  Management
                </Text>

                <Text className="mt-1 text-sm leading-5 text-slate-300">
                  Manage users, roles
                  and account access.
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