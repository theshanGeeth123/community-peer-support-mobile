import {
    Image,
    Text,
    View,
} from "react-native";

interface UserAvatarProps {
  fullName?: string | null;
  avatarUrl?: string | null;
  size?: number;
}

export default function UserAvatar({
  fullName,
  avatarUrl,
  size = 48,
}: UserAvatarProps) {
  const getInitials = () => {
    const name =
      fullName?.trim() || "User";

    const parts = name
      .split(" ")
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return `${parts[0]
      .charAt(0)
      .toUpperCase()}${parts[
      parts.length - 1
    ]
      .charAt(0)
      .toUpperCase()}`;
  };

  if (avatarUrl) {
    return (
      <Image
        source={{
          uri: avatarUrl,
        }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor:
            "#e2e8f0",
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent:
          "center",
        backgroundColor:
          "#e0e7ff",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.34,
          fontWeight: "700",
          color: "#4338ca",
        }}
      >
        {getInitials()}
      </Text>
    </View>
  );
}