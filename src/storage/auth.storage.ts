import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY =
  "community_peer_support_auth_token";

export const authStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(
        AUTH_TOKEN_KEY
      );
    } catch (error) {
      console.error(
        "Failed to read authentication token:",
        error
      );

      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(
      AUTH_TOKEN_KEY,
      token
    );
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(
        AUTH_TOKEN_KEY
      );
    } catch (error) {
      console.error(
        "Failed to remove authentication token:",
        error
      );
    }
  },
};