import {
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

import {
    chatbotApi,
} from "../api/chatbot.api";

import ChatMessageBubble from "./ChatMessageBubble";

import type {
    ChatbotHistoryItem,
    ChatbotUiMessage,
} from "../types/chatbot.types";

const MAX_MESSAGE_LENGTH =
  1000;

const MAX_HISTORY_ITEMS =
  10;

const createMessageId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const createWelcomeMessage =
  (): ChatbotUiMessage => {
    return {
      id: "chatbot-welcome",

      role: "model",

      text:
        "Hi! I'm the Community Assistant. I can explain how this app works, including registration, support groups, roles, posts, reports, and account features. How can I help?",

      includeInHistory:
        false,
    };
  };

export default function PublicChatbotWidget() {
  const insets =
    useSafeAreaInsets();

  const listRef =
    useRef<
      FlatList<ChatbotUiMessage>
    >(null);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    input,
    setInput,
  ] = useState("");

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatbotUiMessage[]
    >([
      createWelcomeMessage(),
    ]);

  const trimmedInput =
    input.trim();

  const canSend =
    trimmedInput.length > 0 &&
    !isSending;

  const remainingCharacters =
    MAX_MESSAGE_LENGTH -
    input.length;

  const conversationHistory =
    useMemo<
      ChatbotHistoryItem[]
    >(
      () =>
        messages
          .filter(
            (message) =>
              message.includeInHistory !==
              false
          )
          .slice(
            -MAX_HISTORY_ITEMS
          )
          .map(
            (message) => ({
              role:
                message.role,

              text:
                message.text,
            })
          ),

      [messages]
    );

  const scrollToBottom =
    () => {
      requestAnimationFrame(
        () => {
          listRef.current?.scrollToEnd(
            {
              animated:
                true,
            }
          );
        }
      );
    };

  const openChat =
    () => {
      setIsOpen(true);

      setTimeout(
        scrollToBottom,
        120
      );
    };

  const closeChat =
    () => {
      Keyboard.dismiss();

      setIsOpen(false);
    };

  const clearConversation =
    () => {
      if (isSending) {
        return;
      }

      Keyboard.dismiss();

      setErrorMessage(null);

      setInput("");

      setMessages([
        createWelcomeMessage(),
      ]);
    };

  const sendMessage =
    async () => {
      if (!canSend) {
        return;
      }

      /*
       * Save the history BEFORE
       * adding the new user message.
       *
       * Backend separately receives
       * the current message.
       */
      const historyForRequest =
        conversationHistory;

      const messageText =
        trimmedInput;

      const userMessage:
        ChatbotUiMessage =
        {
          id:
            createMessageId(),

          role:
            "user",

          text:
            messageText,
        };

      setMessages(
        (current) => [
          ...current,
          userMessage,
        ]
      );

      setInput("");

      setErrorMessage(null);

      setIsSending(true);

      scrollToBottom();

      try {
        const response =
          await chatbotApi.sendMessage(
            {
              message:
                messageText,

              history:
                historyForRequest,
            }
          );

        const botMessage:
          ChatbotUiMessage =
          {
            id:
              createMessageId(),

            role:
              "model",

            text:
              response.data
                .answer,

            responseType:
              response.data
                .responseType,
          };

        setMessages(
          (current) => [
            ...current,
            botMessage,
          ]
        );
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(
            error
          )
        );
      } finally {
        setIsSending(false);

        setTimeout(
          scrollToBottom,
          80
        );
      }
    };

  return (
    <>
      {/* Floating chatbot button */}

      <Pressable
        onPress={openChat}
        accessibilityRole="button"
        accessibilityLabel="Open Community Assistant"
        style={[
          styles.floatingButton,

          {
            bottom:
              Math.max(
                insets.bottom +
                  20,

                24
              ),
          },
        ]}
      >
        <Ionicons
          name="chatbubble-ellipses"
          size={27}
          color="#ffffff"
        />

        <View
          style={
            styles.onlineIndicator
          }
        />
      </Pressable>

      {/* Chat popup */}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeChat
        }
      >
        <KeyboardAvoidingView
          style={
            styles.backdrop
          }
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : "height"
          }
        >
          {/* Dark background.
              Tap outside chat to close. */}

          <Pressable
            style={
              StyleSheet.absoluteFillObject
            }
            onPress={
              closeChat
            }
          />

          <View
            style={[
              styles.chatPanel,

              {
                marginTop:
                  Math.max(
                    insets.top +
                      44,

                    58
                  ),

                marginBottom:
                  Math.max(
                    insets.bottom +
                      10,

                    14
                  ),
              },
            ]}
          >
            {/* Header */}

            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.assistantIcon
                }
              >
                <Ionicons
                  name="sparkles"
                  size={21}
                  color="#ffffff"
                />
              </View>

              <View
                style={
                  styles.headerTextContainer
                }
              >
                <Text
                  style={
                    styles.headerTitle
                  }
                >
                  Community
                  Assistant
                </Text>

                <View
                  style={
                    styles.statusRow
                  }
                >
                  <View
                    style={
                      styles.statusDot
                    }
                  />

                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    App guidance
                    • Public access
                  </Text>
                </View>
              </View>

              {/* Clear Chat */}

              <Pressable
                onPress={
                  clearConversation
                }
                disabled={
                  isSending
                }
                accessibilityRole="button"
                accessibilityLabel="Clear conversation"
                style={
                  styles.headerAction
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={
                    isSending
                      ? "#cbd5e1"
                      : "#64748b"
                  }
                />
              </Pressable>

              {/* Close */}

              <Pressable
                onPress={
                  closeChat
                }
                accessibilityRole="button"
                accessibilityLabel="Close Community Assistant"
                style={
                  styles.headerAction
                }
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#475569"
                />
              </Pressable>
            </View>

            {/* Safety notice */}

            <View
              style={
                styles.disclaimer
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={17}
                color="#4f46e5"
              />

              <Text
                style={
                  styles.disclaimerText
                }
              >
                I provide app
                guidance only. I am
                not an emergency or
                medical service.
              </Text>
            </View>

            {/* Messages */}

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(
                item
              ) => item.id}
              renderItem={({
                item,
              }) => (
                <ChatMessageBubble
                  message={
                    item
                  }
                />
              )}
              style={
                styles.messageList
              }
              contentContainerStyle={
                styles.messageListContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
              onContentSizeChange={
                scrollToBottom
              }
              ListFooterComponent={
                isSending ? (
                  <View
                    style={
                      styles.typingRow
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color="#4f46e5"
                    />

                    <Text
                      style={
                        styles.typingText
                      }
                    >
                      Assistant is
                      typing...
                    </Text>
                  </View>
                ) : null
              }
            />

            {/* API error */}

            {errorMessage && (
              <View
                style={
                  styles.errorBox
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#dc2626"
                />

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {
                    errorMessage
                  }
                </Text>
              </View>
            )}

            {/* Input */}

            <View
              style={
                styles.composer
              }
            >
              <View
                style={
                  styles.inputContainer
                }
              >
                <TextInput
                  value={input}
                  onChangeText={(
                    value
                  ) => {
                    if (
                      value.length <=
                      MAX_MESSAGE_LENGTH
                    ) {
                      setInput(
                        value
                      );
                    }
                  }}
                  placeholder="Ask about the app..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  editable={
                    !isSending
                  }
                  maxLength={
                    MAX_MESSAGE_LENGTH
                  }
                  style={
                    styles.input
                  }
                  textAlignVertical="top"
                />

                {input.length >=
                  850 && (
                  <Text
                    style={
                      styles.characterCount
                    }
                  >
                    {
                      remainingCharacters
                    }
                  </Text>
                )}
              </View>

              <Pressable
                onPress={() => {
                  void sendMessage();
                }}
                disabled={
                  !canSend
                }
                accessibilityRole="button"
                accessibilityLabel="Send chatbot message"
                style={[
                  styles.sendButton,

                  !canSend &&
                    styles.sendButtonDisabled,
                ]}
              >
                {isSending ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color="#ffffff"
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles =
  StyleSheet.create({
    floatingButton: {
      position:
        "absolute",

      right: 20,

      zIndex: 50,

      elevation: 12,

      width: 60,

      height: 60,

      borderRadius: 30,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#4f46e5",

      shadowColor:
        "#312e81",

      shadowOffset: {
        width: 0,

        height: 6,
      },

      shadowOpacity:
        0.24,

      shadowRadius: 10,
    },

    onlineIndicator: {
      position:
        "absolute",

      right: 2,

      top: 2,

      width: 14,

      height: 14,

      borderRadius: 7,

      borderWidth: 2,

      borderColor:
        "#ffffff",

      backgroundColor:
        "#22c55e",
    },

    backdrop: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
    },

    chatPanel: {
      flex: 1,

      marginHorizontal:
        12,

      overflow:
        "hidden",

      borderRadius: 26,

      backgroundColor:
        "#ffffff",

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,

        height: 10,
      },

      shadowOpacity:
        0.22,

      shadowRadius: 20,

      elevation: 20,
    },

    header: {
      minHeight: 70,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    assistantIcon: {
      width: 42,

      height: 42,

      borderRadius: 15,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#4f46e5",
    },

    headerTextContainer: {
      flex: 1,

      marginLeft: 11,
    },

    headerTitle: {
      color: "#0f172a",

      fontSize: 16,

      fontWeight:
        "800",
    },

    statusRow: {
      marginTop: 4,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statusDot: {
      width: 7,

      height: 7,

      borderRadius: 4,

      marginRight: 6,

      backgroundColor:
        "#22c55e",
    },

    statusText: {
      flexShrink: 1,

      color: "#64748b",

      fontSize: 11,

      fontWeight:
        "600",
    },

    headerAction: {
      width: 38,

      height: 38,

      marginLeft: 3,

      borderRadius: 19,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#f8fafc",
    },

    disclaimer: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        14,

      paddingVertical:
        10,

      backgroundColor:
        "#eef2ff",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#e0e7ff",
    },

    disclaimerText: {
      flex: 1,

      marginLeft: 7,

      color: "#4338ca",

      fontSize: 11.5,

      lineHeight: 16,

      fontWeight:
        "600",
    },

    messageList: {
      flex: 1,

      backgroundColor:
        "#ffffff",
    },

    messageListContent: {
      paddingHorizontal:
        15,

      paddingTop: 18,

      paddingBottom: 8,
    },

    typingRow: {
      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 12,

      paddingHorizontal:
        13,

      paddingVertical:
        10,

      borderRadius: 16,

      backgroundColor:
        "#f1f5f9",
    },

    typingText: {
      marginLeft: 8,

      color: "#64748b",

      fontSize: 12,

      fontWeight:
        "600",
    },

    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginHorizontal:
        14,

      marginBottom: 8,

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        "#fecaca",

      backgroundColor:
        "#fef2f2",
    },

    errorText: {
      flex: 1,

      marginLeft: 7,

      color: "#b91c1c",

      fontSize: 12,

      lineHeight: 17,
    },

    composer: {
      flexDirection:
        "row",

      alignItems:
        "flex-end",

      paddingHorizontal:
        12,

      paddingTop: 9,

      paddingBottom: 12,

      borderTopWidth:
        1,

      borderTopColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    inputContainer: {
      flex: 1,

      minHeight: 48,

      maxHeight: 112,

      marginRight: 9,

      borderWidth: 1,

      borderColor:
        "#cbd5e1",

      borderRadius: 18,

      backgroundColor:
        "#f8fafc",
    },

    input: {
      minHeight: 46,

      maxHeight: 94,

      paddingHorizontal:
        14,

      paddingTop: 12,

      paddingBottom: 10,

      color: "#0f172a",

      fontSize: 14,

      lineHeight: 19,
    },

    characterCount: {
      position:
        "absolute",

      right: 10,

      bottom: 5,

      color: "#94a3b8",

      fontSize: 10,

      fontWeight:
        "600",
    },

    sendButton: {
      width: 48,

      height: 48,

      borderRadius: 16,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#4f46e5",
    },

    sendButtonDisabled: {
      backgroundColor:
        "#cbd5e1",
    },
  });