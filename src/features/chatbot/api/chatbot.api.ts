import apiClient from "@/services/api/apiClient";

import type {
    ChatbotApiResponse,
    SendChatbotMessagePayload,
} from "../types/chatbot.types";

export const chatbotApi = {
  async sendMessage(
    payload: SendChatbotMessagePayload
  ): Promise<ChatbotApiResponse> {
    const response =
      await apiClient.post<ChatbotApiResponse>(
        "/chatbot/message",
        payload
      );

    return response.data;
  },
};