import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    Ionicons,
} from "@expo/vector-icons";

export default function UserGroupsScreen() {
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
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className="pr-16">
          <Text className="text-3xl font-bold text-slate-900">
            Support Groups
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            Find communities where
            people can connect through
            shared experiences.
          </Text>
        </View>

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
            Join supportive groups
            and connect with people
            who understand similar
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
            <Ionicons
              name="school-outline"
              size={24}
              color="#7c3aed"
            />

            <Text className="mt-4 font-bold text-slate-900">
              Student Support
            </Text>

            <Text className="mt-2 text-sm leading-5 text-slate-500">
              Academic and
              student-life support.
            </Text>
          </Pressable>

          <Pressable className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <Ionicons
              name="briefcase-outline"
              size={24}
              color="#ea580c"
            />

            <Text className="mt-4 font-bold text-slate-900">
              Work & Balance
            </Text>

            <Text className="mt-2 text-sm leading-5 text-slate-500">
              Work pressure and
              balance discussions.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}