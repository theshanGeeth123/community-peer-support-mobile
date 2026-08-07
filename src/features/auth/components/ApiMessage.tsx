import { Text, View } from "react-native";

interface ApiMessageProps {
  message?: string | null;
  type?: "error" | "success";
}

export default function ApiMessage({
  message,
  type = "error",
}: ApiMessageProps) {
  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <View
      className={`mb-4 rounded-2xl border p-3 ${
        isError
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <Text
        className={`text-sm ${
          isError
            ? "text-red-700"
            : "text-emerald-700"
        }`}
      >
        {message}
      </Text>
    </View>
  );
}