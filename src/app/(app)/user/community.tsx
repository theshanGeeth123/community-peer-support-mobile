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

export default function UserCommunityScreen() {
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
            Community
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            Connect, share and
            discover helpful
            community resources.
          </Text>
        </View>

        <View className="mt-7 rounded-3xl bg-indigo-600 p-6">
          <Ionicons
            name="people"
            size={30}
            color="white"
          />

          <Text className="mt-5 text-2xl font-bold text-white">
            Peer Support
            Community
          </Text>

          <Text className="mt-2 leading-6 text-indigo-100">
            Discover conversations
            and shared experiences
            from the community.
          </Text>
        </View>

        <Text className="mb-4 mt-8 text-xl font-bold text-slate-900">
          Explore
        </Text>

        <Pressable className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5">
          <Ionicons
            name="compass-outline"
            size={25}
            color="#4f46e5"
          />

          <View className="ml-4">
            <Text className="font-bold text-slate-900">
              Discover Posts
            </Text>

            <Text className="mt-1 text-sm text-slate-500">
              Explore community
              discussions.
            </Text>
          </View>
        </Pressable>

        <Pressable className="flex-row items-center rounded-3xl border border-slate-200 bg-white p-5">
          <Ionicons
            name="heart-outline"
            size={25}
            color="#059669"
          />

          <View className="ml-4">
            <Text className="font-bold text-slate-900">
              Wellness Resources
            </Text>

            <Text className="mt-1 text-sm text-slate-500">
              Find useful wellness
              resources.
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}