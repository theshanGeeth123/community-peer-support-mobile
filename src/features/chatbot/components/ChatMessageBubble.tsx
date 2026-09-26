import {
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import type {
    ChatbotUiMessage,
} from "../types/chatbot.types";

interface ChatMessageBubbleProps {
  message: ChatbotUiMessage;
}

export default function ChatMessageBubble({
  message,
}: ChatMessageBubbleProps) {
  const isUser =
    message.role === "user";

  const isSafety =
    message.responseType ===
    "SAFETY";

  return (
    <View
      style={{
        width: "100%",

        alignItems: isUser
          ? "flex-end"
          : "flex-start",

        marginBottom: 12,
      }}
    >
      {!isUser && (
        <View
          style={{
            flexDirection: "row",

            alignItems: "center",

            marginBottom: 5,
          }}
        >
          <Ionicons
            name={
              isSafety
                ? "shield-checkmark"
                : "sparkles"
            }
            size={14}
            color={
              isSafety
                ? "#b45309"
                : "#4f46e5"
            }
          />

          <Text
            style={{
              marginLeft: 5,

              fontSize: 11,

              fontWeight: "700",

              color: isSafety
                ? "#b45309"
                : "#64748b",
            }}
          >
            {isSafety
              ? "Safety guidance"
              : "Community Assistant"}
          </Text>
        </View>
      )}

      <View
        style={{
          maxWidth: "86%",

          borderRadius: 18,

          borderTopRightRadius:
            isUser ? 6 : 18,

          borderTopLeftRadius:
            isUser ? 18 : 6,

          paddingHorizontal: 14,

          paddingVertical: 11,

          backgroundColor: isUser
            ? "#4f46e5"
            : isSafety
              ? "#fff7ed"
              : "#f1f5f9",

          borderWidth:
            isSafety ? 1 : 0,

          borderColor:
            isSafety
              ? "#fed7aa"
              : "transparent",
        }}
      >
        <Text
          selectable
          style={{
            color: isUser
              ? "#ffffff"
              : isSafety
                ? "#7c2d12"
                : "#1e293b",

            fontSize: 14,

            lineHeight: 21,
          }}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}