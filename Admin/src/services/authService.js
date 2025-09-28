import { jwtDecode } from "jwt-decode";

// Use fallback URL if environment variable is not set
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = `${BASE_URL}/api/v1/admins`;

const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Invalid username or password");
    }

    const data = await response.json();

    // Check if token exists in response
    if (!data.token) {
      throw new Error("No token received from server");
    }

    return data.token;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
const decodeToken = (token) => jwtDecode(token);

const authService = { login, decodeToken };
export default authService;
