import { useState, useEffect, useCallback, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import { carService } from "../services/carService";
import type { AppDispatch, RootState } from "../redux/store";
import type {
  CarFilters,
  Brand,
  CarModel,
  BrandResponse,
  CarModelResponse,
} from "../types/types";
import { fetchAllCars } from "../redux/carsSlice";

export default function Search() {
  const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { error } = useSelector((state: RootState) => state.cars);
  const fetchError = error.allCars; // Select allCars error
  const [activeTab, setActiveTab] = useState<"name" | "model" | "year">("name");
  const [listingType, setListingType] = useState<
    ("sale" | "hire" | "auction")[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    "Available in Kenya" | "Direct Import/International Stock" | "Both"
  >("Both");
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
  const [fuelTypes, setFuelTypes] = useState<("Petrol" | "Diesel")[]>([]);
  const [condition, setCondition] = useState<
    "Brand New" | "Foreign Used" | "Locally Used" | ""
  >("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

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
  ] as const;
  const currencies = ["All Currencies", "USD", "KES"] as const;
  const searchTabs = ["name", "model", "year"] as const;
  const listingTypes = ["sale", "hire", "auction"] as const;
  const transmissionTypes = ["Automatic", "Manual"] as const;
  const propulsionTypes = ["Gas", "Electric", "Hybrid"] as const;
  const fuelTypeOptions = ["Petrol", "Diesel"] as const;
  const conditionTypes = ["Brand New", "Foreign Used", "Locally Used"] as const;

  // Map UI location to backend location
  const mapLocationToBackend = (
    location:
      | "Available in Kenya"
      | "Direct Import/International Stock"
      | "Both"
  ): string | undefined => {
    switch (location) {
      case "Available in Kenya":
        return "Kenya";
      case "Direct Import/International Stock":
        return "International";
      case "Both":
        return undefined;
    }
  };

  // Map backend location to UI location
  const mapBackendToLocation = (
    location: string | null
  ): "Available in Kenya" | "Direct Import/International Stock" | "Both" => {
    switch (location) {
      case "Kenya":
        return "Available in Kenya";
      case "International":
        return "Direct Import/International Stock";
      default:
        return "Both";
    }
  };

  // Fetch brands on mount
  useEffect(() => {
    console.log("Brands useEffect mounted at", new Date().toISOString());
    const controller = new AbortController();
    carService
      .listBrands(controller.signal)
      .then((res: BrandResponse) => {
        console.log("listBrands response:", JSON.stringify(res));
        if (res.status === "success" && Array.isArray(res.data)) {
          console.log(`Brands fetched: ${JSON.stringify(res)}`);
          setBrands(res.data);
        } else {
          setBrands([]);
          console.error(
            "Failed to fetch brands. Response:",
            JSON.stringify(res)
          );
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(
            "Error fetching brands:",
            err.name,
            err.message,
            err.stack
          );
        }
      });
    return () => {
      console.log("Brands useEffect cleanup at", new Date().toISOString());
      controller.abort();
    };
  }, []);

  // Fetch models when brandId changes
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId(null);
      return;
    }
    const controller = new AbortController();
    carService
      .listCarModels(brandId, controller.signal)
      .then((res: CarModelResponse) => {
        console.log("Car Models API Response:", res); // Log for debugging
        if (res.status === "success" && res.data) {
          setModels(res.data);
        } else {
          setModels([]);
          console.error(res.message || "Failed to fetch models");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching models:", err.message);
        }
      });
    return () => controller.abort();
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
        const response = await carService.getSearchSuggestions(query);
        if (response.status === "success" && response.data) {
          setSuggestions(response.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          console.error(response.message || "Failed to fetch suggestions");
        }
      } catch (err: unknown) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
        setShowSuggestions(false);
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
      searchParams
        .get("listing_type")
        ?.split(",")
        ?.filter((t): t is "sale" | "hire" | "auction" =>
          listingTypes.includes(t as any)
        ) || []
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
    setFuelTypes(
      searchParams
        .get("fuel_type")
        ?.split(",")
        ?.filter((t): t is "Petrol" | "Diesel" =>
          fuelTypeOptions.includes(t as any)
        ) || []
    );
    setCondition(
      (searchParams.get("condition") as
        | "Brand New"
        | "Foreign Used"
        | "Locally Used"
        | "") || ""
    );
  }, [searchParams]);

  // Parse budget range to min/max price
  const parseBudgetRange = (
    budget: string | null
  ): { minPrice?: number; maxPrice?: number } => {
    if (!budget) return {};
    const range = budget
      .replace("K", "000")
      .replace("M", "000000")
      .split(" - ");
    if (budget === "Above 10M") {
      return { minPrice: 10000000 };
    }
    return {
      minPrice: parseFloat(range[0]),
      maxPrice: range[1] ? parseFloat(range[1]) : undefined,
    };
  };

  // Get filters
  const getFilters = useCallback((): CarFilters => {
    const { minPrice: budgetMin, maxPrice: budgetMax } =
      parseBudgetRange(selectedBudget);
    const filters: CarFilters = {
      listing_type: listingType.length > 0 ? listingType.join(",") : undefined,
      query: searchQuery || undefined,
      search_by: activeTab !== "name" ? activeTab : undefined,
      budget: undefined, // Backend doesn't use budget directly
      location: mapLocationToBackend(selectedLocation),
      min_yom: minYom ? parseInt(minYom) : undefined,
      max_yom: maxYom ? parseInt(maxYom) : undefined,
      min_price: minPrice ? parseFloat(minPrice) : budgetMin,
      max_price: maxPrice ? parseFloat(maxPrice) : budgetMax,
      currency:
        currency !== "All Currencies" ? (currency as "KES" | "USD") : undefined,
      brand_id: brandId ?? undefined,
      model_id: modelId ?? undefined,
      transmission_type: transmission || undefined,
      propulsion: propulsion || undefined,
      fuel_type: fuelTypes.length > 0 ? fuelTypes.join(",") : undefined,
      condition: condition || undefined,
      is_published: "true",
    };
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    ) as CarFilters;
  }, [
    listingType,
    searchQuery,
    activeTab,
    selectedBudget,
    selectedLocation,
    minYom,
    maxYom,
    minPrice,
    maxPrice,
    currency,
    brandId,
    modelId,
    transmission,
    propulsion,
    fuelTypes,
    condition,
  ]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (filters: CarFilters) => {
      try {
        await dispatch(fetchAllCars({ page: 1, perPage: 9, filters })).unwrap();
        setSearchParams(
          Object.fromEntries(
            Object.entries({
              ...filters,
              location: filters.location || "Both", // Map back to UI-friendly value
              fuel_type: filters.fuel_type, // Keep as comma-separated
            }).map(([key, value]) => [key, String(value)])
          ),
          { replace: true }
        );
      } catch (error: unknown) {
        console.error("Search failed:", error);
      }
    }, 600),
    [dispatch, setSearchParams]
  );

  // Trigger search
  const handleSearch = () => {
    setShowSuggestions(false);
    debouncedSearch(getFilters());
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    debouncedSearch(getFilters());
  };

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
                    type="checkbox"
                    checked={listingType.includes(type)}
                    onChange={(e) => {
                      setListingType((prev) =>
                        e.target.checked
                          ? [...prev, type]
                          : prev.filter((t) => t !== type)
                      );
                    }}
                    className="mr-2"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
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
                className="border p-3 rounded-lg w-full mt-1"
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
                className="border p-3 rounded-lg w-full mt-1"
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
                type="number"
                className="border p-3 rounded-lg w-full"
                placeholder="e.g., 2015"
                value={minYom}
                onChange={(e) => setMinYom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Max YOM</label>
              <input
                type="number"
                className="border p-3 rounded-lg w-full"
                placeholder="e.g., 2025"
                value={maxYom}
                onChange={(e) => setMaxYom(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 font-medium">
                Min Price
              </label>
              <input
                type="number"
                className="border p-3 rounded-lg w-full"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium">
                Max Price
              </label>
              <input
                type="number"
                className="border p-3 rounded-lg w-full"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Currency</label>
            <select
              className="border p-3 rounded-lg w-full"
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
              className="border p-3 rounded-lg w-full"
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
              className="border p-3 rounded-lg w-full"
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
                    type="checkbox"
                    checked={fuelTypes.includes(type)}
                    onChange={(e) => {
                      setFuelTypes((prev) =>
                        e.target.checked
                          ? [...prev, type]
                          : prev.filter((t) => t !== type)
                      );
                    }}
                    className="mr-2"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Condition</label>
            <select
              className="border p-3 rounded-lg w-full"
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

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700">
              Vehicle Location
            </h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {vehicleLocations.map((location) => (
                <button
                  key={location}
                  className={`border px-4 py-2 rounded-lg transition ${
                    selectedLocation === location
                      ? "bg-[#262162] text-white border-[#262162]"
                      : "border-gray-400 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  {location}
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
            setListingType([]);
            setSearchQuery("");
            setActiveTab("name");
            setSelectedBudget(null);
            setSelectedLocation("Both");
            setMinYom("");
            setMaxYom("");
            setMinPrice("");
            setMaxPrice("");
            setCurrency("All Currencies");
            setBrandId(null);
            setModelId(null);
            setTransmission("");
            setPropulsion("");
            setFuelTypes([]);
            setCondition("");
            setSearchParams({}, { replace: true });
          }}
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}
