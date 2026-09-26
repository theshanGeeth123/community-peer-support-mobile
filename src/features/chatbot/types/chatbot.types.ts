export type ChatbotMessageRole =
  | "user"
  | "model";

export type ChatbotResponseType =
  | "KNOWLEDGE_BASE"
  | "SAFETY";

export interface ChatbotHistoryItem {
  role: ChatbotMessageRole;
  text: string;
}

export interface SendChatbotMessagePayload {
  message: string;
  history?: ChatbotHistoryItem[];
}

export interface ChatbotResponseData {
  answer: string;
  responseType: ChatbotResponseType;
}

export interface ChatbotApiResponse {
  success: boolean;
  message: string;
  data: ChatbotResponseData;
}

export interface ChatbotUiMessage {
  id: string;
  role: ChatbotMessageRole;
  text: string;
  responseType?: ChatbotResponseType;

  /*
   * False for the locally-created
   * welcome message so it is not
   * sent to Gemini as chat history.
   */
  includeInHistory?: boolean;
}