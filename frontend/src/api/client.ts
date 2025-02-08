const API_BASE_URL = import.meta.env.VITE_ELIZA_API_URL;

class APIClient {
  baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(url: string, options: any) {
    const response = await fetch(`${this.baseURL}${url}`, options);
    if (!response.ok) {
      const error = new Error("HTTP Error");
      throw error;
    }
    return response.json();
  }

  get<T>(url: string): Promise<T> {
    return this.request(url, {
      method: "GET",
    });
  }

  post<T>(url: string, req?: any): Promise<T> {
    return this.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: req
        ? JSON.stringify(req, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        : undefined,
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
