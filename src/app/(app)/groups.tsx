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
        <Text className="text-3xl font-bold text-slate-900">
          Support Groups
        </Text>

        <Text className="mt-2 leading-6 text-slate-500">
          Find communities where people can
          connect through shared experiences.
        </Text>

        <View className="mt-7 items-center rounded-3xl border border-slate-200 bg-white px-6 py-10">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
            <Ionicons
              name="chatbubbles-outline"
              size={38}
              color="#4f46e5"
            />
          </View>

          <Text className="mt-6 text-center text-2xl font-bold text-slate-900">
            Find Your Community
          </Text>

          <Text className="mt-3 text-center leading-6 text-slate-500">
            Join supportive groups and connect
            with people who understand similar
            experiences.
          </Text>

          <Pressable className="mt-7 min-h-14 w-full items-center justify-center rounded-2xl bg-indigo-600">
            <Text className="text-base font-bold text-white">
              Explore Groups
            </Text>
          </Pressable>
        </View>

        <Text className="mb-4 mt-8 text-xl font-bold text-slate-900">
          Popular Categories
        </Text>

        <View className="flex-row gap-3">
          <Pressable className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
              <Ionicons
                name="school-outline"
                size={22}
                color="#7c3aed"
              />
            </View>

            <Text className="mt-4 font-bold text-slate-900">
              Student Support
            </Text>

            <Text className="mt-2 text-sm leading-5 text-slate-500">
              Academic and student-life
              support.
            </Text>
          </Pressable>

          <Pressable className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#ea580c"
              />
            </View>

            <Text className="mt-4 font-bold text-slate-900">
              Work & Balance
            </Text>

            <Text className="mt-2 text-sm leading-5 text-slate-500">
              Work pressure and balance
              discussions.
            </Text>
          </Pressable>
        </View>

        <View className="mt-7 rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={23}
              color="#4f46e5"
            />

            <View className="ml-3 flex-1">
              <Text className="font-bold text-indigo-900">
                Groups module
              </Text>

              <Text className="mt-1 text-sm leading-5 text-indigo-700">
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