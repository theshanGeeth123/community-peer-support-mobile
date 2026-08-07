import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-blue-500">
        Welcome to NativeWind!
      </Text>

      <View className="mt-6 rounded-xl bg-green-500 px-6 py-4">
        <Text className="font-semibold text-white">
          NativeWind is working
        </Text>
      </View>
    </View>
  );
}