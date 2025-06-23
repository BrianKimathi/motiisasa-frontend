import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import type {
  User,
  ShowroomCorporate,
  ShowroomCorporateData,
} from "../types/types";

// Service response interface
interface ServiceResponse {
  status: "success" | "error";
  message: string;
  data?: { user?: User; token?: string };
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    state?: string,
    seller_type?: "individual" | "showroom" | "corporate",
    showroom_corporate?: Partial<ShowroomCorporate>
  ) => Promise<void>;
  logout: () => void;
  verifyOtp: (userId: number, otp: string) => Promise<void>;
  resendOtp: (userId: number) => Promise<void>;
  updateSellerType: (
    sellerType: "individual" | "showroom" | "corporate"
  ) => Promise<void>;
  updateShowroomCorporate: (
    showroomCorporate: Partial<ShowroomCorporate> & { logo?: File }
  ) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (formData: FormData) => Promise<ServiceResponse>;
  loading: boolean;
  error: string | null;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<{
    user: User | null;
    token: string | null;
  }>({ user: null, token: null });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
    headers: { "Content-Type": "application/json" },
  });

  // Add Authorization header
  api.interceptors.request.use((config) => {
    if (authState.token) {
      config.headers.Authorization = `Bearer ${authState.token}`;
    }
    return config;
  });

  // Handle 401/403 errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        toast.error("Session expired. Please log in again.");
        navigate("/authentication");
      }
      return Promise.reject(error);
    }
  );

  // Load auth state
  useEffect(() => {
    const loadAuthState = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        try {
          setAuthState({
            token: storedToken,
            user: JSON.parse(storedUser) as User,
          });
          await authService.fetchProfile(storedToken);
        } catch {
          logout();
        }
      }
      setAuthLoading(false);
    };
    loadAuthState();
  }, []);

  // Update auth state
  const updateAuthState = (user: User | null, token: string | null) => {
    setAuthState({ user, token });
    if (user && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.status === "success") {
        updateAuthState(response.data.user!, response.data.token!);
        if (!response.data.user?.is_verified) {
          toast.info("Please verify your OTP.");
          navigate("/verify");
        } else {
          toast.success("Login successful!");
          navigate("/");
        }
      } else {
        setError(response.message || "Login failed");
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    state?: string,
    seller_type: "individual" | "showroom" | "corporate" = "individual",
    showroom_corporate?: Partial<ShowroomCorporate>
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (
        (seller_type === "showroom" || seller_type === "corporate") &&
        (!showroom_corporate || !showroom_corporate.name)
      ) {
        throw new Error(
          "Showroom or corporate name is required for this seller type"
        );
      }
      // Transform showroom_corporate to match Omit<ShowroomCorporateData, "logo">
      const transformedShowroomCorporate:
        | Omit<ShowroomCorporateData, "logo">
        | undefined = showroom_corporate
        ? {
            id: showroom_corporate.id,
            name: showroom_corporate.name ?? "", // Ensure name is string
            registration_number:
              showroom_corporate.registration_number ?? undefined,
            contact_email: showroom_corporate.contact_email ?? undefined,
            contact_phone: showroom_corporate.contact_phone ?? undefined,
            address: showroom_corporate.address ?? undefined,
            city: showroom_corporate.city ?? undefined,
            postal_code: showroom_corporate.postal_code ?? undefined,
            state: showroom_corporate.state ?? undefined,
          }
        : undefined;

      const response = await authService.register(
        name,
        email,
        phone,
        password,
        state,
        seller_type,
        transformedShowroomCorporate
      );
      if (response.status === "success") {
        updateAuthState(response.data.user!, response.data.token!);
        toast.success(
          "Registration completed successfully! Please verify your OTP."
        );
        navigate("/verify");
      } else {
        setError(response.message || "Registration failed");
        toast.error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (userId: number, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyOtp(userId, otp);
      if (response.status === "success") {
        updateAuthState(response.data.user!, authState.token);
        toast.success("OTP verified successfully!");
        navigate("/seller-type-selection");
      } else {
        setError(response.message || "OTP verification failed");
        toast.error(response.message || "OTP verification failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "OTP verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resendOtp(userId);
      if (response.status === "success") {
        toast.success("New OTP sent successfully!");
      } else {
        setError(response.message || "Failed to resend OTP");
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSellerType = async (
    sellerType: "individual" | "showroom" | "corporate"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateSellerType(
        authState.token!,
        sellerType
      );
      if (response.status === "success") {
        updateAuthState(response.data.user!, authState.token);
        toast.success("Seller type updated successfully!");
        if (sellerType === "showroom" || sellerType === "corporate") {
          navigate("/showroom-corporate-details");
        } else {
          navigate("/");
        }
      } else {
        setError(response.message || "Failed to update seller type");
        toast.error(response.message || "Failed to update seller type");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update seller type";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateShowroomCorporate = async (
    showroomCorporate: Partial<ShowroomCorporate> & { logo?: File }
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Transform showroomCorporate to match ShowroomCorporateData
      const transformedShowroomCorporate: ShowroomCorporateData = {
        id: showroomCorporate.id,
        name: showroomCorporate.name ?? "", // Ensure name is string
        registration_number: showroomCorporate.registration_number ?? undefined,
        contact_email: showroomCorporate.contact_email ?? undefined,
        contact_phone: showroomCorporate.contact_phone ?? undefined,
        address: showroomCorporate.address ?? undefined,
        city: showroomCorporate.city ?? undefined,
        postal_code: showroomCorporate.postal_code ?? undefined,
        state: showroomCorporate.state ?? undefined,
        logo: showroomCorporate.logo,
      };

      const response = await authService.updateShowroomCorporate(
        authState.token!,
        transformedShowroomCorporate
      );
      if (response.status === "success") {
        updateAuthState(response.data.user!, authState.token);
        toast.success("Business details updated successfully!");
        navigate("/");
      } else {
        setError(response.message || "Failed to update business details");
        toast.error(response.message || "Failed to update business details");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update business details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!authState.token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authService.fetchProfile(authState.token);
      if (response.status === "success") {
        updateAuthState(response.data.user!, authState.token);
      } else {
        setError(response.message || "Failed to fetch profile");
        toast.error(response.message || "Failed to fetch profile");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    formData: FormData
  ): Promise<ServiceResponse> => {
    if (!authState.token) {
      throw new Error("No authentication token available");
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(
        authState.token,
        formData
      );
      if (response.status === "success") {
        updateAuthState(response.data.user!, authState.token);
        toast.success("Profile updated successfully!");
        return response;
      } else {
        setError(response.message || "Failed to update profile");
        toast.error(response.message || "Failed to update profile");
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    updateAuthState(null, null);
    toast.info("Logged out successfully");
    navigate("/authentication");
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        login,
        register,
        logout,
        verifyOtp,
        resendOtp,
        updateSellerType,
        updateShowroomCorporate,
        fetchProfile,
        updateProfile,
        loading,
        error,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
