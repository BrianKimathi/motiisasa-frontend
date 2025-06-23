import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { carService } from "../services/carService";
import type { Car, Pagination, CarFilters } from "../types/types";

interface CarState {
  cars: {
    allCars: Car[];
    myCars: Car[];
  };
  pagination: {
    allCars: Pagination | null;
    myCars: Pagination | null;
  };
  status: {
    allCars: "idle" | "loading" | "succeeded" | "failed";
    myCars: "idle" | "loading" | "succeeded" | "failed";
  };
  error: {
    allCars: string | null;
    myCars: string | null;
  };
}

const initialState: CarState = {
  cars: {
    allCars: [],
    myCars: [],
  },
  pagination: {
    allCars: null,
    myCars: null,
  },
  status: {
    allCars: "idle",
    myCars: "idle",
  },
  error: {
    allCars: null,
    myCars: null,
  },
};

interface FetchCarsPayload {
  page: number;
  perPage: number;
  filters: CarFilters;
}

export const fetchAllCars = createAsyncThunk<
  { cars: Car[]; pagination: Pagination },
  FetchCarsPayload,
  { rejectValue: string }
>(
  "cars/fetchAllCars",
  async ({ page, perPage, filters }, { rejectWithValue }) => {
    try {
      const response = await carService.getAllCars(page, perPage, filters);
      if (
        response.status === "success" &&
        response.data &&
        response.data.cars &&
        response.data.pagination
      ) {
        return {
          cars: response.data.cars,
          pagination: response.data.pagination,
        };
      }
      return rejectWithValue(response.message || "Failed to fetch cars");
    } catch (error: unknown) {
      const errorMessage =
        (
          error as {
            response?: { status: number; data?: { message?: string } };
          }
        )?.response?.data?.message || "Failed to fetch cars";
      if (
        (error as { response?: { status: number } })?.response?.status ===
          401 ||
        (error as { response?: { status: number } })?.response?.status === 403
      ) {
        return rejectWithValue("Session expired. Please log in again.");
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchMyCars = createAsyncThunk<
  { cars: Car[]; pagination: Pagination },
  FetchCarsPayload,
  { rejectValue: string }
>(
  "cars/fetchMyCars",
  async ({ page, perPage, filters }, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("No token available");
    }
    try {
      const response = await carService.fetchMyCars(
        token,
        page,
        perPage,
        filters
      );
      if (
        response.status === "success" &&
        response.data &&
        response.data.cars &&
        response.data.pagination
      ) {
        return {
          cars: response.data.cars,
          pagination: response.data.pagination,
        };
      }
      return rejectWithValue(response.message || "Failed to fetch cars");
    } catch (error: unknown) {
      const errorMessage =
        (
          error as {
            response?: { status: number; data?: { message?: string } };
          }
        )?.response?.data?.message || "Failed to fetch cars";
      if (
        (error as { response?: { status: number } })?.response?.status ===
          401 ||
        (error as { response?: { status: number } })?.response?.status === 403
      ) {
        return rejectWithValue("Session expired. Please log in again.");
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCar = createAsyncThunk<
  { carId: number },
  { token: string; carId: number },
  { rejectValue: string }
>("cars/deleteCar", async ({ token, carId }, { rejectWithValue }) => {
  try {
    const response = await carService.deleteCar(token, carId);
    if (response.status === "success") {
      // Backend returns data: null for successful deletion
      return { carId };
    }
    return rejectWithValue(response.message || "Failed to delete car");
  } catch (error: unknown) {
    const errorMessage =
      (
        error as {
          response?: { status: number; data?: { message?: string } };
        }
      )?.response?.data?.message || "Failed to delete car";
    if (
      (error as { response?: { status: number } })?.response?.status === 401 ||
      (error as { response?: { status: number } })?.response?.status === 403
    ) {
      return rejectWithValue("Session expired. Please log in again.");
    }
    return rejectWithValue(errorMessage);
  }
});

const carsSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {
    resetCarsState: (state) => {
      state.cars = { allCars: [], myCars: [] };
      state.pagination = { allCars: null, myCars: null };
      state.status = { allCars: "idle", myCars: "idle" };
      state.error = { allCars: null, myCars: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCars.pending, (state) => {
        state.status.allCars = "loading";
        state.error.allCars = null;
      })
      .addCase(
        fetchAllCars.fulfilled,
        (
          state,
          action: PayloadAction<{ cars: Car[]; pagination: Pagination }>
        ) => {
          state.status.allCars = "succeeded";
          state.cars.allCars = action.payload.cars;
          state.pagination.allCars = action.payload.pagination;
          state.error.allCars = null;
        }
      )
      .addCase(fetchAllCars.rejected, (state, action) => {
        state.status.allCars = "failed";
        state.error.allCars = action.payload || "Unknown error";
      })
      .addCase(fetchMyCars.pending, (state) => {
        state.status.myCars = "loading";
        state.error.myCars = null;
      })
      .addCase(
        fetchMyCars.fulfilled,
        (
          state,
          action: PayloadAction<{ cars: Car[]; pagination: Pagination }>
        ) => {
          state.status.myCars = "succeeded";
          state.cars.myCars = action.payload.cars;
          state.pagination.myCars = action.payload.pagination;
          state.error.myCars = null;
        }
      )
      .addCase(fetchMyCars.rejected, (state, action) => {
        state.status.myCars = "failed";
        state.error.myCars = action.payload || "Unknown error";
      })
      .addCase(deleteCar.pending, (state) => {
        state.status.myCars = "loading";
        state.error.myCars = null;
      })
      .addCase(
        deleteCar.fulfilled,
        (state, action: PayloadAction<{ carId: number }>) => {
          state.status.myCars = "succeeded";
          state.cars.myCars = state.cars.myCars.filter(
            (car) => car.id !== action.payload.carId
          );
          state.cars.allCars = state.cars.allCars.filter(
            (car) => car.id !== action.payload.carId
          );
          state.error.myCars = null;
        }
      )
      .addCase(deleteCar.rejected, (state, action) => {
        state.status.myCars = "failed";
        state.error.myCars = action.payload || "Unknown error";
      });
  },
});

export const { resetCarsState } = carsSlice.actions;
export const selectCars = (state: { cars: CarState }) => state.cars;
export default carsSlice.reducer;
