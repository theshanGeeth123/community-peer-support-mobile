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

export default function CommunityScreen() {
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
        <View>
          <Text className={themeClass("text-3xl font-bold text-slate-900")}>
            Community
          </Text>

          <Text className={themeClass("mt-2 leading-6 text-slate-500")}>
            A supportive space to connect,
            share and discover helpful
            resources.
          </Text>
        </View>

        <View className={themeClass("mt-7 rounded-3xl bg-indigo-600 p-6")}>
          <View className={themeClass("h-14 w-14 items-center justify-center rounded-2xl bg-white/15")}>
            <Ionicons
              name="people"
              size={28}
              color="white"
            />
          </View>

          <Text className={themeClass("mt-5 text-2xl font-bold text-white")}>
            Peer Support Community
          </Text>

          <Text className={themeClass("mt-2 leading-6 text-indigo-100")}>
            Discover conversations,
            activities and resources that
            encourage positive connections.
          </Text>
        </View>

        <Text className={themeClass("mb-4 mt-8 text-xl font-bold text-slate-900")}>
          Explore Community
        </Text>

        <Pressable className={themeClass("mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5")}>
          <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50")}>
            <Ionicons
              name="compass-outline"
              size={24}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <View className={themeClass("ml-4 flex-1")}>
            <Text className={themeClass("font-bold text-slate-900")}>
              Discover Posts
            </Text>

            <Text className={themeClass("mt-1 text-sm leading-5 text-slate-500")}>
              Explore community discussions
              and shared experiences.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />
        </Pressable>

        <Pressable className={themeClass("mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5")}>
          <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50")}>
            <Ionicons
              name="heart-outline"
              size={24}
              color={themeTone("#059669", "color")}
            />
          </View>

          <View className={themeClass("ml-4 flex-1")}>
            <Text className={themeClass("font-bold text-slate-900")}>
              Wellness Resources
            </Text>

            <Text className={themeClass("mt-1 text-sm leading-5 text-slate-500")}>
              Find practical wellness and
              self-care resources.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />
        </Pressable>

        <Pressable className={themeClass("flex-row items-center rounded-3xl border border-slate-200 bg-white p-5")}>
          <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-sky-50")}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={themeTone("#0284c7", "color")}
            />
          </View>

          <View className={themeClass("ml-4 flex-1")}>
            <Text className={themeClass("font-bold text-slate-900")}>
              Community Activities
            </Text>

            <Text className={themeClass("mt-1 text-sm leading-5 text-slate-500")}>
              View upcoming community
              activities and sessions.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />
        </Pressable>

        <View className={themeClass("mt-7 rounded-3xl border border-indigo-100 bg-indigo-50 p-5")}>
          <View className={themeClass("flex-row items-start")}>
            <Ionicons
              name="information-circle-outline"
              size={23}
              color={themeTone("#0E7C86", "color")}
            />

            <View className={themeClass("ml-3 flex-1")}>
              <Text className={themeClass("font-bold text-indigo-900")}>
                Community module
              </Text>

              <Text className={themeClass("mt-1 text-sm leading-5 text-indigo-700")}>
                Community functionality can
                be connected here when that
                module is implemented.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}