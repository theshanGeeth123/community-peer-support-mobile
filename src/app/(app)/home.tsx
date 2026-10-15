import { useThemeTone, useThemedClassName } from '@/theme/useAlyvenAppearance';
import {
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
  useAuth,
} from "@/features/auth/hooks/useAuth";

export default function HomeScreen() {
  const themeClass = useThemedClassName();
  const themeTone = useThemeTone();

  const { user } = useAuth();

  const firstName =
    user?.fullName
      ?.trim()
      .split(" ")[0] || "there";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeTone("#F5FAF9", "backgroundColor"),
      }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        className={themeClass("flex-1")}
        contentContainerClassName={themeClass("px-5 pb-8 pt-4")}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className={themeClass("mb-6 flex-row items-center justify-between")}>
          <View className={themeClass("flex-1")}>
            <Text className={themeClass("text-sm font-medium text-slate-500")}>
              Welcome back
            </Text>

            <Text className={themeClass("mt-1 text-3xl font-bold text-slate-900")}>
              Hi, {firstName}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.navigate(
                "/(app)/profile"
              )
            }
            className={themeClass("h-12 w-12 items-center justify-center rounded-full bg-indigo-100")}
          >
            <Text className={themeClass("text-lg font-bold text-indigo-700")}>
              {user?.fullName
                ?.charAt(0)
                .toUpperCase() ||
                "U"}
            </Text>
          </Pressable>
        </View>

        <View className={themeClass("overflow-hidden rounded-3xl bg-indigo-600 p-6")}>
          <View className={themeClass("flex-row items-start justify-between")}>
            <View className={themeClass("flex-1 pr-4")}>
              <Text className={themeClass("text-sm font-semibold uppercase tracking-wider text-indigo-200")}>
                Community Peer Support
              </Text>

              <Text className={themeClass("mt-3 text-2xl font-bold leading-8 text-white")}>
                You don't have to navigate everything alone.
              </Text>

              <Text className={themeClass("mt-3 leading-6 text-indigo-100")}>
                Connect with supportive
                communities and find resources
                designed to help you move
                forward.
              </Text>
            </View>

            <View className={themeClass("h-14 w-14 items-center justify-center rounded-2xl bg-white/15")}>
              <Ionicons
                name="heart"
                size={28}
                color="white"
              />
            </View>
          </View>
        </View>

        <View className={themeClass("mt-5 flex-row gap-3")}>
          <View className={themeClass("flex-1 rounded-3xl border border-slate-200 bg-white p-5")}>
            <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-indigo-50")}>
              <Ionicons
                name="person-outline"
                size={20}
                color={themeTone("#0E7C86", "color")}
              />
            </View>

            <Text className={themeClass("mt-4 text-xs font-medium uppercase text-slate-400")}>
              Account Role
            </Text>

            <Text className={themeClass("mt-1 text-sm font-bold text-slate-900")}>
              {user?.role}
            </Text>
          </View>

          <View className={themeClass("flex-1 rounded-3xl border border-slate-200 bg-white p-5")}>
            <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-emerald-50")}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={themeTone("#059669", "color")}
              />
            </View>

            <Text className={themeClass("mt-4 text-xs font-medium uppercase text-slate-400")}>
              Account
            </Text>

            <Text className={themeClass("mt-1 text-sm font-bold text-emerald-600")}>
              {user?.accountStatus}
            </Text>
          </View>
        </View>

        <Text className={themeClass("mb-4 mt-8 text-xl font-bold text-slate-900")}>
          Quick Actions
        </Text>

        <Pressable
          onPress={() =>
            router.navigate(
              "/(app)/community"
            )
          }
          className={themeClass("mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5")}
        >
          <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50")}>
            <Ionicons
              name="people-outline"
              size={24}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <View className={themeClass("ml-4 flex-1")}>
            <Text className={themeClass("text-base font-bold text-slate-900")}>
              Community
            </Text>

            <Text className={themeClass("mt-1 text-sm leading-5 text-slate-500")}>
              Discover supportive people and
              useful resources.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />
        </Pressable>

        <Pressable
          onPress={() =>
            router.navigate(
              "/(app)/groups"
            )
          }
          className={themeClass("mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5")}
        >
          <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-violet-50")}>
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <View className={themeClass("ml-4 flex-1")}>
            <Text className={themeClass("text-base font-bold text-slate-900")}>
              Support Groups
            </Text>

            <Text className={themeClass("mt-1 text-sm leading-5 text-slate-500")}>
              Explore groups based on shared
              interests and support needs.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />
        </Pressable>

        <Pressable
          onPress={() =>
            router.navigate(
              "/(app)/profile"
            )
          }
          className={themeClass("flex-row items-center rounded-3xl border border-slate-200 bg-white p-5")}
        >
          <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-sky-50")}>
            <Ionicons
              name="person-circle-outline"
              size={26}
              color={themeTone("#0284c7", "color")}
            />
          </View>

          <View className={themeClass("ml-4 flex-1")}>
            <Text className={themeClass("text-base font-bold text-slate-900")}>
              My Profile
            </Text>

            <Text className={themeClass("mt-1 text-sm leading-5 text-slate-500")}>
              Update account details and manage
              security.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />
        </Pressable>

        {user?.role === "ADMIN" && (
          <>
            <Text className={themeClass("mb-4 mt-8 text-xl font-bold text-slate-900")}>
              Administration
            </Text>

            <Pressable
              onPress={() =>
                router.push(
                  "/(admin)/users"
                )
              }
              className={themeClass("rounded-3xl bg-slate-900 p-6")}
            >
              <View className={themeClass("flex-row items-center")}>
                <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-white/10")}>
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color="white"
                  />
                </View>

                <View className={themeClass("ml-4 flex-1")}>
                  <Text className={themeClass("text-lg font-bold text-white")}>
                    Admin Dashboard
                  </Text>

                  <Text className={themeClass("mt-1 text-sm leading-5 text-slate-300")}>
                    Manage users, roles and
                    account access.
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={themeTone("#C4D8DA", "color")}
                />
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}