import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { debounce, isEqual } from "lodash";
import { carService } from "../services/carService";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchAllCars } from "../redux/carsSlice";
import { toast } from "react-toastify";
import { FaTimes, FaSearch, FaHeart, FaFilter } from "react-icons/fa";
import type { Car, Pagination, CarFilters, Brand, CarModel } from "../types/types";
import Layout from "../components/Layout";

// SWR fetcher for cars
const fetcher = async ({
  page,
  perPage,
  filters,
}: {
  page: number;
  perPage: number;
  filters: CarFilters;
}): Promise<{ cars: Car[]; pagination: Pagination }> => {
  try {
    const response = await carService.getAllCars(page, perPage, filters);
    if (
      response.status === "success" &&
      response.data?.cars &&
      response.data.pagination
    ) {
      return {
        cars: response.data.cars,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.message || "Failed to fetch cars");
  } catch (error: any) {
    console.error("Fetcher error:", error);
    throw error;
  }
};

// SWR fetcher for favorites
const favoritesFetcher = async (token: string | null) => {
  if (!token) return { cars: [] };
  const response = await carService.fetchWishlist(token, 1, 20);
  if (response.status === "success" && response.data?.cars) {
    return { cars: response.data.cars };
  }
  throw new Error(response.message || "Failed to fetch favorites");
};

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
    cars: { allCars: cars },
    pagination: { allCars: pagination },
    error: { allCars: error },
  } = carsState;
  const [currentPage, setCurrentPage] = useState(1);
  const isFetching = useRef(false);
  const perPage = 9;

  // Filter states
  const [listingType, setListingType] = useState<
    ("sale" | "hire" | "auction")[]
  >([]);
  const [searchBy, setSearchBy] = useState<"name" | "model" | "year" | "">("");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState<
    "Available in Kenya" | "Direct Import/International Stock" | "Both" | ""
  >("");
  const [minYom, setMinYom] = useState("");
  const [maxYom, setMaxYom] = useState("");
  const [currency, setCurrency] = useState<
    "All Currencies" | "USD" | "KES" | ""
  >("");
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
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [modelId, setModelId] = useState<number | undefined>(undefined);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favoriteCarIds, setFavoriteCarIds] = useState<number[]>([]);

  // Input refs for debugging focus
  const queryInputRef = useRef<HTMLInputElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minYomInputRef = useRef<HTMLInputElement>(null);
  const maxYomInputRef = useRef<HTMLInputElement>(null);
  const locationSelectRef = useRef<HTMLSelectElement>(null);

  // Debounced filter application
  const debouncedApplyFilters = useCallback(
    debounce(() => {
      setQuery(query);
      setMinPrice(minPrice);
      setMaxPrice(maxPrice);
      setLocation(location);
      setMinYom(minYom);
      setMaxYom(maxYom);
      setCurrentPage(1); // Reset to first page on filter apply
    }, 500),
    [query, minPrice, maxPrice, location, minYom, maxYom]
  );

  // Sync states with URL params on load
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setQuery(params.query || "");
    setMinPrice(params.min_price || "");
    setMaxPrice(params.max_price || "");
    setLocation(
      (params.location as
        | "Available in Kenya"
        | "Direct Import/International Stock"
        | "Both"
        | "") || ""
    );
    setMinYom(params.min_yom || "");
    setMaxYom(params.max_yom || "");
    setListingType(
      params.listing_type
        ? (params.listing_type.split(",") as ("sale" | "hire" | "auction")[])
        : []
    );
    setSearchBy((params.search_by as "name" | "model" | "year" | "") || "");
    setCurrency(
      (params.currency as "All Currencies" | "USD" | "KES" | "") || ""
    );
    setTransmission(
      (params.transmission_type as "Automatic" | "Manual" | "") || ""
    );
    setPropulsion(
      (params.propulsion as "Gas" | "Electric" | "Hybrid" | "") || ""
    );
    setFuelTypes(
      params.fuel_type
        ? (params.fuel_type.split(",") as ("Petrol" | "Diesel")[])
        : []
    );
    setCondition(
      (params.condition as
        | "Brand New"
        | "Foreign Used"
        | "Locally Used"
        | "") || ""
    );
    setBrandId(params.brand_id ? parseInt(params.brand_id) : undefined);
    setModelId(params.model_id ? parseInt(params.model_id) : undefined);
    setCurrentPage(parseInt(params.page || "1") || 1);
  }, [searchParams]);

  // Fetch brands
  useEffect(() => {
    const controller = new AbortController();
    carService
      .listBrands(controller.signal)
      .then((response) => {
        if (response.status === "success" && response.data) {
          setBrands(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch brands");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch brands:", error);
          toast.error("Failed to load brands");
        }
      });
    return () => controller.abort();
  }, []);

  // Fetch models when brandId changes
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId(undefined);
      return;
    }
    const controller = new AbortController();
    carService
      .listCarModels(brandId, controller.signal)
      .then((response) => {
        if (response.status === "success" && response.data) {
          setModels(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch models");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch models:", error);
          toast.error("Failed to load models");
        }
      });
    return () => controller.abort();
  }, [brandId]);

  // Fetch favorites with SWR
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const {
    data: favoritesData,
    error: favoritesError,
    mutate: mutateFavorites,
  } = useSWR(["favorites", token], () => favoritesFetcher(token), {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Update favoriteCarIds
  useEffect(() => {
    if (favoritesData?.cars) {
      setFavoriteCarIds(favoritesData.cars.map((car: Car) => car.id));
    }
    if (favoritesError) {
      console.error("Favorites error:", favoritesError);
      toast.error("Failed to load favorites");
    }
  }, [favoritesData, favoritesError]);

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
        const response = isFavorited
          ? await carService.removeFavorite(token, carId)
          : await carService.addToFavorites(token, carId);
        if (response.status === "success") {
          setFavoriteCarIds((prev) =>
            isFavorited ? prev.filter((id) => id !== carId) : [...prev, carId]
          );
          toast.success(
            `Car ${isFavorited ? "removed from" : "added to"} favorites`
          );
          mutateFavorites();
        } else {
          throw new Error(response.message || "Failed to update favorites");
        }
      } catch (error) {
        toast.error((error as Error).message || "Failed to update favorites");
      }
    },
    [favoriteCarIds, token, navigate, mutateFavorites]
  );

  // Build filters
  const filters = useMemo((): CarFilters => {
    const locationMap: Record<string, string | undefined> = {
      "Available in Kenya": "Kenya",
      "Direct Import/International Stock": "International",
      Both: undefined,
      "": undefined,
    };
    const params: CarFilters = {
      listing_type: listingType.length > 0 ? listingType.join(",") : undefined,
      search_by: searchBy || undefined,
      query: query || undefined,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
      location: locationMap[location],
      min_yom: minYom ? parseInt(minYom) : undefined,
      max_yom: maxYom ? parseInt(maxYom) : undefined,
      currency:
        currency && currency !== "All Currencies" ? currency : undefined,
      transmission_type: transmission || undefined,
      propulsion: propulsion || undefined,
      fuel_type: fuelTypes.length > 0 ? fuelTypes.join(",") : undefined,
      condition: condition || undefined,
      brand_id: brandId,
      model_id: modelId,
      is_published: "true",
    };
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as CarFilters;
  }, [
    listingType,
    searchBy,
    query,
    minPrice,
    maxPrice,
    location,
    minYom,
    maxYom,
    currency,
    transmission,
    propulsion,
    fuelTypes,
    condition,
    brandId,
    modelId,
  ]);

  // Update URL with debouncing
  const debouncedUpdateURL = useCallback(
    debounce(() => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.set(key, String(value));
      });
      queryParams.set("page", String(currentPage));
      setSearchParams(queryParams);
    }, 1000),
    [filters, currentPage, setSearchParams]
  );

  useEffect(() => {
    debouncedUpdateURL();
    debouncedApplyFilters();
    return () => {
      debouncedUpdateURL.cancel();
      debouncedApplyFilters.cancel();
    };
  }, [filters, currentPage, debouncedUpdateURL, debouncedApplyFilters]);

  // SWR key
  const swrKey = useMemo(
    () => [`cars/${currentPage}`, JSON.stringify(filters)],
    [currentPage, filters]
  );

  // Fetch cars with SWR
  const {
    data: swrData,
    error: swrError,
    isLoading,
  } = useSWR(swrKey, () => fetcher({ page: currentPage, perPage, filters }), {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  // Sync SWR data with Redux
  useEffect(() => {
    if (swrData && !isFetching.current) {
      if (
        !isEqual(swrData.cars, cars) ||
        !isEqual(swrData.pagination, pagination)
      ) {
        isFetching.current = true;
        dispatch(
          fetchAllCars.fulfilled(
            {
              cars: swrData.cars,
              pagination: swrData.pagination,
            },
            "",
            { page: currentPage, perPage, filters }
          )
        );
        isFetching.current = false;
      }
    }
    if (swrError) {
      console.error("SWR error:", swrError);
      dispatch(
        fetchAllCars.rejected(
          null,
          "",
          { page: currentPage, perPage, filters },
          swrError.message || "Failed to fetch cars"
        )
      );
    }
  }, [swrData, swrError, dispatch, currentPage, perPage, cars, pagination]);

  // Render car card
  const renderCarCard = (car: Car) => {
    const featuresArr: string[] = Array.isArray(car.features)
      ? car.features.filter((f: string) => !!f)
      : [];
    const displayedFeatures = featuresArr.slice(0, 3);
    const isFavorited = favoriteCarIds.includes(car.id);

    return (
      <Link to={`/cardetails?id=${car.id}`} key={car.id}>
        <div className="border border-[#262162] rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300 bg-white">
          <div className="relative w-full h-48">
            <img
              src={car.images?.[0] || "/placeholder.png"}
              alt={
                car.registration_number ||
                `${car.brand || "Car"} ${car.model || "Model"}`
              }
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            />
            <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              {car.status || "Available"}
            </span>
            <button
              onClick={(e) => handleFavoriteToggle(car.id, e)}
              className="absolute top-2 left-2 text-2xl"
              title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
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
          <hr className="border-gray-200" />
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
  };

  // Loading and error states
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-t-4 border-[#f26624] border-dashed rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (swrError || error) {
    return (
      <Layout>
        <div className="text-red-500 text-center py-12">
          <p>Error: {swrError?.message || error || "Failed to fetch cars"}</p>
          <button
            className="mt-4 bg-[#f26624] text-white px-4 py-2 rounded-full"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const displayCars = swrData?.cars || [];
  const displayPagination = swrData?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
    per_page: perPage,
  };

  const filterOptions = {
    listingTypes: ["sale", "hire", "auction"] as const,
    searchByOptions: ["name", "model", "year", "registration"] as const,
    locations: [
      "Available in Kenya",
      "Direct Import/International Stock",
      "Both",
    ] as const,
    currencies: ["All Currencies", "USD", "KES"] as const,
    transmissions: ["Automatic", "Manual"] as const,
    propulsions: ["Gas", "Electric", "Hybrid"] as const,
    fuelTypes: ["Petrol", "Diesel"] as const,
    conditions: ["Brand New", "Foreign Used", "Locally Used"] as const,
  };

  return (
    <Layout>
      <main className="pt-24 px-4 sm:px-6 md:px-16 lg:px-24 mt-14 py-12 overflow-x-hidden">
        {/* Filter Section for Mobile/Tablet */}
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
          {isFilterOpen && <FilterSection />}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <section className="w-full">
              <div className="lg:block hidden">
                <h1 className="text-3xl md:text-4xl font-bold text-[#262162] animate">
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
                    {displayCars.map(renderCarCard)}
                  </div>
                )}
              </div>
              {displayPagination.pages > 0 && (
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, displayPagination.pages)
                      )
                    }
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
          {/* Filter Sidebar for Larger Screens */}
          <div className="hidden lg:block lg:col-span-3 bg-white p-4 rounded-xl shadow-lg">
            <FilterSection />
          </div>
        </div>
      </main>
    </Layout>
  );

  // Filter Section Component
  function FilterSection() {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg lg:shadow-none">
        <h2 className="text-xl font-bold text-[#262162] mb-4 flex items-center">
          <span className="mr-2">Filter Cars</span>
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
                  setQuery("");
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
                setSearchBy(e.target.value as "name" | "model" | "year" | "")
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition cursor-pointer text-sm"
            >
              <option value="">Select</option>
              {filterOptions.searchByOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <input
              ref={queryInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                debouncedApplyFilters();
              }}
              placeholder="Search..."
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Listing Type
              </label>
              <button
                onClick={() => setListingType([])}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Listing Type"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {filterOptions.listingTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
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
                    className="mr-2 accent-[#f26624]"
                  />
                  <span className="text-gray-700 text-sm">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Brand & Model
              </label>
              <button
                onClick={() => {
                  setBrandId(undefined);
                  setModelId(undefined);
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Brand & Model"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={brandId ?? ""}
              onChange={(e) => {
                const id = e.target.value
                  ? parseInt(e.target.value)
                  : undefined;
                setBrandId(id);
                setModelId(undefined);
              }}
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition cursor-pointer text-sm"
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <select
              value={modelId ?? ""}
              onChange={(e) =>
                setModelId(
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
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
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Price Range
              </label>
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Price Range"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input
                ref={minPriceInputRef}
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || Number(value) >= 0) {
                    setMinPrice(value);
                    debouncedApplyFilters();
                  }
                }}
                placeholder="Min Price"
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#f26624] transition"
              />
              <input
                ref={maxPriceInputRef}
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || Number(value) >= 0) {
                    setMaxPrice(value);
                    debouncedApplyFilters();
                  }
                }}
                placeholder="Max Price"
                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#f26624] transition"
              />
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Location
              </label>
              <button
                onClick={() => {
                  setLocation("");
                }}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Location"
              >
                <FaTimes />
              </button>
            </div>
            <select
              ref={locationSelectRef}
              value={location}
              onChange={(e) => {
                const value = e.target.value as
                  | "Available in Kenya"
                  | "Direct Import/International Stock"
                  | "Both"
                  | "";
                setLocation(value);
                debouncedApplyFilters();
              }}
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              <option value="">Select</option>
              {filterOptions.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] font-semibold text-sm">
                Year of Manufacture
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
                ref={minYomInputRef}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={minYom}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (Number(value) >= 1900 &&
                      Number(value) <= new Date().getFullYear())
                  ) {
                    setMinYom(value);
                    debouncedApplyFilters();
                  }
                }}
                placeholder="Min Year"
                className="border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#f26624] transition"
              />
              <input
                ref={maxYomInputRef}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={maxYom}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (Number(value) >= 1900 &&
                      Number(value) <= new Date().getFullYear())
                  ) {
                    setMaxYom(value);
                    debouncedApplyFilters();
                  }
                }}
                placeholder="Max Year"
                className="border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#f26624] transition"
              />
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-[#262162] text-sm">Currency</label>
              <button
                onClick={() => setCurrency("")}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Currency"
              >
                <FaTimes />
              </button>
            </div>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(
                  e.target.value as "All Currencies" | "USD" | "KES" | ""
                )
              }
              className="border border-gray-300 p-2 w-full rounded-lg mt-1 focus:ring-2 focus:ring-[#f26624] transition text-sm"
            >
              {filterOptions.currencies.map((cur) => (
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
              {filterOptions.transmissions.map((trans) => (
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
              {filterOptions.propulsions.map((prop) => (
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
                onClick={() => setFuelTypes([])}
                className="text-[#f26624] hover:text-[#262162] transition"
                title="Reset Fuel Type"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {filterOptions.fuelTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
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
                    className="mr-2 accent-[#f26624]"
                  />
                  <span className="text-gray-700 text-sm">{type}</span>
                </label>
              ))}
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
              {filterOptions.conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setQuery(query);
                setMinPrice(minPrice);
                setMaxPrice(maxPrice);
                setLocation(location);
                setMinYom(minYom);
                setMaxYom(maxYom);
                setCurrentPage(1);
                setIsFilterOpen(false); // Close filter on apply for mobile
              }}
              className="bg-[#f26624] text-white px-4 py-2 rounded-full w-full hover:bg-[#262162] transition cursor-pointer text-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setListingType([]);
                setSearchBy("");
                setQuery("");
                setMinPrice("");
                setMaxPrice("");
                setLocation("");
                setMinYom("");
                setMaxYom("");
                setCurrency("");
                setTransmission("");
                setPropulsion("");
                setFuelTypes([]);
                setCondition("");
                setBrandId(undefined);
                setModelId(undefined);
                setIsFilterOpen(false);
                navigate("/cars");
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
};

export default Cars;
