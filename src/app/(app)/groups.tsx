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

import { Ionicons } from "@expo/vector-icons";

export default function GroupsScreen() {
  const themeClass = useThemedClassName();
  const themeTone = useThemeTone();

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
        <Text className={themeClass("text-3xl font-bold text-slate-900")}>
          Support Groups
        </Text>

        <Text className={themeClass("mt-2 leading-6 text-slate-500")}>
          Find communities where people can
          connect through shared experiences.
        </Text>

        <View className={themeClass("mt-7 items-center rounded-3xl border border-slate-200 bg-white px-6 py-10")}>
          <View className={themeClass("h-20 w-20 items-center justify-center rounded-full bg-indigo-50")}>
            <Ionicons
              name="chatbubbles-outline"
              size={38}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <Text className={themeClass("mt-6 text-center text-2xl font-bold text-slate-900")}>
            Find Your Community
          </Text>

          <Text className={themeClass("mt-3 text-center leading-6 text-slate-500")}>
            Join supportive groups and connect
            with people who understand similar
            experiences.
          </Text>

          <Pressable className={themeClass("mt-7 min-h-14 w-full items-center justify-center rounded-2xl bg-indigo-600")}>
            <Text className={themeClass("text-base font-bold text-white")}>
              Explore Groups
            </Text>
          </Pressable>
        </View>

        <Text className={themeClass("mb-4 mt-8 text-xl font-bold text-slate-900")}>
          Popular Categories
        </Text>

        <View className={themeClass("flex-row gap-3")}>
          <Pressable className={themeClass("flex-1 rounded-3xl border border-slate-200 bg-white p-5")}>
            <View className={themeClass("h-11 w-11 items-center justify-center rounded-2xl bg-violet-50")}>
              <Ionicons
                name="school-outline"
                size={22}
                color={themeTone("#0E7C86", "color")}
              />
            </View>

            <Text className={themeClass("mt-4 font-bold text-slate-900")}>
              Student Support
            </Text>

            <Text className={themeClass("mt-2 text-sm leading-5 text-slate-500")}>
              Academic and student-life
              support.
            </Text>
          </Pressable>

          <Pressable className={themeClass("flex-1 rounded-3xl border border-slate-200 bg-white p-5")}>
            <View className={themeClass("h-11 w-11 items-center justify-center rounded-2xl bg-orange-50")}>
              <Ionicons
                name="briefcase-outline"
                size={22}
                color={themeTone("#ea580c", "color")}
              />
            </View>

            <Text className={themeClass("mt-4 font-bold text-slate-900")}>
              Work & Balance
            </Text>

            <Text className={themeClass("mt-2 text-sm leading-5 text-slate-500")}>
              Work pressure and balance
              discussions.
            </Text>
          </Pressable>
        </View>

        <View className={themeClass("mt-7 rounded-3xl border border-indigo-100 bg-indigo-50 p-5")}>
          <View className={themeClass("flex-row items-start")}>
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={themeTone("#0E7C86", "color")}
            />

            <View className={themeClass("ml-3 flex-1")}>
              <Text className={themeClass("font-bold text-indigo-900")}>
                Groups module
              </Text>

              <Text className={themeClass("mt-1 text-sm leading-5 text-indigo-700")}>
                Actual group APIs and group
                details can be integrated here
                when the support-group module is
                ready.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}