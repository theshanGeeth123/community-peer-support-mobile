import {
    ActivityIndicator,
    Pressable,
    Text,
} from "react-native";

interface AuthButtonProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export default function AuthButton({
  title,
  loading = false,
  disabled = false,
  onPress,
}: AuthButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      className={`min-h-14 items-center justify-center rounded-2xl ${
        isDisabled
          ? "bg-indigo-300"
          : "bg-indigo-600 active:bg-indigo-700"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-base font-bold text-white">
          {title}
        </Text>
      )}
    </Pressable>
  );
}