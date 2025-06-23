// src/redux/selectors.ts
import { createSelector } from "reselect";
import type { RootState } from "./store"; // Fixed TS1484 with type-only import

// Input selector for the cars state
const getCarsState = (state: RootState) => state.cars;

// Memoized selector for all cars
export const selectAllCars = createSelector([getCarsState], (carsState) => ({
  cars: carsState.cars.allCars || [],
  pagination: carsState.pagination.allCars || {
    page: 1,
    pages: 1,
    total: 0,
    per_page: 9,
  },
  status: carsState.status.allCars || "idle",
  error: carsState.error.allCars || null,
}));

// Memoized selector for my cars
export const selectMyCars = createSelector([getCarsState], (carsState) => ({
  cars: carsState.cars.myCars || [],
  pagination: carsState.pagination.myCars || {
    page: 1,
    pages: 1,
    total: 0,
    per_page: 9,
  },
  status: carsState.status.myCars || "idle",
  error: carsState.error.myCars || null,
}));

// Memoized selector for status (used in Search component)
export const selectCarsStatus = createSelector(
  [getCarsState],
  (carsState) => carsState.status
);
