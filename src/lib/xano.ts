import { XanoClient } from "@xano/js-sdk";

// Configuration
const XANO_CONFIG = {
  apiUrl: import.meta.env.VITE_XANO_API_URL || "",
  realtimeHash: import.meta.env.VITE_XANO_REALTIME_HASH || "",
  realtimeEnabled: import.meta.env.VITE_XANO_REALTIME_ENABLED === "true",
};

// Validate configuration
if (!XANO_CONFIG.apiUrl) {
  throw new Error(
    "VITE_XANO_API_URL is required. Please check your .env file."
  );
}

if (XANO_CONFIG.realtimeEnabled && !XANO_CONFIG.realtimeHash) {
  console.warn(
    "VITE_XANO_REALTIME_HASH is required for realtime features. Realtime will be disabled."
  );
  XANO_CONFIG.realtimeEnabled = false;
}

// Initialize Xano client
export const xano = new XanoClient({
  apiGroupBaseUrl: XANO_CONFIG.apiUrl,
  // Don't initialize realtime connection here - we'll handle it manually in the realtime service
});

// Auth token management
const AUTH_TOKEN_KEY = "xano_auth_token";

export const authTokenManager = {
  get: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  set: (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    xano.setAuthToken(token);
    // Set realtime auth token as well
    if (XANO_CONFIG.realtimeEnabled) {
      xano.setRealtimeAuthToken(token);
    }
  },

  remove: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    xano.setAuthToken(null);
    if (XANO_CONFIG.realtimeEnabled) {
      xano.setRealtimeAuthToken(null);
    }
  },

  init: (): void => {
    const token = authTokenManager.get();
    if (token) {
      xano.setAuthToken(token);
      if (XANO_CONFIG.realtimeEnabled) {
        xano.setRealtimeAuthToken(token);
      }
    }
  },
};

// Initialize auth token on module load
authTokenManager.init();

// Types for auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: number;
  realtimeid?: string; // User's realtime ID for channel subscriptions
  interests?: string[]; // User's interests for tarot readings
  birth_place?: string; // User's birth place
  birth_date?: number; // User's birth date as epoch timestamp in milliseconds
}

export interface AuthResponse {
  authToken: string;
}

// Auth service
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await xano.post("/auth/login", credentials);
      const responseBody = response.getBody();

      // Extract token - Xano may return it as 'token' or 'authToken'
      const token = responseBody.authToken || responseBody.token;

      if (!token) {
        console.error(
          "No token found in response. Response keys:",
          Object.keys(responseBody)
        );
        throw new Error("No authentication token received from server");
      }

      // Set the token immediately
      authTokenManager.set(token);

      return { authToken: token };
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle Xano SDK errors properly
      if (error.getResponse) {
        const errorResponse = error.getResponse();
        const errorBody = errorResponse.getBody();
        console.error("Error response body:", errorBody);
        console.error("Error status code:", errorResponse.getStatusCode());

        // Throw a more user-friendly error message
        throw new Error(errorBody.message || error.message || "Login failed");
      }

      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await xano.post("/auth/signup", credentials);
      const responseBody = response.getBody();

      // Extract token - Xano may return it as 'token' or 'authToken'
      const token = responseBody.authToken || responseBody.token;

      if (!token) {
        console.error(
          "No token found in response. Response keys:",
          Object.keys(responseBody)
        );
        throw new Error("No authentication token received from server");
      }

      // Set the token immediately
      authTokenManager.set(token);

      return { authToken: token };
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle Xano SDK errors properly
      if (error.getResponse) {
        const errorResponse = error.getResponse();
        const errorBody = errorResponse.getBody();
        console.error("Error response body:", errorBody);
        console.error("Error status code:", errorResponse.getStatusCode());

        // Throw a more user-friendly error message
        throw new Error(
          errorBody.message || error.message || "Registration failed"
        );
      }

      throw error;
    }
  },

  async me(): Promise<User> {
    try {
      const response = await xano.get("/auth/me");
      const responseBody = response.getBody();
      return responseBody;
    } catch (error: any) {
      console.error("Get user error:", error);

      // Handle Xano SDK errors properly
      if (error.getResponse) {
        const errorResponse = error.getResponse();
        const errorBody = errorResponse.getBody();
        console.error("Error response body:", errorBody);
        console.error("Error status code:", errorResponse.getStatusCode());

        // Throw a more user-friendly error message
        throw new Error(
          errorBody.message || error.message || "Failed to get user data"
        );
      }

      throw error;
    }
  },

  async updateProfile(profileData: {
    interests?: string[];
    birth_place?: string;
    birth_date?: number;
  }): Promise<User> {
    try {
      const response = await xano.patch("/auth/me", profileData);
      const responseBody = response.getBody();
      return responseBody;
    } catch (error: any) {
      console.error("Update profile error:", error);

      // Handle Xano SDK errors properly
      if (error.getResponse) {
        const errorResponse = error.getResponse();
        const errorBody = errorResponse.getBody();
        console.error("Error response body:", errorBody);
        console.error("Error status code:", errorResponse.getStatusCode());

        // Throw a more user-friendly error message
        throw new Error(
          errorBody.message || error.message || "Failed to update profile"
        );
      }

      throw error;
    }
  },

  logout(): void {
    authTokenManager.remove();
  },

  isAuthenticated(): boolean {
    return !!authTokenManager.get();
  },
};

