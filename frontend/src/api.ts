const baseURL = "http://localhost:3001";

export interface APIError {
  message: string;
  statusCode?: number;
}

interface MakeRequestResponse<T> {
  data: T | Record<string, never>;
  error?: APIError;
}

const makeRequest = async <T>(
  endpoint: string,
  reqInit?: RequestInit
): Promise<MakeRequestResponse<T>> => {
  try {
    let responseJSON: T | Record<string, never> = {};

    const response = await fetch(`${baseURL}${endpoint}`, {
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...reqInit,
    });

    if (response.headers.get("Content-Type")?.match("application/json")) {
      responseJSON = await response.json();
    }

    if (!response.ok) {
      return {
        data: {},
        error: responseJSON as APIError,
      };
    }

    return {
      data: responseJSON as T,
    };
  } catch (error) {
    return {
      data: {},
      error: error as APIError,
    };
  }
};

export { makeRequest };
