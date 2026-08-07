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
        showsVerticalScrollIndicator={
          false
        }
      >
        <View>
          <Text className="text-3xl font-bold text-slate-900">
            Community
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            A supportive space to connect,
            share and discover helpful
            resources.
          </Text>
        </View>

        <View className="mt-7 rounded-3xl bg-indigo-600 p-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Ionicons
              name="people"
              size={28}
              color="white"
            />
          </View>

          <Text className="mt-5 text-2xl font-bold text-white">
            Peer Support Community
          </Text>

          <Text className="mt-2 leading-6 text-indigo-100">
            Discover conversations,
            activities and resources that
            encourage positive connections.
          </Text>
        </View>

        <Text className="mb-4 mt-8 text-xl font-bold text-slate-900">
          Explore Community
        </Text>

        <Pressable className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Ionicons
              name="compass-outline"
              size={24}
              color="#4f46e5"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="font-bold text-slate-900">
              Discover Posts
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Explore community discussions
              and shared experiences.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        <Pressable className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <Ionicons
              name="heart-outline"
              size={24}
              color="#059669"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="font-bold text-slate-900">
              Wellness Resources
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Find practical wellness and
              self-care resources.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        <Pressable className="flex-row items-center rounded-3xl border border-slate-200 bg-white p-5">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#0284c7"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="font-bold text-slate-900">
              Community Activities
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              View upcoming community
              activities and sessions.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        <View className="mt-7 rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={23}
              color="#4f46e5"
            />

            <View className="ml-3 flex-1">
              <Text className="font-bold text-indigo-900">
                Community module
              </Text>

              <Text className="mt-1 text-sm leading-5 text-indigo-700">
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