// Global realtime client to reuse connections
let globalRealtimeClient: any = null;
let connectionPromise: Promise<any> | null = null;
let activeSubscriptions: Map<string, any> = new Map(); // Track active subscriptions by channel name

// Realtime service (optional)
export const realtimeService = {
  isEnabled: (): boolean => XANO_CONFIG.realtimeEnabled,

  // Initialize realtime client connection
  initConnection: async () => {
    if (globalRealtimeClient) {
      return globalRealtimeClient;
    }

    if (connectionPromise) {
      return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
      try {
        // Create a new XanoClient specifically for realtime with the connection hash
        const realtimeClient = new XanoClient({
          apiGroupBaseUrl: XANO_CONFIG.apiUrl,
          realtimeConnectionHash: XANO_CONFIG.realtimeHash,
        });

        // Set auth tokens if available
        const authToken = authTokenManager.get();
        if (authToken) {
          realtimeClient.setAuthToken(authToken);
          realtimeClient.setRealtimeAuthToken(authToken);
        }

        globalRealtimeClient = realtimeClient;
        resolve(realtimeClient);
      } catch (error) {
        reject(error);
      }
    });

    return connectionPromise;
  },

  // Retry creating channel with exponential backoff
  createChannelWithRetry: async (
    client: any,
    channelName: string,
    maxRetries = 5
  ): Promise<any> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const channel = client.channel(channelName);
        console.log("Channel created successfully");
        return channel;
      } catch (error: any) {
        if (error.message && error.message.includes("CONNECTING")) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
          console.log(`WebSocket still connecting, retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        } else {
          // Different error, don't retry
          throw error;
        }
      }
    }
    throw new Error(`Failed to create channel after ${maxRetries} attempts`);
  },

  subscribe: async (channelName: string, callback: (data: any) => void) => {
    if (!XANO_CONFIG.realtimeEnabled) {
      console.warn("Realtime is disabled. Enable it in your .env file.");
      return null;
    }

    if (!XANO_CONFIG.realtimeHash) {
      console.warn(
        "Realtime connection hash is missing. Check your .env file."
      );
      return null;
    }

    // Check if we already have an active subscription for this channel
    if (activeSubscriptions.has(channelName)) {
      console.warn(
        `Already subscribed to channel: ${channelName}. Returning existing subscription.`
      );
      return activeSubscriptions.get(channelName);
    }

    try {
      // Wait for the client to be ready
      console.log("Initializing realtime connection...");
      const realtimeClient = await realtimeService.initConnection();

      console.log("Creating realtime channel with retry logic:", channelName);

      // Create the channel with retry logic for WebSocket state issues
      const channel = await realtimeService.createChannelWithRetry(
        realtimeClient,
        channelName
      );

      // Track connection state
      let isDestroyed = false;
      let connectionEstablished = false;

      // Add error handling for channel events
      channel.on(
        (action: any) => {
          try {
            // Mark connection as established when we receive the first action
            if (
              !connectionEstablished &&
              action.action === "connection_status"
            ) {
              connectionEstablished = true;
              console.log(
                "Realtime connection established for channel:",
                channelName
              );
            }
            callback(action);
          } catch (error) {
            console.error("Error processing realtime action:", error);
          }
        },
        (error: any) => {
          console.error("Realtime channel error:", error);
        }
      );

      const subscription = {
        channel,
        client: realtimeClient,
        channelName,
        destroy: () => {
          if (isDestroyed) {
            console.warn("Realtime subscription already destroyed");
            return;
          }

          isDestroyed = true;
          console.log("Destroying realtime channel:", channelName);

          // Remove from active subscriptions
          activeSubscriptions.delete(channelName);

          try {
            channel.destroy();
          } catch (error) {
            console.warn("Error during realtime cleanup:", error);
          }
        },
      };

      // Store the subscription
      activeSubscriptions.set(channelName, subscription);

      return subscription;
    } catch (error) {
      console.error("Realtime subscription error:", error);
      return null;
    }
  },

  unsubscribe: (subscription: any) => {
    if (!XANO_CONFIG.realtimeEnabled || !subscription) return;

    try {
      if (subscription && typeof subscription.destroy === "function") {
        subscription.destroy();
      }
    } catch (error) {
      console.error("Realtime unsubscription error:", error);
      // Don't rethrow - this is cleanup code
    }
  },

  // Reset connection (useful for auth changes)
  resetConnection: () => {
    // Clean up all active subscriptions
    activeSubscriptions.forEach((subscription, channelName) => {
      console.log(`Cleaning up subscription for channel: ${channelName}`);
      try {
        subscription.destroy();
      } catch (error) {
        console.warn(
          `Error cleaning up subscription for ${channelName}:`,
          error
        );
      }
    });
    activeSubscriptions.clear();

    globalRealtimeClient = null;
    connectionPromise = null;
  },
};

// Tarot reading service
export const tarotService = {
  async submitReading(readingData: {
    user: User;
    reading_mode: "single" | "three" | "celtic";
    selected_cards: number[];
    card_data: any[];
    reading_timestamp: number;
  }): Promise<any> {
    try {
      // Format the userPrompt with user data and card data
      const userPrompt = `Here is the user data and the drawn tarot card:

User:
${JSON.stringify(readingData.user)}

Drawn Card:
${JSON.stringify(readingData.card_data)}

Please give a tarot reading for pas using this information. 
Explain what this card might mean for them right now and provide thoughtful advice they can take away from the reading.`;

      // Send the new payload structure to tarot/read endpoint
      const payload = {
        userPrompt: userPrompt,
      };

      const response = await xano.post("/auth/tarot/read", payload);
      const responseBody = response.getBody();
      return responseBody;
    } catch (error: any) {
      console.error("Submit reading error:", error);

      // Handle Xano SDK errors properly
      if (error.getResponse) {
        const errorResponse = error.getResponse();
        const errorBody = errorResponse.getBody();
        console.error("Error response body:", errorBody);
        console.error("Error status code:", errorResponse.getStatusCode());

        // Throw a more user-friendly error message
        throw new Error(
          errorBody.message || error.message || "Failed to submit reading"
        );
      }

      throw error;
    }
  },

  async getReadingHistory(userId: number): Promise<any[]> {
    try {
      const response = await xano.get(`/tarot/readings?user_id=${userId}`);
      const responseBody = response.getBody();
      return responseBody;
    } catch (error: any) {
      console.error("Get reading history error:", error);

      // Handle Xano SDK errors properly
      if (error.getResponse) {
        const errorResponse = error.getResponse();
        const errorBody = errorResponse.getBody();
        console.error("Error response body:", errorBody);
        console.error("Error status code:", errorResponse.getStatusCode());

        // Throw a more user-friendly error message
        throw new Error(
          errorBody.message || error.message || "Failed to get reading history"
        );
      }

      throw error;
    }
  },
};

// Export configuration for debugging
export const xanoConfig = XANO_CONFIG;
