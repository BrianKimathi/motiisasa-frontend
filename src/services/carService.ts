import api from "../utils/api";
import { AxiosError } from "axios"; // Add this import
import type {
  Car,
  Pagination,
  CarResponse,
  CarFilters,
  BrandResponse,
  CarModelResponse,
  SearchSuggestionsResponse,
} from "../types/types";

export type { Car, Pagination, CarResponse };

export const carService = {
  fetchMyCars: async (
    token: string,
    page: number,
    perPage: number,
    filters: CarFilters
  ): Promise<CarResponse> => {
    try {
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const response = await api.get("/car/my-cars", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage, ...validFilters },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to fetch cars");
    }
  },

  fetchWishlist: async (
    token: string,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.get("/car/favorites", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  },

  deleteCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await api.delete(`/car/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to delete car");
    }
  },

  createCar: async (
    token: string,
    formData: FormData
  ): Promise<CarResponse> => {
    try {
      const response = await api.post("/car/cars", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to create car");
    }
  },

  updateCar: async (
    token: string,
    carId: number,
    formData: FormData
  ): Promise<CarResponse> => {
    try {
      const response = await api.put(`/car/cars/${carId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to update car");
    }
  },

  addCarImages: async (
    token: string,
    carId: number,
    images: File[]
  ): Promise<CarResponse> => {
    try {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image));
      const response = await api.post(`/car/cars/${carId}/images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to add images");
    }
  },

  deleteCarImage: async (
    token: string,
    carId: number,
    imageUrl: string
  ): Promise<CarResponse> => {
    try {
      const response = await api.delete(`/car/cars/${carId}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { image_url: imageUrl },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to delete image");
    }
  },

  addToFavorites: async (
    token: string,
    carId: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.post(
        `/car/favorites/${carId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to add to favorites"
      );
    }
  },

  removeFavorite: async (
    token: string,
    carId: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.delete(`/car/favorites/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to remove from favorites"
      );
    }
  },

  expressInterest: async (
    token: string,
    carId: number,
    message: string
  ): Promise<CarResponse> => {
    try {
      const response = await api.post(
        `/car/cars/${carId}/interest`,
        { message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to express interest"
      );
    }
  },

  getAllCars: async (
    page: number,
    perPage: number,
    filters: CarFilters
  ): Promise<CarResponse> => {
    try {
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const response = await api.get("/car/cars", {
        params: { page, per_page: perPage, ...validFilters },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to fetch cars");
    }
  },

  getCarById: async (carId: number): Promise<CarResponse> => {
    try {
      const response = await api.get(`/car/cars/${carId}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to fetch car");
    }
  },

  getMyCarsBids: async (
    token: string,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.get("/car/my-cars/bids", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch bids on my cars"
      );
    }
  },

  getSimilarCars: async (
    token: string,
    carId: number,
    askingPrice: string | null | undefined,
    currency: string | null,
    page: number = 1,
    perPage: number = 4
  ): Promise<CarResponse> => {
    try {
      if (!askingPrice || !currency) {
        throw new Error("Price or currency not available");
      }
      const price = parseFloat(askingPrice);
      if (isNaN(price)) {
        throw new Error("Invalid price");
      }
      // Validate currency
      const validCurrency: "KES" | "USD" | undefined =
        currency === "KES" || currency === "USD" ? currency : undefined;
      if (!validCurrency) {
        throw new Error("Invalid currency");
      }
      const priceRange = price * 0.1;
      const filters: CarFilters = {
        min_price: price - priceRange,
        max_price: price + priceRange,
        currency: validCurrency,
        is_published: "true",
      };
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const response = await api.get("/car/cars", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage, ...validFilters },
      });
      if (response.data.status === "success" && response.data.data?.cars) {
        response.data.data.cars = response.data.data.cars.filter(
          (car: Car) => car.id !== carId
        );
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch similar cars"
      );
    }
  },

  getCarsForSale: async (
    token: string,
    page: number,
    perPage: number,
    filters: CarFilters
  ): Promise<CarResponse> => {
    try {
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const response = await api.get("/car/cars/sale", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage, ...validFilters },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch cars for sale"
      );
    }
  },

  getCarsForHire: async (
    token: string,
    page: number,
    perPage: number,
    filters: CarFilters
  ): Promise<CarResponse> => {
    try {
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const response = await api.get("/car/cars/rent", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage, ...validFilters },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch cars for hire"
      );
    }
  },

  getLatestCars: async (): Promise<CarResponse> => {
    try {
      const response = await api.get("/car/cars/latest", {
        headers: {
          Accept: "application/json",
        },
      });
      console.log(`getLatestCars response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("getLatestCars error:", err);
      throw new Error(
        err.response?.data?.message || "Failed to fetch latest cars"
      );
    }
  },
  getAuctionedCars: async (
    token: string,
    page: number,
    perPage: number,
    filters: CarFilters
  ): Promise<CarResponse> => {
    try {
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      );
      const response = await api.get("/car/cars/auction", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage, ...validFilters },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch auctioned cars"
      );
    }
  },

  getAuctionCarsAdmin: async (
    token: string,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.get("/car/admin/auction-cars", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch auction cars"
      );
    }
  },

  createBidAdmin: async (
    token: string,
    carId: number,
    userId: number,
    bidAmount: string
  ): Promise<CarResponse> => {
    try {
      const response = await api.post(
        `/car/admin/auction-cars/${carId}/bid`,
        {
          user_id: userId,
          bid_amount: bidAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to create bid");
    }
  },

  deleteBidAdmin: async (
    token: string,
    carId: number,
    bidId: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.delete(
        `/car/admin/auction-cars/${carId}/bids/${bidId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to delete bid");
    }
  },

  publishCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await api.put(
        `/car/cars/${carId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to publish car");
    }
  },

  unpublishCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await api.put(
        `/car/${carId}/unpublish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to unpublish car");
    }
  },

  verifyCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await api.put(
        `/car/cars/${carId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to verify car");
    }
  },

  unverifyCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await api.put(
        `/car/${carId}/unverify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to unverify car");
    }
  },

  listBrands: async (signal?: AbortSignal): Promise<BrandResponse> => {
    try {
      const response = await api.get("/car/brands", { signal });
      console.log(
        "listBrands HTTP status:",
        response.status,
        "data:",
        response.data
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("listBrands error:", {
        name: err.name,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      throw new Error(err.response?.data?.message || "Failed to fetch brands");
    }
  },

  listCarModels: async (
    brandId: number,
    signal?: AbortSignal
  ): Promise<CarModelResponse> => {
    try {
      const response = await api.get(`/car/brands/${brandId}/models`, {
        signal,
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to fetch models");
    }
  },

  createBrand: async (data: { name: string }): Promise<BrandResponse> => {
    try {
      const response = await api.post("/car/brands", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to create brand");
    }
  },

  createCarModel: async (
    brandId: number,
    data: { name: string }
  ): Promise<CarModelResponse> => {
    try {
      const response = await api.post(`/car/brands/${brandId}/models`, data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to create model");
    }
  },

  getSearchSuggestions: async (
    query: string
  ): Promise<SearchSuggestionsResponse> => {
    try {
      const response = await api.get("/car/suggestions", {
        params: { query },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(
        err.response?.data?.message || "Failed to fetch suggestions"
      );
    }
  },

  placeBid: async (
    token: string,
    carId: number,
    bidAmount: string
  ): Promise<CarResponse> => {
    try {
      const response = await api.post(
        `/car/cars/${carId}/bid`,
        { bid_amount: bidAmount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to place bid");
    }
  },

  getBids: async (
    token: string,
    carId: number,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const response = await api.get(`/car/cars/${carId}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to fetch bids");
    }
  },
};
