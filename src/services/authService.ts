import axios from "axios";
import type { User } from "../types/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://admin.motiisasa.co.ke/api",
  headers: { "Content-Type": "application/json" },
});

interface AuthResponse {
  status: "success" | "error";
  message: string;
  data: { user?: User; token?: string };
}

interface ShowroomCorporateData {
  name: string;
  registration_number?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  logo?: File;
}

// Retry logic for transient errors
const retry = async (fn: () => Promise<any>, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (
        i === retries - 1 ||
        !error.response ||
        error.response.status !== 500
      ) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log("Login request:", { email });
    try {
      return await retry(() =>
        api.post("/auth/login", { email, password }).then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (
    name: string,
    email: string,
    phone: string,
    password: string,
    state?: string,
    seller_type: "individual" | "showroom" | "corporate" = "individual",
    showroom_corporate?: Omit<ShowroomCorporateData, "logo">
  ): Promise<AuthResponse> => {
    console.log("Register request:", {
      name,
      email,
      phone,
      seller_type,
      showroom_corporate,
    });
    const payload: any = { name, email, phone, password, state, seller_type };
    if (showroom_corporate) {
      payload.showroom_corporate = {
        name: showroom_corporate.name,
        registration_number: showroom_corporate.registration_number,
        contact_email: showroom_corporate.contact_email,
        contact_phone: showroom_corporate.contact_phone,
        address: showroom_corporate.address,
        city: showroom_corporate.city,
        postal_code: showroom_corporate.postal_code,
        state: showroom_corporate.state,
      };
    }
    try {
      return await retry(() =>
        api.post("/auth/register", payload).then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Register error:", error);
      throw error;
    }
  },

  verifyOtp: async (userId: number, otp: string): Promise<AuthResponse> => {
    console.log("Verify OTP request:", { userId, otp });
    try {
      return await retry(() =>
        api
          .post("/auth/verify", { user_id: userId, otp })
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  },

  resendOtp: async (userId: number): Promise<AuthResponse> => {
    console.log("Resend OTP request:", { userId });
    try {
      return await retry(() =>
        api
          .post("/auth/resend_otp", { user_id: userId })
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      throw error;
    }
  },

  fetchProfile: async (token: string): Promise<AuthResponse> => {
    console.log("Fetch profile request");
    try {
      return await retry(() =>
        api
          .get("/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Fetch profile error:", error);
      throw error;
    }
  },

  updateProfile: async (
    token: string,
    formData: FormData
  ): Promise<AuthResponse> => {
    console.log("Update profile request:", formData);
    try {
      return await retry(() =>
        api
          .put("/auth/profile", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  updateSellerType: async (
    token: string,
    sellerType: "individual" | "showroom" | "corporate"
  ): Promise<AuthResponse> => {
    console.log("Update seller type request:", { seller_type: sellerType });
    try {
      return await retry(() =>
        api
          .put(
            "/auth/seller_type",
            { seller_type: sellerType.toLowerCase() },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Update seller type error:", error);
      throw error;
    }
  },

  updateShowroomCorporate: async (
    token: string,
    showroomCorporate: ShowroomCorporateData
  ): Promise<AuthResponse> => {
    console.log("Update showroom corporate request:", showroomCorporate);
    const formData = new FormData();
    formData.append(
      "showroom_corporate",
      JSON.stringify({
        name: showroomCorporate.name,
        registration_number: showroomCorporate.registration_number,
        contact_email: showroomCorporate.contact_email,
        contact_phone: showroomCorporate.contact_phone,
        address: showroomCorporate.address,
        city: showroomCorporate.city,
        postal_code: showroomCorporate.postal_code,
        state: showroomCorporate.state,
      })
    );
    if (showroomCorporate.logo) {
      formData.append("logo", showroomCorporate.logo);
    }
    try {
      return await retry(() =>
        api
          .put("/auth/profile", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Update showroom corporate error:", error);
      throw error;
    }
  },

  getAllUsers: async (token: string): Promise<AuthResponse> => {
    console.log("Get all users request");
    try {
      return await retry(() =>
        api
          .get("/auth/users", { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Get all users error:", error);
      throw error;
    }
  },

  promoteUser: async (token: string, userId: number): Promise<AuthResponse> => {
    console.log("Promote user request:", { userId });
    try {
      return await retry(() =>
        api
          .put(
            `/auth/users/${userId}/promote`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Promote user error:", error);
      throw error;
    }
  },

  suspendUser: async (token: string, userId: number): Promise<AuthResponse> => {
    console.log("Suspend user request:", { userId });
    try {
      return await retry(() =>
        api
          .put(
            `/auth/users/${userId}/suspend`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => res.data)
      );
    } catch (error: any) {
      console.error("Suspend user error:", error);
      throw error;
    }
  },
};
