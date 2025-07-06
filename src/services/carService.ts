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

const API_URL = "https://admin.motiisasa.co.ke/api";

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
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...validFilters,
      });
      const response = await fetch(`${API_URL}/car/my-cars?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cars");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch cars");
    }
  },

  fetchWishlist: async (
    token: string,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      const response = await fetch(`${API_URL}/car/favorites?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch wishlist");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch wishlist");
    }
  },

  deleteCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to delete car");
    }
  },

  createCar: async (
    token: string,
    formData: FormData
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to create car");
    }
  },

  updateCar: async (
    token: string,
    carId: number,
    formData: FormData
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to update car");
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
      const response = await fetch(`${API_URL}/car/cars/${carId}/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add images");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to add images");
    }
  },

  deleteCarImage: async (
    token: string,
    carId: number,
    imageUrl: string
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}/image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete image");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to delete image");
    }
  },

  addToFavorites: async (
    token: string,
    carId: number
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/favorites/${carId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add to favorites");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to add to favorites");
    }
  },

  removeFavorite: async (
    token: string,
    carId: number
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/favorites/${carId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove from favorites");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to remove from favorites");
    }
  },

  expressInterest: async (
    token: string,
    carId: number,
    message: string
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}/interest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to express interest");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to express interest");
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
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...validFilters,
      });
      const response = await fetch(`${API_URL}/car/cars/published?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cars");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch cars");
    }
  },

  getCarById: async (carId: number): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch car");
    }
  },

  getMyCarsBids: async (
    token: string,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      const response = await fetch(`${API_URL}/car/my-cars/bids?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bids on my cars");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch bids on my cars");
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
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...validFilters,
      });
      const response = await fetch(`${API_URL}/car/cars?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch similar cars");
      }
      const data = await response.json();
      if (data.status === "success" && data.data?.cars) {
        data.data.cars = data.data.cars.filter((car: Car) => car.id !== carId);
      }
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch similar cars");
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
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...validFilters,
      });
      const response = await fetch(`${API_URL}/car/cars/sale?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cars for sale");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch cars for sale");
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
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...validFilters,
      });
      const response = await fetch(`${API_URL}/car/cars/rent?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch cars for hire");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch cars for hire");
    }
  },

  getLatestCars: async (): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/latest`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log(`getLatestCars response: ${response}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch latest cars");
      }
      const data = await response.json();
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("getLatestCars error:", err);
      throw new Error(err.message || "Failed to fetch latest cars");
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
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...validFilters,
      });
      const response = await fetch(`${API_URL}/car/cars/auction?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch auctioned cars");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch auctioned cars");
    }
  },

  getAuctionCarsAdmin: async (
    token: string,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      const response = await fetch(
        `${API_URL}/car/admin/auction-cars?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch auction cars");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch auction cars");
    }
  },

  createBidAdmin: async (
    token: string,
    carId: number,
    userId: number,
    bidAmount: string
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(
        `${API_URL}/car/admin/auction-cars/${carId}/bid`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, bid_amount: bidAmount }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create bid");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to create bid");
    }
  },

  deleteBidAdmin: async (
    token: string,
    carId: number,
    bidId: number
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(
        `${API_URL}/car/admin/auction-cars/${carId}/bids/${bidId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bid");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to delete bid");
    }
  },

  publishCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}/publish`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to publish car");
    }
  },

  unpublishCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/${carId}/unpublish`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unpublish car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to unpublish car");
    }
  },

  verifyCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}/verify`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to verify car");
    }
  },

  unverifyCar: async (token: string, carId: number): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/${carId}/unverify`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unverify car");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to unverify car");
    }
  },

  listBrands: async (): Promise<BrandResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/brands`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch brands");
      }
      const data = await response.json();
      console.log("listBrands HTTP status:", response.status, "data:", data);
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("listBrands error:", {
        message: err.message,
      });
      throw new Error(err.message || "Failed to fetch brands");
    }
  },

  listCarModels: async (brandId: number): Promise<CarModelResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/brands/${brandId}/models`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch models");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch models");
    }
  },

  createBrand: async (data: { name: string }): Promise<BrandResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create brand");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to create brand");
    }
  },

  createCarModel: async (
    brandId: number,
    data: { name: string }
  ): Promise<CarModelResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/brands/${brandId}/models`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create model");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to create model");
    }
  },

  getSearchSuggestions: async (
    query: string
  ): Promise<SearchSuggestionsResponse> => {
    try {
      const params = new URLSearchParams({ query });
      const response = await fetch(`${API_URL}/car/suggestions?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch suggestions");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch suggestions");
    }
  },

  placeBid: async (
    token: string,
    carId: number,
    bidAmount: string
  ): Promise<CarResponse> => {
    try {
      const response = await fetch(`${API_URL}/car/cars/${carId}/bid`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bid_amount: bidAmount }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place bid");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to place bid");
    }
  },

  getBids: async (
    token: string,
    carId: number,
    page: number,
    perPage: number
  ): Promise<CarResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });
      const response = await fetch(
        `${API_URL}/car/cars/${carId}/bids?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bids");
      }
      return response.json();
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new Error(err.message || "Failed to fetch bids");
    }
  },
};
