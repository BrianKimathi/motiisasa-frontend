import { useState, useEffect, useCallback, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchAllCars } from "../redux/carsSlice";
import type { CarFilters, Brand, CarModel } from "../types/types";

export default function Search() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { error } = useSelector((state: RootState) => state.cars);
  const fetchError = error.allCars;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<"name" | "model" | "year">("name");
  const [listingType, setListingType] = useState<
    "sale" | "hire" | "auction" | ""
  >("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    "Available in Kenya" | "Direct Import/International Stock" | "Both" | ""
  >("");
  const [minYom, setMinYom] = useState("");
  const [maxYom, setMaxYom] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currency, setCurrency] = useState<"All Currencies" | "USD" | "KES">(
    "All Currencies"
  );
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [transmission, setTransmission] = useState<"Automatic" | "Manual" | "">(
    ""
  );
  const [propulsion, setPropulsion] = useState<
    "Gas" | "Electric" | "Hybrid" | ""
  >("");
  const [fuelType, setFuelType] = useState<"Petrol" | "Diesel" | "">("");
  const [condition, setCondition] = useState<
    "Brand New" | "Foreign Used" | "Locally Used" | ""
  >("");
  const [carType, setCarType] = useState<
    | "Sedan"
    | "SUV"
    | "Truck"
    | "Coupe"
    | "Convertible"
    | "Van"
    | "Hatchback"
    | ""
  >("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minYomInputRef = useRef<HTMLInputElement>(null);
  const maxYomInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);

  const budgetRanges = [
    "0 - 500K",
    "500K - 1M",
    "1M - 2M",
    "2M - 3M",
    "3M - 5M",
    "5M - 10M",
    "Above 10M",
  ] as const;
  const vehicleLocations = [
    "Available in Kenya",
    "Direct Import/International Stock",
    "Both",
    "",
  ] as const;
  const currencies = ["All Currencies", "USD", "KES"] as const;
  const searchTabs = ["name", "model", "year"] as const;
  const listingTypes = ["sale", "hire", "auction"] as const;
  const transmissionTypes = ["Automatic", "Manual"] as const;
  const propulsionTypes = ["Gas", "Electric", "Hybrid"] as const;
  const fuelTypeOptions = ["Petrol", "Diesel"] as const;
  const conditionTypes = ["Brand New", "Foreign Used", "Locally Used"] as const;
  const carTypes = [
    "Sedan",
    "SUV",
    "Truck",
    "Coupe",
    "Convertible",
    "Van",
    "Hatchback",
  ] as const;

  // Map UI location to backend location
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

  // Map backend location to UI location
  const mapBackendToLocation = useCallback(
    (
      location: string | null
    ):
      | "Available in Kenya"
      | "Direct Import/International Stock"
      | "Both"
      | "" => {
      switch (location) {
        case "Kenya":
          return "Available in Kenya";
        case "International":
          return "Direct Import/International Stock";
        case "Both":
          return "Both";
        default:
          return "";
      }
    },
    []
  );

  // Map budget to min_price and max_price
  const mapBudgetToPriceRange = useCallback(
    (budget: string | null): { min_price?: number; max_price?: number } => {
      if (!budget) return {};
      switch (budget) {
        case "0 - 500K":
          return { min_price: 0, max_price: 500000 };
        case "500K - 1M":
          return { min_price: 500000, max_price: 1000000 };
        case "1M - 2M":
          return { min_price: 1000000, max_price: 2000000 };
        case "2M - 3M":
          return { min_price: 2000000, max_price: 3000000 };
        case "3M - 5M":
          return { min_price: 3000000, max_price: 5000000 };
        case "5M - 10M":
          return { min_price: 5000000, max_price: 10000000 };
        case "Above 10M":
          return { min_price: 10000000 };
        default:
          return {};
      }
    },
    []
  );

  // Fetch brands on mount
  useEffect(() => {
    fetch("https://admin.motiisasa.co.ke/api/car/brands", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response: Response) => response.json())
      .then(
        (response: { status: string; data?: Brand[]; message?: string }) => {
          if (response.status === "success" && Array.isArray(response.data)) {
            setBrands(response.data);
          } else {
            setBrands([]);
            toast.error(response.message || "Failed to load brands");
          }
        }
      )
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load brands";
        toast.error(errorMessage);
      });
  }, []);

  // Fetch models when brandId changes
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId(null);
      return;
    }
    fetch(`https://admin.motiisasa.co.ke/api/car/brands/${brandId}/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response: Response) => response.json())
      .then(
        (response: { status: string; data?: CarModel[]; message?: string }) => {
          if (response.status === "success" && response.data) {
            setModels(response.data);
          } else {
            setModels([]);
            toast.error(response.message || "Failed to load models");
          }
        }
      )
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load models";
        toast.error(errorMessage);
      });
  }, [brandId]);

  // Fetch suggestions when searchQuery changes (debounced)
  const debouncedFetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query || !["name", "model"].includes(activeTab)) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const response = await fetch(
          `https://admin.motiisasa.co.ke/api/car/suggestions?query=${encodeURIComponent(
            query
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const responseData: {
          status: string;
          data?: string[];
          message?: string;
        } = await response.json();
        if (responseData.status === "success" && responseData.data) {
          setSuggestions(responseData.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          toast.error(responseData.message || "Failed to fetch suggestions");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch suggestions";
        setSuggestions([]);
        setShowSuggestions(false);
        toast.error(errorMessage);
      }
    }, 300),
    [activeTab]
  );

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchQuery, debouncedFetchSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync state with searchParams
  useEffect(() => {
    setListingType(
      (searchParams.get("listing_type") as "sale" | "hire" | "auction" | "") ||
        ""
    );
    setSearchQuery(searchParams.get("query") || "");
    setActiveTab(
      (searchParams.get("search_by") as "name" | "model" | "year") || "name"
    );
    setSelectedBudget(searchParams.get("budget") || null);
    setSelectedLocation(mapBackendToLocation(searchParams.get("location")));
    setMinYom(searchParams.get("min_yom") || "");
    setMaxYom(searchParams.get("max_yom") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setCurrency(
      (searchParams.get("currency") as "All Currencies" | "USD" | "KES") ||
        "All Currencies"
    );
    setBrandId(
      searchParams.get("brand_id")
        ? parseInt(searchParams.get("brand_id")!)
        : null
    );
    setModelId(
      searchParams.get("model_id")
        ? parseInt(searchParams.get("model_id")!)
        : null
    );
    setTransmission(
      (searchParams.get("transmission_type") as "Automatic" | "Manual" | "") ||
        ""
    );
    setPropulsion(
      (searchParams.get("propulsion") as "Gas" | "Electric" | "Hybrid" | "") ||
        ""
    );
    setFuelType(
      (searchParams.get("fuel_type") as "Petrol" | "Diesel" | "") || ""
    );
    setCondition(
      (searchParams.get("condition") as
        | "Brand New"
        | "Foreign Used"
        | "Locally Used"
        | "") || ""
    );
    setCarType(
      (searchParams.get("car_type") as
        | "Sedan"
        | "SUV"
        | "Truck"
        | "Coupe"
        | "Convertible"
        | "Van"
        | "Hatchback"
        | "") || ""
    );
    setIsInitialLoad(false);
  }, [searchParams, mapBackendToLocation]);

  // Input change handlers with focus preservation
  const handleMinPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
        setMinPrice(value);
        activeInputRef.current = minPriceInputRef.current;
        setTimeout(() => activeInputRef.current?.focus(), 0);
      }
    },
    []
  );

  const handleMaxPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
        setMaxPrice(value);
        activeInputRef.current = maxPriceInputRef.current;
        setTimeout(() => activeInputRef.current?.focus(), 0);
      }
    },
    []
  );

  const handleMinYomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const currentYear = new Date().getFullYear();
      if (
        value === "" ||
        (Number(value) >= 1900 &&
          Number(value) <= currentYear &&
          !isNaN(Number(value)))
      ) {
        setMinYom(value);
        activeInputRef.current = minYomInputRef.current;
        setTimeout(() => activeInputRef.current?.focus(), 0);
      }
    },
    []
  );

  const handleMaxYomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const currentYear = new Date().getFullYear();
      if (
        value === "" ||
        (Number(value) >= 1900 &&
          Number(value) <= currentYear &&
          !isNaN(Number(value)))
      ) {
        setMaxYom(value);
        activeInputRef.current = maxYomInputRef.current;
        setTimeout(() => activeInputRef.current?.focus(), 0);
      }
    },
    []
  );

  // Get filters
  const getFilters = useCallback(
    (isSearchOnly: boolean = false): CarFilters => {
      const filters: CarFilters = {
        is_published: "true",
      };

      if (searchQuery || isSearchOnly) {
        filters.query = searchQuery || undefined;
        filters.search_by = activeTab !== "name" ? activeTab : undefined;
      }

      if (!isSearchOnly) {
        if (listingType) {
          filters.listing_type = listingType;
        }
        if (selectedLocation && selectedLocation !== "Both") {
          filters.location = mapLocationToBackend(selectedLocation);
        }
        if (minYom && !isNaN(parseInt(minYom))) {
          filters.min_yom = parseInt(minYom);
        }
        if (maxYom && !isNaN(parseInt(maxYom))) {
          filters.max_yom = parseInt(maxYom);
        }
        if (minPrice && !isNaN(parseFloat(minPrice))) {
          filters.min_price = parseFloat(minPrice);
        }
        if (maxPrice && !isNaN(parseFloat(maxPrice))) {
          filters.max_price = parseFloat(maxPrice);
        }
        if (selectedBudget) {
          filters.budget = selectedBudget;
          const priceRange = mapBudgetToPriceRange(selectedBudget);
          if (priceRange.min_price) filters.min_price = priceRange.min_price;
          if (priceRange.max_price) filters.max_price = priceRange.max_price;
        }
        if (currency !== "All Currencies") {
          filters.currency = currency as "KES" | "USD";
        }
        if (brandId) {
          filters.brand_id = brandId;
        }
        if (modelId) {
          filters.model_id = modelId;
        }
        if (transmission) {
          filters.transmission_type = transmission;
        }
        if (propulsion) {
          filters.propulsion = propulsion;
        }
        if (fuelType) {
          filters.fuel_type = fuelType;
        }
        if (condition) {
          filters.condition = condition;
        }
        if (carType) {
          filters.car_type = carType;
        }
      }

      return Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      ) as CarFilters;
    },
    [
      searchQuery,
      activeTab,
      listingType,
      selectedLocation,
      minYom,
      maxYom,
      minPrice,
      maxPrice,
      selectedBudget,
      currency,
      brandId,
      modelId,
      transmission,
      propulsion,
      fuelType,
      condition,
      carType,
      mapLocationToBackend,
      mapBudgetToPriceRange,
    ]
  );

  // Trigger search and navigate to /cars
  const handleSearch = useCallback(() => {
    setShowSuggestions(false);
    const filters = getFilters(false);
    dispatch(fetchAllCars({ page: 1, perPage: 9, filters }));
    const queryParams = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, String(value)])
      )
    );
    queryParams.set("page", "1");
    setSearchParams(queryParams, { replace: true });
    navigate(`/cars?${queryParams.toString()}`);
  }, [dispatch, navigate, getFilters, setSearchParams]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      setShowSuggestions(false);
      const filters = getFilters(true);
      dispatch(fetchAllCars({ page: 1, perPage: 9, filters }));
      const queryParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, String(value)])
        )
      );
      queryParams.set("page", "1");
      setSearchParams(queryParams, { replace: true });
      navigate(`/cars?${queryParams.toString()}`);
    },
    [dispatch, navigate, getFilters, setSearchParams]
  );

  // Show loading spinner during initial load
  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-[#f26624] border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="px-6 md:px-16 lg:px-24 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-[#262162]">
        Discover what suits you.
      </h1>
      <p className="text-center text-[#262162] mt-2">
        We help you find the perfect car that matches your style, aspirations,
        and budget!
      </p>

      {fetchError && (
        <div className="text-red-500 text-center mt-4">Error: {fetchError}</div>
      )}

      <div className="flex justify-center mt-6 border-b">
        {searchTabs.map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 text-lg font-medium capitalize ${
              activeTab === tab ? "border-b-2 text-[#262162]" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            Search by {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 relative" ref={suggestionRef}>
        <label className="block text-gray-700 text-lg font-medium mb-2">
          Search vehicle by {activeTab}
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder={
            activeTab === "name"
              ? "e.g. Toyota, Corolla"
              : activeTab === "model"
              ? "e.g. Corolla, X5"
              : "e.g. 2020, 2021"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700">Filter by budget</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-4">
          {budgetRanges.map((range) => (
            <button
              key={range}
              className={`border px-4 py-2 rounded-lg transition ${
                selectedBudget === range
                  ? "bg-[#262162] text-white border-[#262162]"
                  : "border-gray-400 text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() =>
                setSelectedBudget(selectedBudget === range ? null : range)
              }
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          className="text-[#262162] flex items-center gap-2 hover:underline"
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        >
          <FaFilter /> {showAdvancedSearch ? "Hide" : "Show"} Advanced Search
        </button>
      </div>

      {showAdvancedSearch && (
        <div className="mt-6 border p-6 rounded-lg bg-gray-50">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700">Listing Type</h3>
            <div className="flex flex-col gap-2 mt-2">
              {listingTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value={type}
                    checked={listingType === type}
                    onChange={() => setListingType(type)}
                    className="mr-2 accent-[#f26624]"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="listingType"
                  value=""
                  checked={listingType === ""}
                  onChange={() => setListingType("")}
                  className="mr-2 accent-[#f26624]"
                />
                Any
              </label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">Brand</label>
              <select
                value={brandId ?? ""}
                onChange={(e) => {
                  const id = e.target.value ? parseInt(e.target.value) : null;
                  setBrandId(id);
                  setModelId(null);
                }}
                className="border p-3 rounded-lg w-full mt-1 focus:ring-2 focus:ring-[#f26624] transition"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Model</label>
              <select
                value={modelId ?? ""}
                onChange={(e) =>
                  setModelId(e.target.value ? parseInt(e.target.value) : null)
                }
                className="border p-3 rounded-lg w-full mt-1 focus:ring-2 focus:ring-[#f26624] transition"
                disabled={!brandId}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium">Min YOM</label>
              <input
                ref={minYomInputRef}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
                placeholder="e.g., 2015"
                value={minYom}
                onChange={handleMinYomChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Max YOM</label>
              <input
                ref={maxYomInputRef}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
                placeholder="e.g., 2025"
                value={maxYom}
                onChange={handleMaxYomChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium">
                Min Price
              </label>
              <input
                ref={minPriceInputRef}
                type="number"
                min="0"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
                placeholder="Min Price"
                value={minPrice}
                onChange={handleMinPriceChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Max Price
              </label>
              <input
                ref={maxPriceInputRef}
                type="number"
                min="0"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
                placeholder="Max Price"
                value={maxPrice}
                onChange={handleMaxPriceChange}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Currency</label>
            <select
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "All Currencies" | "USD" | "KES")
              }
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">
              Transmission
            </label>
            <select
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
              value={transmission}
              onChange={(e) =>
                setTransmission(e.target.value as "Automatic" | "Manual" | "")
              }
            >
              <option value="">Select</option>
              {transmissionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">
              Propulsion
            </label>
            <select
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
              value={propulsion}
              onChange={(e) =>
                setPropulsion(
                  e.target.value as "Gas" | "Electric" | "Hybrid" | ""
                )
              }
            >
              <option value="">Select</option>
              {propulsionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700">Fuel Type</h3>
            <div className="flex flex-col gap-2 mt-2">
              {fuelTypeOptions.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="fuelType"
                    value={type}
                    checked={fuelType === type}
                    onChange={() => setFuelType(type)}
                    className="mr-2 accent-[#f26624]"
                  />
                  {type}
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="fuelType"
                  value=""
                  checked={fuelType === ""}
                  onChange={() => setFuelType("")}
                  className="mr-2 accent-[#f26624]"
                />
                Any
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Condition</label>
            <select
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
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
            >
              <option value="">Select</option>
              {conditionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Car Type</label>
            <select
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition"
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
            >
              <option value="">Select</option>
              {carTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700">
              Vehicle Location
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {vehicleLocations.map((location) => (
                <button
                  key={location || "None"}
                  className={`border px-4 py-2 rounded-lg transition ${
                    selectedLocation === location
                      ? "bg-[#262162] text-white border-[#262162]"
                      : "border-gray-400 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  {location || "None"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button
          className="flex-1 bg-[#f26624] text-white py-3 text-lg font-medium rounded-lg hover:bg-[#262162] hover:opacity-80 transition"
          onClick={handleSearch}
        >
          Search
        </button>
        <button
          className="flex-1 bg-gray-300 text-gray-700 py-3 text-lg font-medium rounded-lg hover:bg-gray-400 transition"
          onClick={() => {
            setListingType("");
            setSearchQuery("");
            setActiveTab("name");
            setSelectedBudget(null);
            setSelectedLocation("");
            setMinYom("");
            setMaxYom("");
            setMinPrice("");
            setMaxPrice("");
            setCurrency("All Currencies");
            setBrandId(null);
            setModelId(null);
            setTransmission("");
            setPropulsion("");
            setFuelType("");
            setCondition("");
            setCarType("");
            setSearchParams(
              { is_published: "true", page: "1" },
              { replace: true }
            );
            dispatch(
              fetchAllCars({
                page: 1,
                perPage: 9,
                filters: { is_published: "true" },
              })
            );
            navigate("/cars?is_published=true&page=1");
          }}
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}
