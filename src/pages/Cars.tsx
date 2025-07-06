// Cars.jsx
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTimes, FaSearch, FaHeart, FaFilter } from "react-icons/fa";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchAllCars } from "../redux/carsSlice";
import type { Car, Brand, CarModel } from "../types/types";
import Layout from "../components/Layout";

// CarFilters interface
export interface CarFilters {
  query?: string;
  search_by?: "name" | "model" | "year" | "registration";
  listing_type?: "sale" | "hire" | "auction";
  is_verified?: "true" | "false";
  is_published?: "true" | "false";
  budget?: string;
  location?: string;
  min_yom?: number;
  max_yom?: number;
  min_price?: number;
  max_price?: number;
  currency?: "KES" | "USD";
  brand_id?: number;
  model_id?: number;
  transmission_type?: "Automatic" | "Manual";
  propulsion?: "Gas" | "Electric" | "Hybrid";
  fuel_type?: "Petrol" | "Diesel";
  condition?: "Brand New" | "Foreign Used" | "Locally Used";
  car_type?:
    | "Sedan"
    | "SUV"
    | "Truck"
    | "Coupe"
    | "Convertible"
    | "Van"
    | "Hatchback";
  user_id?: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Format price helper
const formatPrice = (
  price: string | null | undefined,
  currency: string | null | undefined
): string => {
  if (!price || !currency) return "Price not available";
  const num = Number(price);
  if (isNaN(num)) return price;
  const currencyPrefix = currency === "KES" ? "Kes" : currency;
  return `${currencyPrefix} ${num.toLocaleString()}`;
};

// Quick Search Section Component
const QuickSearchSection = memo(
  ({
    searchBy,
    setSearchBy,
    queryInput,
    handleQueryChange,
    minPrice,
    handleMinPriceChange,
    maxPrice,
    handleMaxPriceChange,
    minYom,
    handleMinYomChange,
    maxYom,
    handleMaxYomChange,
    minPriceRange,
    maxPriceRange,
    minYearRange,
    maxYearRange,
    setQueryInput,
    setMinPrice,
    setMaxPrice,
    setMinYom,
    setMaxYom,
    yomError,
    priceError,
    setPriceError,
  }: {
    searchBy: "name" | "model" | "year" | "registration" | "";
    setSearchBy: (
      value: "name" | "model" | "year" | "registration" | ""
    ) => void;
    queryInput: string;
    handleQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minPrice: string;
    handleMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxPrice: string;
    handleMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minYom: string;
    handleMinYomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxYom: string;
    handleMaxYomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minPriceRange: number;
    maxPriceRange: number;
    minYearRange: number;
    maxYearRange: number;
    setQueryInput: (value: string) => void;
    setMinPrice: (value: string) => void;
    setMaxPrice: (value: string) => void;
    setMinYom: (value: string) => void;
    setMaxYom: (value: string) => void;
    yomError: string | null;
    priceError: string | null;
    setPriceError: (value: string | null) => void;
  }) => {
    const searchTabs = ["name", "model", "year", "registration"] as const;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg lg:shadow-none mb-4">
        <h2 className="text-xl font-bold text-[#262162] mb-4 flex items-center">
          <span className="mr-2">Quick Search</span>
          <FaSearch className="text-[#f26624]" />
        </h2>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Search By
              </label>
              <button
                onClick={() => {
                  setSearchBy("");
                  setQueryInput("");
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Search"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={searchBy}
              onChange={(e) =>
                setSearchBy(
                  e.target.value as
                    | "name"
                    | "model"
                    | "year"
                    | "registration"
                    | ""
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition cursor-pointer text-sm"
            >
              <option value="">Select</option>
              {searchTabs.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={queryInput}
              onChange={handleQueryChange}
              placeholder="Search..."
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
              autoComplete="off"
            />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Price Range ({minPriceRange.toLocaleString()} -{" "}
                {maxPriceRange.toLocaleString()})
              </label>
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setPriceError(null);
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Price Range"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input
                type="number"
                value={minPrice}
                onChange={handleMinPriceChange}
                placeholder="Min Price"
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#f26624] transition"
                autoComplete="off"
                inputMode="numeric"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                placeholder="Max Price"
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#f26624] transition"
                autoComplete="off"
                inputMode="numeric"
              />
            </div>
            {priceError && (
              <p className="text-red-500 text-xs mt-1">{priceError}</p>
            )}
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Year of Manufacture ({minYearRange} - {maxYearRange})
              </label>
              <button
                onClick={() => {
                  setMinYom("");
                  setMaxYom("");
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Year"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input
                type="number"
                value={minYom}
                onChange={handleMinYomChange}
                placeholder="Min Year"
                className="border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#f26624] transition"
                autoComplete="off"
                inputMode="numeric"
              />
              <input
                type="number"
                value={maxYom}
                onChange={handleMaxYomChange}
                placeholder="Max Year"
                className="border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#f26624] transition"
                autoComplete="off"
                inputMode="numeric"
              />
            </div>
            {yomError && (
              <p className="text-red-500 text-xs mt-1">{yomError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Advanced Filter Section Component
const AdvancedFilterSection = memo(
  ({
    listingType,
    setListingType,
    brand,
    setBrand,
    model,
    setModel,
    location,
    setLocation,
    currency,
    setCurrency,
    transmission,
    setTransmission,
    propulsion,
    setPropulsion,
    fuelType,
    setFuelType,
    condition,
    setCondition,
    carType,
    setCarType,
    isVerified,
    setIsVerified,
    brands,
    models,
    handleSearch,
    fetchCars,
  }: {
    listingType: "sale" | "hire" | "auction" | "";
    setListingType: (value: "sale" | "hire" | "auction" | "") => void;
    brand: string | null;
    setBrand: (value: string | null) => void;
    model: string | null;
    setModel: (value: string | null) => void;
    location:
      | "Available in Kenya"
      | "Direct Import/International Stock"
      | "Both"
      | "";
    setLocation: (
      value:
        | "Available in Kenya"
        | "Direct Import/International Stock"
        | "Both"
        | ""
    ) => void;
    currency: "All Currencies" | "USD" | "KES";
    setCurrency: (value: "All Currencies" | "USD" | "KES") => void;
    transmission: "Automatic" | "Manual" | "";
    setTransmission: (value: "Automatic" | "Manual" | "") => void;
    propulsion: "Gas" | "Electric" | "Hybrid" | "";
    setPropulsion: (value: "Gas" | "Electric" | "Hybrid" | "") => void;
    fuelType: "Petrol" | "Diesel" | "";
    setFuelType: (value: "Petrol" | "Diesel" | "") => void;
    condition: "Brand New" | "Foreign Used" | "Locally Used" | "";
    setCondition: (
      value: "Brand New" | "Foreign Used" | "Locally Used" | ""
    ) => void;
    carType:
      | "Sedan"
      | "SUV"
      | "Truck"
      | "Coupe"
      | "Convertible"
      | "Van"
      | "Hatchback"
      | "";
    setCarType: (
      value:
        | "Sedan"
        | "SUV"
        | "Truck"
        | "Coupe"
        | "Convertible"
        | "Van"
        | "Hatchback"
        | ""
    ) => void;
    isVerified: boolean | null;
    setIsVerified: (value: boolean | null) => void;
    brands: Brand[];
    models: CarModel[];
    handleSearch: () => void;
    fetchCars: (page: number, filters: CarFilters) => void;
  }) => {
    const listingTypes = ["sale", "hire", "auction"] as const;
    const vehicleLocations = [
      "Available in Kenya",
      "Direct Import/International Stock",
      "Both",
      "",
    ] as const;
    const currencies = ["All Currencies", "USD", "KES"] as const;
    const transmissionTypes = ["Automatic", "Manual"] as const;
    const propulsionTypes = ["Gas", "Electric", "Hybrid"] as const;
    const fuelTypeOptions = ["Petrol", "Diesel"] as const;
    const conditionTypes = [
      "Brand New",
      "Foreign Used",
      "Locally Used",
    ] as const;
    const carTypes = [
      "Sedan",
      "SUV",
      "Truck",
      "Coupe",
      "Convertible",
      "Van",
      "Hatchback",
    ] as const;

    return (
      <div className="bg-white p-4 rounded-xl shadow-lg lg:shadow-none">
        <h2 className="text-xl font-bold text-[#262162] mb-4 flex items-center">
          <span className="mr-2">Advanced Filters</span>
          <FaFilter className="text-[#f26624]" />
        </h2>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Listing Type
              </label>
              <button
                onClick={() => setListingType("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Listing Type"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {listingTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="listingType"
                    value={type}
                    checked={listingType === type}
                    onChange={() => setListingType(type)}
                    className="mr-2 accent-[#f26624]"
                  />
                  <span className="text-gray-700 text-sm">
                    {type === "hire"
                      ? "Rent"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="listingType"
                  value=""
                  checked={listingType === ""}
                  onChange={() => setListingType("")}
                  className="mr-2 accent-[#f26624]"
                />
                <span className="text-gray-700 text-sm">Any</span>
              </label>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Brand & Model
              </label>
              <button
                onClick={() => {
                  setBrand(null);
                  setModel(null);
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Brand & Model"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={brand ?? ""}
              onChange={(e) => {
                const value = e.target.value || null;
                setBrand(value);
                setModel(null);
              }}
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition cursor-pointer text-sm"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={model ?? ""}
              onChange={(e) => setModel(e.target.value || null)}
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
              disabled={!brand}
            >
              <option value="">Select Model</option>
              {models.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Location
              </label>
              <button
                onClick={() => setLocation("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Location"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value as
                    | "Available in Kenya"
                    | "Direct Import/International Stock"
                    | "Both"
                    | ""
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              {vehicleLocations.map((loc) => (
                <option key={loc || "None"} value={loc}>
                  {loc || "None"}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Currency
              </label>
              <button
                onClick={() => setCurrency("All Currencies")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Currency"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "All Currencies" | "USD" | "KES")
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Transmission
              </label>
              <button
                onClick={() => setTransmission("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Transmission"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={transmission}
              onChange={(e) =>
                setTransmission(e.target.value as "Automatic" | "Manual" | "")
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              <option value="">Select</option>
              {transmissionTypes.map((trans) => (
                <option key={trans} value={trans}>
                  {trans}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Propulsion
              </label>
              <button
                onClick={() => setPropulsion("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Propulsion"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={propulsion}
              onChange={(e) =>
                setPropulsion(
                  e.target.value as "Gas" | "Electric" | "Hybrid" | ""
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              <option value="">Select</option>
              {propulsionTypes.map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Fuel Type
              </label>
              <button
                onClick={() => setFuelType("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Fuel Type"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {fuelTypeOptions.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fuelType"
                    value={type}
                    checked={fuelType === type}
                    onChange={() => setFuelType(type)}
                    className="mr-2 accent-[#f26624]"
                  />
                  <span className="text-gray-700 text-sm">{type}</span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="fuelType"
                  value=""
                  checked={fuelType === ""}
                  onChange={() => setFuelType("")}
                  className="mr-2 accent-[#f26624]"
                />
                <span className="text-gray-700 text-sm">Any</span>
              </label>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Condition
              </label>
              <button
                onClick={() => setCondition("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Condition"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={condition}
              onChange={(e) =>
                setCondition(
                  e.target.value as
                    | "Brand New"
                    | "Foreign Used"
                    | "Locally Used"
                    | ""
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              <option value="">Select</option>
              {conditionTypes.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Car Type
              </label>
              <button
                onClick={() => setCarType("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Car Type"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={carType}
              onChange={(e) =>
                setCarType(
                  e.target.value as
                    | "Sedan"
                    | "SUV"
                    | "Truck"
                    | "Coupe"
                    | "Convertible"
                    | "Van"
                    | "Hatchback"
                    | ""
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              <option value="">Select Car Type</option>
              {carTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified === true}
                onChange={(e) => setIsVerified(e.target.checked ? true : null)}
                className="mr-2 accent-[#f26624]"
              />
              <span className="text-[#262162] font-semibold text-sm">
                Verified Only
              </span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-[#f26624] text-white px-4 py-2 rounded-full w-full hover:bg-[#262162] transition cursor-pointer text-sm"
            >
              Search
            </button>
            <button
              onClick={() => {
                setListingType("");
                setBrand(null);
                setModel(null);
                setLocation("");
                setCurrency("All Currencies");
                setTransmission("");
                setPropulsion("");
                setFuelType("");
                setCondition("");
                setCarType("");
                setIsVerified(null);
                fetchCars(1, { is_published: "true" });
              }}
              className="bg-gray-300 text-[#262162] px-4 py-2 rounded-full w-full hover:bg-gray-400 transition cursor-pointer text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  }
);

const Cars = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const carsState = useSelector(
    (state: RootState) =>
      state.cars || {
        cars: { allCars: [], myCars: [] },
        pagination: { allCars: null, myCars: null },
        status: { allCars: "idle", myCars: "idle" },
        error: { allCars: null, myCars: null },
      }
  );
  const {
    cars: { allCars },
    pagination: { allCars: pagination },
    status: { allCars: status },
    error: { allCars: error },
  } = carsState;
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favoriteCarIds, setFavoriteCarIds] = useState<number[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [yomError, setYomError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState<{
    listingType: "sale" | "hire" | "auction" | "";
    searchBy: "name" | "model" | "year" | "registration" | "";
    queryInput: string;
    location:
      | "Available in Kenya"
      | "Direct Import/International Stock"
      | "Both"
      | "";
    minYom: string;
    maxYom: string;
    minPrice: string;
    maxPrice: string;
    currency: "All Currencies" | "USD" | "KES";
    brand: string | null;
    model: string | null;
    transmission: "Automatic" | "Manual" | "";
    propulsion: "Gas" | "Electric" | "Hybrid" | "";
    fuelType: "Petrol" | "Diesel" | "";
    condition: "Brand New" | "Foreign Used" | "Locally Used" | "";
    carType:
      | "Sedan"
      | "SUV"
      | "Truck"
      | "Coupe"
      | "Convertible"
      | "Van"
      | "Hatchback"
      | "";
    isVerified: boolean | null;
  }>({
    listingType: "",
    searchBy: "name",
    queryInput: "",
    location: "",
    minYom: "",
    maxYom: "",
    minPrice: "",
    maxPrice: "",
    currency: "All Currencies",
    brand: null,
    model: null,
    transmission: "",
    propulsion: "",
    fuelType: "",
    condition: "",
    carType: "",
    isVerified: null,
  });

  const perPage = 10;
  const currentYear = new Date().getFullYear();
  const minPriceRange = 0;
  const maxPriceRange = 20000000;
  const minYearRange = 1900;
  const maxYearRange = currentYear;

  // Debug re-renders
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
  });

  // Debounced query
  const query = useDebounce(filters.queryInput, 300);
  const debouncedMinPrice = useDebounce(filters.minPrice, 300);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 300);
  const debouncedMinYom = useDebounce(filters.minYom, 300);
  const debouncedMaxYom = useDebounce(filters.maxYom, 300);

  // Map location to backend
  const mapLocationToBackend = useCallback(
    (
      location:
        | "Available in Kenya"
        | "Direct Import/International Stock"
        | "Both"
        | ""
    ): string | undefined => {
      switch (location) {
        case "Available in Kenya":
          return "Kenya";
        case "Direct Import/International Stock":
          return "International";
        case "Both":
        case "":
          return undefined;
      }
    },
    []
  );

  // Validate year inputs
  const validateYears = useCallback(() => {
    const min = debouncedMinYom ? parseInt(debouncedMinYom, 10) : NaN;
    const max = debouncedMaxYom ? parseInt(debouncedMaxYom, 10) : NaN;
    if (debouncedMinYom && isNaN(min)) {
      return "Invalid minimum year";
    }
    if (debouncedMaxYom && isNaN(max)) {
      return "Invalid maximum year";
    }
    if (!isNaN(min) && (min < minYearRange || min > maxYearRange)) {
      return `Minimum year must be between ${minYearRange} and ${maxYearRange}`;
    }
    if (!isNaN(max) && (max < minYearRange || max > maxYearRange)) {
      return `Maximum year must be between ${minYearRange} and ${maxYearRange}`;
    }
    if (!isNaN(min) && !isNaN(max) && min > max) {
      return "Minimum year cannot be greater than maximum year";
    }
    return null;
  }, [debouncedMinYom, debouncedMaxYom, minYearRange, maxYearRange]);

  // Validate price inputs
  const validatePrices = useCallback(() => {
    const min = debouncedMinPrice ? parseFloat(debouncedMinPrice) : NaN;
    const max = debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : NaN;
    if (debouncedMinPrice && isNaN(min)) {
      return "Invalid minimum price";
    }
    if (debouncedMaxPrice && isNaN(max)) {
      return "Invalid maximum price";
    }
    if (!isNaN(min) && (min < minPriceRange || min > maxPriceRange)) {
      return `Minimum price must be between ${minPriceRange} and ${maxPriceRange}`;
    }
    if (!isNaN(max) && (max < minPriceRange || max > maxPriceRange)) {
      return `Maximum price must be between ${minPriceRange} and ${maxPriceRange}`;
    }
    if (!isNaN(min) && !isNaN(max) && min > max) {
      return "Minimum price cannot be greater than maximum price";
    }
    return null;
  }, [debouncedMinPrice, debouncedMaxPrice, minPriceRange, maxPriceRange]);

  // Build filters
  const carFilters = useMemo(() => {
    const filterParams: CarFilters = { is_published: "true" };
    if (query && filters.searchBy) {
      filterParams.query = query;
      filterParams.search_by = filters.searchBy;
    }
    if (filters.listingType) {
      filterParams.listing_type =
        filters.listingType === "hire" ? "hire" : filters.listingType;
    }
    if (filters.location && filters.location !== "Both") {
      filterParams.location = mapLocationToBackend(filters.location);
    }
    if (debouncedMinYom && !isNaN(parseInt(debouncedMinYom, 10))) {
      filterParams.min_yom = parseInt(debouncedMinYom, 10);
    }
    if (debouncedMaxYom && !isNaN(parseInt(debouncedMaxYom, 10))) {
      filterParams.max_yom = parseInt(debouncedMaxYom, 10);
    }
    if (debouncedMinPrice && !isNaN(parseFloat(debouncedMinPrice))) {
      filterParams.min_price = parseFloat(debouncedMinPrice);
    }
    if (debouncedMaxPrice && !isNaN(parseFloat(debouncedMaxPrice))) {
      filterParams.max_price = parseFloat(debouncedMaxPrice);
    }
    if (filters.currency !== "All Currencies") {
      filterParams.currency = filters.currency as "USD" | "KES";
    }
    if (filters.brand) {
      const brandId = brands.find((b) => b.name === filters.brand)?.id;
      if (brandId) filterParams.brand_id = brandId;
    }
    if (filters.model) {
      const modelId = models.find((m) => m.name === filters.model)?.id;
      if (modelId) filterParams.model_id = modelId;
    }
    if (filters.transmission) {
      filterParams.transmission_type = filters.transmission;
    }
    if (filters.propulsion) {
      filterParams.propulsion = filters.propulsion;
    }
    if (filters.fuelType) {
      filterParams.fuel_type = filters.fuelType;
    }
    if (filters.condition) {
      filterParams.condition = filters.condition;
    }
    if (filters.carType) {
      filterParams.car_type = filters.carType;
    }
    if (filters.isVerified !== null) {
      filterParams.is_verified = filters.isVerified ? "true" : "false";
    }
    return Object.fromEntries(
      Object.entries(filterParams).filter(
        ([_, v]) => v !== undefined && v !== ""
      )
    ) as CarFilters;
  }, [
    filters,
    query,
    brands,
    models,
    mapLocationToBackend,
    debouncedMinYom,
    debouncedMaxYom,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  // Fetch cars
  const fetchCars = useCallback(
    async (page: number, filters: CarFilters) => {
      const yomError = validateYears();
      const priceError = validatePrices();
      if (yomError) {
        setYomError(yomError);
        setPriceError(null);
        return;
      }
      if (priceError) {
        setPriceError(priceError);
        setYomError(null);
        return;
      }
      setYomError(null);
      setPriceError(null);
      setIsLoading(true);
      try {
        await dispatch(fetchAllCars({ page, perPage, filters })).unwrap();
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch cars"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, perPage, validateYears, validatePrices]
  );

  // Sync states with URL params
  useEffect(() => {
    const params: Record<string, string | undefined> = Object.fromEntries(
      searchParams.entries()
    );
    setFilters((prev) => ({
      ...prev,
      listingType: (["sale", "hire", "auction"] as const).includes(
        params.listing_type as any
      )
        ? params.listing_type === "hire"
          ? "hire"
          : (params.listing_type as "sale" | "hire" | "auction")
        : "",
      searchBy: (["name", "model", "year", "registration"] as const).includes(
        params.search_by as any
      )
        ? (params.search_by as "name" | "model" | "year" | "registration")
        : "name",
      queryInput: params.query || "",
      location: (
        [
          "Available in Kenya",
          "Direct Import/International Stock",
          "Both",
          "",
        ] as const
      ).includes(params.location as any)
        ? (params.location as
            | "Available in Kenya"
            | "Direct Import/International Stock"
            | "Both"
            | "")
        : "",
      minYom: params.min_yom || "",
      maxYom: params.max_yom || "",
      minPrice: params.min_price || "",
      maxPrice: params.max_price || "",
      currency: (["All Currencies", "USD", "KES"] as const).includes(
        params.currency as any
      )
        ? (params.currency as "All Currencies" | "USD" | "KES")
        : "All Currencies",
      brand: params.brand_id
        ? brands.find((b) => b.id === Number(params.brand_id))?.name || null
        : null,
      model: params.model_id
        ? models.find((m) => m.id === Number(params.model_id))?.name || null
        : null,
      transmission: (["Automatic", "Manual"] as const).includes(
        params.transmission_type as any
      )
        ? (params.transmission_type as "Automatic" | "Manual")
        : "",
      propulsion: (["Gas", "Electric", "Hybrid"] as const).includes(
        params.propulsion as any
      )
        ? (params.propulsion as "Gas" | "Electric" | "Hybrid")
        : "",
      fuelType: (["Petrol", "Diesel"] as const).includes(
        params.fuel_type as any
      )
        ? (params.fuel_type as "Petrol" | "Diesel")
        : "",
      condition: (
        ["Brand New", "Foreign Used", "Locally Used"] as const
      ).includes(params.condition as any)
        ? (params.condition as "Brand New" | "Foreign Used" | "Locally Used")
        : "",
      carType: (
        [
          "Sedan",
          "SUV",
          "Truck",
          "Coupe",
          "Convertible",
          "Van",
          "Hatchback",
        ] as const
      ).includes(params.car_type as any)
        ? (params.car_type as
            | "Sedan"
            | "SUV"
            | "Truck"
            | "Coupe"
            | "Convertible"
            | "Van"
            | "Hatchback")
        : "",
      isVerified:
        params.is_verified === "true"
          ? true
          : params.is_verified === "false"
          ? false
          : null,
    }));
    setCurrentPage(parseInt(params.page || "1", 10) || 1);
  }, [searchParams, brands, models]);

  // Update URL params on filter change
  useEffect(() => {
    const newParams: Record<string, string> = {
      is_published: "true",
      page: String(currentPage),
    };
    if (query && filters.searchBy) {
      newParams.query = query;
      newParams.search_by = filters.searchBy;
    }
    if (filters.listingType) {
      newParams.listing_type =
        filters.listingType === "hire" ? "hire" : filters.listingType;
    }
    if (filters.location && filters.location !== "Both") {
      newParams.location = mapLocationToBackend(filters.location) || "";
    }
    if (debouncedMinYom) {
      newParams.min_yom = debouncedMinYom;
    }
    if (debouncedMaxYom) {
      newParams.max_yom = debouncedMaxYom;
    }
    if (debouncedMinPrice) {
      newParams.min_price = debouncedMinPrice;
    }
    if (debouncedMaxPrice) {
      newParams.max_price = debouncedMaxPrice;
    }
    if (filters.currency !== "All Currencies") {
      newParams.currency = filters.currency;
    }
    if (filters.brand) {
      const brandId = brands.find((b) => b.name === filters.brand)?.id;
      if (brandId) newParams.brand_id = String(brandId);
    }
    if (filters.model) {
      const modelId = models.find((m) => m.name === filters.model)?.id;
      if (modelId) newParams.model_id = String(modelId);
    }
    if (filters.transmission) {
      newParams.transmission_type = filters.transmission;
    }
    if (filters.propulsion) {
      newParams.propulsion = filters.propulsion;
    }
    if (filters.fuelType) {
      newParams.fuel_type = filters.fuelType;
    }
    if (filters.condition) {
      newParams.condition = filters.condition;
    }
    if (filters.carType) {
      newParams.car_type = filters.carType;
    }
    if (filters.isVerified !== null) {
      newParams.is_verified = filters.isVerified ? "true" : "false";
    }
    setSearchParams(newParams, { replace: true });
  }, [
    filters,
    query,
    currentPage,
    brands,
    models,
    setSearchParams,
    mapLocationToBackend,
    debouncedMinYom,
    debouncedMaxYom,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  // Fetch brands
  useEffect(() => {
    fetch("https://admin.motiisasa.co.ke/api/car/brands", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(
        (response: { status: string; data?: Brand[]; message?: string }) => {
          if (response.status === "success" && response.data) {
            setBrands(response.data);
          } else {
            throw new Error(response.message || "Failed to fetch brands");
          }
        }
      )
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load brands"
        );
      });
  }, []);

  // Fetch models
  useEffect(() => {
    if (!filters.brand) {
      setModels([]);
      setFilters((prev) => ({ ...prev, model: null }));
      return;
    }
    const selectedBrand = brands.find((b) => b.name === filters.brand);
    if (!selectedBrand) {
      setModels([]);
      setFilters((prev) => ({ ...prev, model: null }));
      return;
    }
    fetch(
      `https://admin.motiisasa.co.ke/api/car/brands/${selectedBrand.id}/models`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then(
        (response: { status: string; data?: CarModel[]; message?: string }) => {
          if (response.status === "success" && response.data) {
            setModels(response.data);
          } else {
            throw new Error(response.message || "Failed to fetch models");
          }
        }
      )
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load models"
        );
      });
  }, [filters.brand, brands]);

  // Fetch favorites
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      setFavoriteCarIds([]);
      return;
    }
    const params = new URLSearchParams({ page: "1", per_page: "20" });
    fetch(`https://admin.motiisasa.co.ke/api/car/favorites?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(
        (response: {
          status: string;
          data?: { cars: Car[] };
          message?: string;
        }) => {
          if (response.status === "success" && response.data?.cars) {
            setFavoriteCarIds(response.data.cars.map((car) => car.id));
          } else {
            throw new Error(response.message || "Failed to fetch favorites");
          }
        }
      )
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load favorites"
        );
      });
  }, [token]);

  // Fetch cars on initial load
  useEffect(() => {
    if (isInitialLoad) {
      const initialFilters: CarFilters = { is_published: "true" };
      // Explicitly type params as a record of strings or undefined
      const params: Record<string, string | undefined> = Object.fromEntries(
        searchParams.entries()
      );

      if (params.listing_type) {
        initialFilters.listing_type = (
          ["sale", "hire", "auction"] as const
        ).includes(params.listing_type as any)
          ? params.listing_type === "hire"
            ? "hire"
            : (params.listing_type as "sale" | "hire" | "auction")
          : undefined;
      }
      if (params.search_by && params.query) {
        initialFilters.search_by = (
          ["name", "model", "year", "registration"] as const
        ).includes(params.search_by as any)
          ? (params.search_by as "name" | "model" | "year" | "registration")
          : undefined;
        initialFilters.query = params.query;
      }
      if (params.location && params.location !== "Both") {
        initialFilters.location = mapLocationToBackend(params.location as any);
      }
      if (params.min_yom) {
        const minYom = parseInt(params.min_yom, 10);
        if (!isNaN(minYom)) {
          initialFilters.min_yom = minYom;
        }
      }
      if (params.max_yom) {
        const maxYom = parseInt(params.max_yom, 10);
        if (!isNaN(maxYom)) {
          initialFilters.max_yom = maxYom;
        }
      }
      if (params.min_price) {
        const minPrice = parseFloat(params.min_price);
        if (!isNaN(minPrice)) {
          initialFilters.min_price = minPrice;
        }
      }
      if (params.max_price) {
        const maxPrice = parseFloat(params.max_price);
        if (!isNaN(maxPrice)) {
          initialFilters.max_price = maxPrice;
        }
      }
      if (params.currency && ["USD", "KES"].includes(params.currency)) {
        initialFilters.currency = params.currency as "USD" | "KES";
      }
      if (params.brand_id) {
        const brandId = parseInt(params.brand_id, 10);
        if (!isNaN(brandId)) {
          initialFilters.brand_id = brandId;
        }
      }
      if (params.model_id) {
        const modelId = parseInt(params.model_id, 10);
        if (!isNaN(modelId)) {
          initialFilters.model_id = modelId;
        }
      }
      if (params.transmission_type) {
        initialFilters.transmission_type = (
          ["Automatic", "Manual"] as const
        ).includes(params.transmission_type as any)
          ? (params.transmission_type as "Automatic" | "Manual")
          : undefined;
      }
      if (params.propulsion) {
        initialFilters.propulsion = (
          ["Gas", "Electric", "Hybrid"] as const
        ).includes(params.propulsion as any)
          ? (params.propulsion as "Gas" | "Electric" | "Hybrid")
          : undefined;
      }
      if (params.fuel_type) {
        initialFilters.fuel_type = (["Petrol", "Diesel"] as const).includes(
          params.fuel_type as any
        )
          ? (params.fuel_type as "Petrol" | "Diesel")
          : undefined;
      }
      if (params.condition) {
        initialFilters.condition = (
          ["Brand New", "Foreign Used", "Locally Used"] as const
        ).includes(params.condition as any)
          ? (params.condition as "Brand New" | "Foreign Used" | "Locally Used")
          : undefined;
      }
      if (params.car_type) {
        initialFilters.car_type = (
          [
            "Sedan",
            "SUV",
            "Truck",
            "Coupe",
            "Convertible",
            "Van",
            "Hatchback",
          ] as const
        ).includes(params.car_type as any)
          ? (params.car_type as
              | "Sedan"
              | "SUV"
              | "Truck"
              | "Coupe"
              | "Convertible"
              | "Van"
              | "Hatchback")
          : undefined;
      }
      if (params.is_verified) {
        initialFilters.is_verified = params.is_verified as "true" | "false";
      }
      fetchCars(1, initialFilters);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, fetchCars, searchParams, mapLocationToBackend]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(
    async (carId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!token) {
        toast.error("Please log in to favorite cars");
        navigate("/authentication");
        return;
      }
      const isFavorited = favoriteCarIds.includes(carId);
      try {
        const response = await fetch(
          `https://admin.motiisasa.co.ke/api/car/favorites/${carId}`,
          {
            method: isFavorited ? "DELETE" : "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: isFavorited ? undefined : JSON.stringify({}),
          }
        );
        const responseData: { status: string; message?: string } =
          await response.json();
        if (responseData.status === "success") {
          setFavoriteCarIds((prev) =>
            isFavorited ? prev.filter((id) => id !== carId) : [...prev, carId]
          );
          toast.success(
            `Car ${isFavorited ? "removed from" : "added to"} favorites`
          );
        } else {
          throw new Error(responseData.message || "Failed to update favorites");
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update favorites"
        );
      }
    },
    [token, favoriteCarIds, navigate]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    const yomError = validateYears();
    const priceError = validatePrices();
    if (yomError) {
      setYomError(yomError);
      setPriceError(null);
      return;
    }
    if (priceError) {
      setPriceError(priceError);
      setYomError(null);
      return;
    }
    setYomError(null);
    setPriceError(null);
    setCurrentPage(1);
    const newParams: Record<string, string> = {
      is_published: "true",
      page: "1",
    };
    if (query && filters.searchBy) {
      newParams.query = query;
      newParams.search_by = filters.searchBy;
    }
    if (filters.listingType) {
      newParams.listing_type =
        filters.listingType === "hire" ? "hire" : filters.listingType;
    }
    if (filters.location && filters.location !== "Both") {
      newParams.location = mapLocationToBackend(filters.location) || "";
    }
    if (debouncedMinYom) {
      newParams.min_yom = debouncedMinYom;
    }
    if (debouncedMaxYom) {
      newParams.max_yom = debouncedMaxYom;
    }
    if (debouncedMinPrice) {
      newParams.min_price = debouncedMinPrice;
    }
    if (debouncedMaxPrice) {
      newParams.max_price = debouncedMaxPrice;
    }
    if (filters.currency !== "All Currencies") {
      newParams.currency = filters.currency;
    }
    if (filters.brand) {
      const brandId = brands.find((b) => b.name === filters.brand)?.id;
      if (brandId) newParams.brand_id = String(brandId);
    }
    if (filters.model) {
      const modelId = models.find((m) => m.name === filters.model)?.id;
      if (modelId) newParams.model_id = String(modelId);
    }
    if (filters.transmission) {
      newParams.transmission_type = filters.transmission;
    }
    if (filters.propulsion) {
      newParams.propulsion = filters.propulsion;
    }
    if (filters.fuelType) {
      newParams.fuel_type = filters.fuelType;
    }
    if (filters.condition) {
      newParams.condition = filters.condition;
    }
    if (filters.carType) {
      newParams.car_type = filters.carType;
    }
    if (filters.isVerified !== null) {
      newParams.is_verified = filters.isVerified ? "true" : "false";
    }
    setSearchParams(newParams, { replace: true });
    setIsFilterOpen(false);
    fetchCars(1, carFilters);
  }, [
    query,
    filters,
    brands,
    models,
    setSearchParams,
    fetchCars,
    carFilters,
    mapLocationToBackend,
    validateYears,
    validatePrices,
    debouncedMinYom,
    debouncedMaxYom,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  // Input change handlers
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, queryInput: e.target.value }));
    },
    []
  );

  const handleMinPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilters((prev) => ({ ...prev, minPrice: value }));
    },
    []
  );

  const handleMaxPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilters((prev) => ({ ...prev, maxPrice: value }));
    },
    []
  );

  const handleMinYomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilters((prev) => ({ ...prev, minYom: value }));
    },
    []
  );

  const handleMaxYomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFilters((prev) => ({ ...prev, maxYom: value }));
    },
    []
  );

  // Render car card
  const renderCarCard = useCallback(
    (car: Car) => {
      const featuresArr: string[] = Array.isArray(car.features)
        ? car.features.filter((f: string) => !!f)
        : [];
      const displayedFeatures = featuresArr.slice(0, 3);
      const isFavorited = favoriteCarIds.includes(car.id);

      return (
        <Link
          to={`/cardetails?id=${car.id}`}
          key={car.id}
          className="transform transition-transform hover:scale-105"
        >
          <div className="border border-[#262162] rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl bg-white">
            <div className="relative w-full h-48">
              <img
                src={car.images?.[0] || "/placeholder.png"}
                alt={
                  car.registration_number ||
                  `${car.brand || "Car"} ${car.model || "Model"}`
                }
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
              <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {car.status || "Available"}
              </span>
              <button
                onClick={(e) => handleFavoriteToggle(car.id, e)}
                className="absolute top-2 left-2 text-2xl"
                title={
                  isFavorited ? "Remove from Favorites" : "Add to Favorites"
                }
              >
                <FaHeart
                  className={isFavorited ? "text-red-500" : "text-gray-400"}
                />
              </button>
            </div>
            <div className="bg-gray-50 p-3 flex items-center gap-2">
              <img
                src={
                  car.user?.showroom_corporate?.logo_url ||
                  car.user?.profile_photo ||
                  "/placeholder.png"
                }
                alt={
                  car.user?.showroom_corporate?.name || car.user?.name || "User"
                }
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">
                  {car.user?.showroom_corporate?.name ||
                    car.user?.name ||
                    "Unknown"}
                </h3>
                {car.user?.is_verified && (
                  <span className="text-green-600 text-xs flex items-center">
                    ✔ Verified Dealer
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-[#262162]">
                {car.brand || "Unknown"} {car.model || "Model"}{" "}
                <span className="text-gray-500 text-sm">
                  ({car.year_of_manufacture || "N/A"})
                </span>
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {displayedFeatures.length > 0 ? (
                  displayedFeatures.map((feature: string, idx: number) => (
                    <span
                      key={`${car.id}-feature-${idx}`}
                      className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full whitespace-nowrap"
                    >
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full whitespace-nowrap">
                    No features
                  </span>
                )}
                {featuresArr.length > 3 && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full whitespace-nowrap">
                    ...
                  </span>
                )}
              </div>
              <p className="text-[#262162] mt-3 text-sm truncate">
                {car.registration_number || "N/A"}
              </p>
              <p className="text-[#262162] mt-1 text-sm">
                {car.transmission_type || "N/A"} | {car.propulsion || "N/A"} |{" "}
                {car.fuel_type || "N/A"} | {car.condition || "N/A"}
              </p>
              <p className="text-[#262162] mt-1 text-sm">
                Accel: {car.acceleration || "N/A"} | Cons:{" "}
                {car.consumption_rate || "N/A"}
              </p>
              {car.listing_type === "auction" && car.highest_bid && (
                <p className="text-[#262162] mt-1 text-sm">
                  Highest Bid: {formatPrice(car.highest_bid, car.currency)}
                </p>
              )}
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-blue-600 font-semibold text-lg">
                {formatPrice(car.asking_price, car.currency)}
              </span>
              <span className="bg-[#f26624] text-white px-4 py-2 text-sm rounded-full hover:bg-[#262162] transition cursor-pointer">
                View Details
              </span>
            </div>
          </div>
        </Link>
      );
    },
    [favoriteCarIds, handleFavoriteToggle]
  );

  // Loading state
  if (isInitialLoad || isLoading || status === "loading") {
    return (
      <Layout>
        <div className="flex justify-center items-center mt-14 h-64">
          <div className="w-16 h-16 border-t-4 border-[#f26624] border-dashed rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="text-red-500 text-center py-12">
          <p>Error: {error || "Failed to fetch cars"}</p>
          <button
            className="mt-4 bg-[#f26624] text-white px-4 py-2 rounded-full hover:bg-[#262162] transition"
            onClick={() => fetchCars(currentPage, carFilters)}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const displayCars = allCars || [];
  const displayPagination = pagination || {
    page: 1,
    pages: 1,
    total: 0,
    per_page: perPage,
  };

  return (
    <Layout>
      <main className="pt-24 px-4 sm:px-6 md:px-16 lg:px-24 mt-14 py-12 overflow-x-hidden">
        <div className="lg:hidden mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#262162] animate-fade-in">
              Browse Cars
            </h1>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center bg-[#f26624] text-white px-4 py-2 rounded-full hover:bg-[#262162] transition text-sm"
            >
              <FaFilter className="mr-2" />
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          <p className="text-[#f26624] mb-4">
            Vehicles showing ({displayPagination.total || displayCars.length})
          </p>
          {isFilterOpen && (
            <>
              <QuickSearchSection
                searchBy={filters.searchBy}
                setSearchBy={(value) =>
                  setFilters((prev) => ({ ...prev, searchBy: value }))
                }
                queryInput={filters.queryInput}
                handleQueryChange={handleQueryChange}
                minPrice={filters.minPrice}
                handleMinPriceChange={handleMinPriceChange}
                maxPrice={filters.maxPrice}
                handleMaxPriceChange={handleMaxPriceChange}
                minYom={filters.minYom}
                handleMinYomChange={handleMinYomChange}
                maxYom={filters.maxYom}
                handleMaxYomChange={handleMaxYomChange}
                minPriceRange={minPriceRange}
                maxPriceRange={maxPriceRange}
                minYearRange={minYearRange}
                maxYearRange={maxYearRange}
                setQueryInput={(value) =>
                  setFilters((prev) => ({ ...prev, queryInput: value }))
                }
                setMinPrice={(value) =>
                  setFilters((prev) => ({ ...prev, minPrice: value }))
                }
                setMaxPrice={(value) =>
                  setFilters((prev) => ({ ...prev, maxPrice: value }))
                }
                setMinYom={(value) =>
                  setFilters((prev) => ({ ...prev, minYom: value }))
                }
                setMaxYom={(value) =>
                  setFilters((prev) => ({ ...prev, maxYom: value }))
                }
                yomError={yomError}
                priceError={priceError}
                setPriceError={setPriceError}
              />
              <AdvancedFilterSection
                listingType={filters.listingType}
                setListingType={(value) =>
                  setFilters((prev) => ({ ...prev, listingType: value }))
                }
                brand={filters.brand}
                setBrand={(value) =>
                  setFilters((prev) => ({ ...prev, brand: value }))
                }
                model={filters.model}
                setModel={(value) =>
                  setFilters((prev) => ({ ...prev, model: value }))
                }
                location={filters.location}
                setLocation={(value) =>
                  setFilters((prev) => ({ ...prev, location: value }))
                }
                currency={filters.currency}
                setCurrency={(value) =>
                  setFilters((prev) => ({ ...prev, currency: value }))
                }
                transmission={filters.transmission}
                setTransmission={(value) =>
                  setFilters((prev) => ({ ...prev, transmission: value }))
                }
                propulsion={filters.propulsion}
                setPropulsion={(value) =>
                  setFilters((prev) => ({ ...prev, propulsion: value }))
                }
                fuelType={filters.fuelType}
                setFuelType={(value) =>
                  setFilters((prev) => ({ ...prev, fuelType: value }))
                }
                condition={filters.condition}
                setCondition={(value) =>
                  setFilters((prev) => ({ ...prev, condition: value }))
                }
                carType={filters.carType}
                setCarType={(value) =>
                  setFilters((prev) => ({ ...prev, carType: value }))
                }
                isVerified={filters.isVerified}
                setIsVerified={(value) =>
                  setFilters((prev) => ({ ...prev, isVerified: value }))
                }
                brands={brands}
                models={models}
                handleSearch={handleSearch}
                fetchCars={fetchCars}
              />
            </>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <section className="w-full">
              <div className="lg:block hidden">
                <h1 className="text-3xl md:text-4xl font-bold text-[#262162]">
                  Browse Cars
                </h1>
                <p className="text-[#f26624] mt-2">
                  Vehicles showing (
                  {displayPagination.total || displayCars.length})
                </p>
              </div>
              <div className="mt-6">
                {displayCars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-2xl font-semibold text-gray-600">
                      No Cars Available
                    </p>
                    <p className="text-sm text-gray-500">
                      Try adjusting your filters or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayCars.map((car) => renderCarCard(car))}
                  </div>
                )}
              </div>
              {displayPagination.pages > 0 && (
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() => {
                      const newPage = Math.max(currentPage - 1, 1);
                      setCurrentPage(newPage);
                      fetchCars(newPage, carFilters);
                    }}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border border-[#262162] rounded-lg text-[#262162] transition text-sm ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#f26624] hover:text-white"
                    }`}
                  >
                    Prev
                  </button>
                  <span className="mx-2 text-sm text-gray-700">
                    Page {currentPage} of {displayPagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = Math.min(
                        currentPage + 1,
                        displayPagination.pages
                      );
                      setCurrentPage(newPage);
                      fetchCars(newPage, carFilters);
                    }}
                    disabled={currentPage === displayPagination.pages}
                    className={`px-4 py-2 border border-[#262162] rounded-lg text-[#262162] transition text-sm ${
                      currentPage === displayPagination.pages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#f26624] hover:text-white"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>
          <div className="hidden lg:block lg:col-span-3">
            <QuickSearchSection
              searchBy={filters.searchBy}
              setSearchBy={(value) =>
                setFilters((prev) => ({ ...prev, searchBy: value }))
              }
              queryInput={filters.queryInput}
              handleQueryChange={handleQueryChange}
              minPrice={filters.minPrice}
              handleMinPriceChange={handleMinPriceChange}
              maxPrice={filters.maxPrice}
              handleMaxPriceChange={handleMaxPriceChange}
              minYom={filters.minYom}
              handleMinYomChange={handleMinYomChange}
              maxYom={filters.maxYom}
              handleMaxYomChange={handleMaxYomChange}
              minPriceRange={minPriceRange}
              maxPriceRange={maxPriceRange}
              minYearRange={minYearRange}
              maxYearRange={maxYearRange}
              setQueryInput={(value) =>
                setFilters((prev) => ({ ...prev, queryInput: value }))
              }
              setMinPrice={(value) =>
                setFilters((prev) => ({ ...prev, minPrice: value }))
              }
              setMaxPrice={(value) =>
                setFilters((prev) => ({ ...prev, maxPrice: value }))
              }
              setMinYom={(value) =>
                setFilters((prev) => ({ ...prev, minYom: value }))
              }
              setMaxYom={(value) =>
                setFilters((prev) => ({ ...prev, maxYom: value }))
              }
              yomError={yomError}
              priceError={priceError}
              setPriceError={setPriceError}
            />
            <AdvancedFilterSection
              listingType={filters.listingType}
              setListingType={(value) =>
                setFilters((prev) => ({ ...prev, listingType: value }))
              }
              brand={filters.brand}
              setBrand={(value) =>
                setFilters((prev) => ({ ...prev, brand: value }))
              }
              model={filters.model}
              setModel={(value) =>
                setFilters((prev) => ({ ...prev, model: value }))
              }
              location={filters.location}
              setLocation={(value) =>
                setFilters((prev) => ({ ...prev, location: value }))
              }
              currency={filters.currency}
              setCurrency={(value) =>
                setFilters((prev) => ({ ...prev, currency: value }))
              }
              transmission={filters.transmission}
              setTransmission={(value) =>
                setFilters((prev) => ({ ...prev, transmission: value }))
              }
              propulsion={filters.propulsion}
              setPropulsion={(value) =>
                setFilters((prev) => ({ ...prev, propulsion: value }))
              }
              fuelType={filters.fuelType}
              setFuelType={(value) =>
                setFilters((prev) => ({ ...prev, fuelType: value }))
              }
              condition={filters.condition}
              setCondition={(value) =>
                setFilters((prev) => ({ ...prev, condition: value }))
              }
              carType={filters.carType}
              setCarType={(value) =>
                setFilters((prev) => ({ ...prev, carType: value }))
              }
              isVerified={filters.isVerified}
              setIsVerified={(value) =>
                setFilters((prev) => ({ ...prev, isVerified: value }))
              }
              brands={brands}
              models={models}
              handleSearch={handleSearch}
              fetchCars={fetchCars}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Cars;
