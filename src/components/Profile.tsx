import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { carService } from "../services/carService";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCars } from "../redux/carsSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import debounce from "lodash/debounce";
import axios, { AxiosError } from "axios";
import type {
  Car,
  Bid,
  Pagination,
  CarResponse,
} from "../types/types";
import type { RootState, AppDispatch } from "../redux/store";

const API_BASE_URL = "http://127.0.0.1:5000";

const formatPrice = (
  price: string | null | undefined,
  currency: string | null | undefined
) => {
  if (!price || !currency) return "Price not available";
  const num = Number(price);
  if (isNaN(num)) return price;
  const currencyPrefix = currency === "KES" ? "Kes" : currency;
  return `${currencyPrefix} ${num.toLocaleString()}`;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

const Profile: React.FC = () => {
  const { user, fetchProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [carActionLoading, setCarActionLoading] = useState<
    Record<number, boolean>
  >({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [showroomName, setShowroomName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [showroomAddress, setShowroomAddress] = useState("");
  const [showroomCity, setShowroomCity] = useState("");
  const [showroomPostalCode, setShowroomPostalCode] = useState("");
  const [showroomState, setShowroomState] = useState("");
  const [showroomLogoFile, setShowroomLogoFile] = useState<File | null>(null);
  const [showroomLogoPreview, setShowroomLogoPreview] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [carType, setCarType] = useState("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState("");
  const [isPublishedFilter, setIsPublishedFilter] = useState("");
  const [carsPage, setCarsPage] = useState(1);
  const [carsPerPage] = useState(5);
  const [wishlist, setWishlist] = useState<Car[]>([]);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [wishlistPerPage] = useState(5);
  const [wishlistPagination, setWishlistPagination] =
    useState<Pagination | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidsPage, setBidsPage] = useState(1);
  const [bidsPerPage] = useState(5);
  const [bidsPagination, setBidsPagination] = useState<Pagination | null>(null);
  const [bidsLoading, setBidsLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { cars, pagination, status } = useSelector((state: RootState) => ({
    cars: state.cars.cars?.myCars || [],
    pagination: state.cars.pagination?.myCars || null,
    status: state.cars.status.myCars || "idle",
  }));

  useEffect(() => {
    console.log("Redux cars state:", { cars, status, pagination });
  }, [cars, status, pagination]);

  const token = localStorage.getItem("token");
  console.log("Token used:", token);

  useEffect(() => {
    if (!user || !token) {
      fetchProfile()
        .then(() => setIsLoading(false))
        .catch(() => {
          logout();
          navigate("/authentication");
        });
    } else {
      setIsLoading(false);
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setPostalCode(user.postal_code || "");
      setState(user.state || "");
      setEmail(user.email || "");
      setIdNumber(user.id_number || "");
      if (user.showroom_corporate) {
        setShowroomName(user.showroom_corporate.name || "");
        setRegistrationNumber(
          user.showroom_corporate.registration_number || ""
        );
        setContactEmail(user.showroom_corporate.contact_email || "");
        setContactPhone(user.phone || "");
        setShowroomAddress(user.showroom_corporate.address || "");
        setShowroomCity(user.showroom_corporate.city || "");
        setShowroomPostalCode(user.showroom_corporate.postal_code || "");
        setShowroomState(user.showroom_corporate.state || "");
        setShowroomLogoPreview(user.showroom_corporate.logo_url || null);
      }
    }
  }, [user, token, fetchProfile, logout, navigate]);

  const handleFetchMyCars = useCallback(() => {
    if (!token) {
      toast.error("Please log in to view your cars.");
      return;
    }
    const filters: Record<string, string> = { query: searchText };
    if (carType) filters.listing_type = carType.toLowerCase();
    if (isVerifiedFilter) filters.is_verified = isVerifiedFilter;
    if (isPublishedFilter) filters.is_published = isPublishedFilter;
    console.log("Dispatching fetchMyCars with filters:", filters);
    dispatch(fetchMyCars({ page: carsPage, perPage: carsPerPage, filters }))
      .unwrap()
      .then(() => console.log("fetchMyCars succeeded"))
      .catch((err: Error) => {
        console.error("Fetch my cars error:", err);
        toast.error("Failed to fetch your cars. Please try again.");
      });
  }, [
    token,
    searchText,
    carType,
    isVerifiedFilter,
    isPublishedFilter,
    carsPage,
    carsPerPage,
    dispatch,
  ]);

  const handleFetchWishlist = useCallback(async () => {
    if (!token) return;
    setWishlistLoading(true);
    try {
      const response: CarResponse = await carService.fetchWishlist(
        token,
        wishlistPage,
        wishlistPerPage
      );
      console.log("Wishlist API response:", JSON.stringify(response));
      if (response.status === "success" && response.data && response.data.cars) {
        setWishlist(response.data.cars);
        setWishlistPagination(response.data.pagination || null);
        console.log(`Wishlist updated: ${JSON.stringify(response.data.cars)}`);
      } else {
        setWishlist([]);
        setWishlistPagination(null);
        toast.error(response.message || "Failed to fetch wishlist");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Wishlist fetch error:", axiosError);
        setWishlist([]);
        setWishlistPagination(null);
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/authentication");
        } else {
          toast.error(
            axiosError.response?.data?.message || "Failed to fetch wishlist"
          );
        }
      } else {
        console.error("Wishlist fetch error:", error);
        toast.error("Failed to fetch wishlist");
      }
    } finally {
      setWishlistLoading(false);
    }
  }, [token, wishlistPage, wishlistPerPage, logout, navigate]);

  const handleFetchMyBids = useCallback(async () => {
    if (!token) {
      toast.error("Please log in to view your car bids.");
      return;
    }
    setBidsLoading(true);
    try {
      const response = await carService.getMyCarsBids(
        token,
        bidsPage,
        bidsPerPage
      );
      console.log("My Bids API response:", JSON.stringify(response));
      if (response.status === "success" && response.data) {
        const bidsData = Array.isArray(response.data.bids)
          ? response.data.bids
          : [];
        setBids(bidsData);
        setBidsPagination(response.data.pagination || null);
        console.log(`Bids updated: ${JSON.stringify(bidsData)}`);
      } else {
        setBids([]);
        setBidsPagination(null);
        toast.error(response.message || "Failed to fetch bids");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Bids fetch error:", axiosError);
        setBids([]);
        setBidsPagination(null);
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/authentication");
        } else {
          toast.error(
            axiosError.response?.data?.message || "Failed to fetch bids"
          );
        }
      } else {
        console.error("Bids fetch error:", error);
        toast.error("Failed to fetch bids");
      }
    } finally {
      setBidsLoading(false);
    }
  }, [token, bidsPage, bidsPerPage, logout, navigate]);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === "myCars" && token && isMounted) {
      handleFetchMyCars();
    } else if (activeTab === "wishlist" && token && isMounted) {
      handleFetchWishlist();
    } else if (activeTab === "myBids" && token && isMounted) {
      handleFetchMyBids();
    }
    return () => {
      isMounted = false;
    };
  }, [
    activeTab,
    token,
    handleFetchMyCars,
    handleFetchWishlist,
    handleFetchMyBids,
  ]);

  const debouncedSearch = debounce(() => {
    setCarsPage(1);
    handleFetchMyCars();
  }, 500);

  const handleSearch = () => {
    debouncedSearch();
  };

  const handleCarsNextPage = () => {
    if (pagination && carsPage < pagination.pages) {
      setCarsPage((prev) => prev + 1);
    }
  };

  const handleCarsPrevPage = () => {
    if (carsPage > 1) {
      setCarsPage((prev) => prev - 1);
    }
  };

  const handleWishlistNextPage = () => {
    if (wishlistPagination && wishlistPage < wishlistPagination.pages) {
      setWishlistPage((prev) => prev + 1);
    }
  };

  const handleWishlistPrevPage = () => {
    if (wishlistPage > 1) {
      setWishlistPage((prev) => prev - 1);
    }
  };

  const handleBidsNextPage = () => {
    if (bidsPagination && bidsPage < bidsPagination.pages) {
      setBidsPage((prev) => prev + 1);
    }
  };

  const handleBidsPrevPage = () => {
    if (bidsPage > 1) {
      setBidsPage((prev) => prev - 1);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setShowroomLogoFile(file);
      setShowroomLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!token) return;
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("postal_code", postalCode);
      formData.append("state", state);
      formData.append("email", email);
      formData.append("id_number", idNumber);
      if (profilePhotoFile) {
        formData.append("profile_photo", profilePhotoFile);
      }
      const response = await authService.updateProfile(token, formData);
      if (response.status === "success") {
        await fetchProfile();
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/authentication");
        } else {
          toast.error(
            axiosError.response?.data?.message ||
              "An error occurred while updating profile."
          );
        }
      } else {
        toast.error("An error occurred while updating profile.");
      }
    } finally {
      setProfilePhotoFile(null);
      setUpdateLoading(false);
    }
  };

  const handleUpdateShowroomCorporate = async () => {
    if (!token || !user) return;
    setUpdateLoading(true);
    try {
      const showroomCorporateData = {
        name: showroomName,
        registration_number: registrationNumber,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address: showroomAddress,
        city: showroomCity,
        postal_code: showroomPostalCode,
        state: showroomState,
        logo: showroomLogoFile || undefined, // Changed to handle undefined
      };
      const response = await authService.updateShowroomCorporate(
        token,
        showroomCorporateData
      );
      if (response.status === "success") {
        await fetchProfile();
        toast.success("Business details updated successfully!");
        setShowroomLogoFile(null);
        setShowroomLogoPreview(
          response.data.user?.showroom_corporate?.logo_url || null
        );
      } else {
        toast.error(response.message || "Failed to update business details");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/authentication");
        } else {
          toast.error(
            axiosError.response?.data?.message ||
              "An error occurred while updating business details."
          );
        }
      } else {
        toast.error("An error occurred while updating business details.");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleBecomeSeller = () => {
    navigate("/seller-type-selection");
  };

  const handleCarClick = (id: number) => {
    console.log(`handleCarClick called with id: ${id}`);
    navigate(`/cardetails?id=${id}`);
  };

  const handleUpdateCar = (id: number, e: React.MouseEvent) => {
    console.log(`handleUpdateCar called with id: ${id}`);
    e.stopPropagation();
    e.preventDefault();
    navigate(`/sellcar?id=${id}`);
  };

  const handleDeleteCar = async (id: number, e: React.MouseEvent) => {
    console.log(`handleDeleteCar called with id: ${id}`);
    e.stopPropagation();
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to delete cars.");
      return;
    }
    if (carActionLoading[id]) return;
    if (!confirm("Are you sure you want to delete this car?")) return;

    setCarActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await carService.deleteCar(token, id);
      console.log("Delete car response:", response);
      if (response.status === "success") {
        toast.success("Car deleted successfully!");
        handleFetchMyCars();
      } else {
        toast.error(response.message || "Failed to delete car");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Delete car error:", axiosError);
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/authentication");
        } else {
          toast.error(
            axiosError.response?.data?.message ||
              "An error occurred while deleting the car."
          );
        }
      } else {
        console.error("Delete car error:", error);
        toast.error("An error occurred while deleting the car.");
      }
    } finally {
      setCarActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveFromWishlist = async (id: number, e: React.MouseEvent) => {
    console.log(`handleRemoveFromWishlist called with id: ${id}`);
    e.stopPropagation();
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to manage your wishlist.");
      return;
    }
    if (carActionLoading[id]) return;

    setCarActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await carService.removeFavorite(token, id);
      console.log("Remove from wishlist response:", response);
      if (response.status === "success") {
        toast.success("Car removed from wishlist!");
        handleFetchWishlist();
      } else {
        toast.error(response.message || "Failed to remove from wishlist");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error("Remove from wishlist error:", axiosError);
        if (axiosError.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          logout();
          navigate("/authentication");
        } else {
          toast.error(
            axiosError.response?.data?.message ||
              "An error occurred while updating wishlist."
          );
        }
      } else {
        console.error("Remove from wishlist error:", error);
        toast.error("An error occurred while updating wishlist.");
      }
    } finally {
      setCarActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleChangeCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !e.target.files || !e.target.files[0]) return;
    const formData = new FormData();
    formData.append("cover_photo", e.target.files[0]);
    try {
      const response = await authService.updateProfile(token, formData);
      if (response.status === "success") {
        await fetchProfile();
        toast.success("Cover photo updated successfully!");
      } else {
        toast.error(response.message || "Failed to update cover photo");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message ||
            "An error occurred while updating cover photo."
        );
      } else {
        toast.error("An error occurred while updating cover photo.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#f26624" size={50} />
      </div>
    );
  }

  const profileImage =
    user && user.profile_photo
      ? user.profile_photo.startsWith("http")
        ? user.profile_photo
        : `${API_BASE_URL}/Uploads/users/profile/${user.profile_photo}`
      : "/profile.png";

  const isSeller = user?.seller_type && user.seller_type !== "individual";

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <div className="w-full lg:w-1/4 bg-white shadow-md p-6 rounded-lg lg:ml-8 mt-6 lg:mt-12">
        <div className="flex flex-col items-center">
          <img
            src={profileImage}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full object-cover border-4 border-gray-300"
          />
          <h2 className="text-lg font-semibold mt-3">{user?.name || "N/A"}</h2>
          <p className="text-gray-500 text-sm">
            {user?.seller_type
              ? user.seller_type.charAt(0).toUpperCase() +
                user.seller_type.slice(1)
              : "User"}
          </p>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#262162]">Account Status</span>
            <span className="text-[#f26624] font-semibold">
              {user?.is_verified ? "Verified" : "Not Verified"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#262162]">Email</span>
            <span className="text-[#f26624] font-semibold">
              {user?.email || "N/A"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#262162]">Seller Type</span>
            <span className="text-[#f26624] font-semibold">
              {user?.seller_type
                ? user.seller_type.charAt(0).toUpperCase() +
                  user.seller_type.slice(1)
                : "Not a Seller"}
            </span>
          </div>
        </div>
        {!isSeller && (
          <button
            onClick={handleBecomeSeller}
            className="block mt-6 text-center bg-[#f26624] text-white rounded-lg py-2 hover:bg-orange-700 transition"
          >
            Become a Seller
          </button>
        )}
      </div>

      <div className="w-full lg:w-3/4 p-6 lg:p-12">
        <div className="flex justify-between items-center bg-[#f26624] text-white p-4 rounded-lg">
          <h1 className="text-xl font-semibold">Profile Settings</h1>
          <label className="bg-[#f26624] px-4 py-2 rounded-md flex items-center cursor-pointer">
            <span className="mr-2">📷</span> Change Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleChangeCover}
              className="hidden"
            />
          </label>
        </div>
        <div className="mt-6 flex border-b">
          {["account", "myCars", "wishlist", "myBids", "sellerInfo"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm ${
                  activeTab === tab
                    ? "text-[#f26624] border-b-2 border-[#f26624] font-semibold"
                    : "text-gray-600"
                }`}
              >
                {tab === "myCars"
                  ? "My Cars"
                  : tab === "wishlist"
                  ? "Wishlist"
                  : tab === "myBids"
                  ? "My Car Bids"
                  : tab === "sellerInfo"
                  ? "Seller Info"
                  : "Account Settings"}
              </button>
            )
          )}
        </div>
        {activeTab === "account" && (
          <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[#262162] text-sm">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">State/County</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-[#262162] text-sm">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full"
                />
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={updateLoading}
              className="w-full mt-6 bg-[#f26624] text-white py-2 rounded-md font-semibold hover:bg-orange-700 flex items-center justify-center"
            >
              {updateLoading ? <ClipLoader color="#fff" size={20} /> : "Update"}
            </button>
          </div>
        )}

        {activeTab === "myCars" && (
          <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold mb-4">My Cars</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by number plate, brand, model..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="border p-2 rounded-md flex-1"
              />
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className="border p-2 rounded-md"
              >
                <option value="">All Types</option>
                <option value="sale">For Sale</option>
                <option value="hire">For Hire</option>
                <option value="auction">Auction</option>
              </select>
              <select
                value={isVerifiedFilter}
                onChange={(e) => setIsVerifiedFilter(e.target.value)}
                className="border p-2 rounded-md"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <select
                value={isPublishedFilter}
                onChange={(e) => setIsPublishedFilter(e.target.value)}
                className="border p-2 rounded-md"
              >
                <option value="">All</option>
                <option value="true">Published</option>
                <option value="false">Unpublished</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-[#f26624] text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-700"
              >
                Search
              </button>
            </div>

            {status === "loading" ? (
              <div className="text-center">
                <ClipLoader color="#f26624" size={50} />
              </div>
            ) : !cars ? (
              <p className="text-center text-gray-500">No cars available.</p>
            ) : cars.length === 0 ? (
              <p className="text-center text-gray-500">No cars found.</p>
            ) : (
              <div className="space-y-4">
                {cars.map((car: Car) => (
                  <div
                    key={car.id}
                    onClick={() => handleCarClick(car.id)}
                    className="cursor-pointer border p-4 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={car.images && car.images[0] || "/placeholder.png"}
                        alt={`${car.brand} ${car.model}`}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {car.brand} {car.model} ({car.year_of_manufacture || "N/A"})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Plate: {car.registration_number || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: {formatPrice(car.asking_price, car.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Seller:{" "}
                          {car.user?.showroom_corporate?.name || car.user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {car.listing_type?.toUpperCase() || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Verified: {car.is_verified ? "Yes" : "No"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Published: {car.is_published ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                      <button
                        onClick={(e) => handleUpdateCar(car.id, e)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={carActionLoading[car.id]}
                      >
                        Update
                      </button>
                      <button
                        onClick={(e) => handleDeleteCar(car.id, e)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                        disabled={carActionLoading[car.id]}
                      >
                        {carActionLoading[car.id] ? (
                          <ClipLoader color="#fff" size={16} />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && cars.length > 0 && (
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={handleCarsPrevPage}
                  disabled={carsPage <= 1}
                  className={`mr-2 px-4 py-2 border rounded-md ${
                    carsPage > 1
                      ? "hover:bg-gray-200 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Prev
                </button>
                <span className="mx-2 text-sm text-gray-600">
                  Page {carsPage} of {pagination.pages}
                </span>
                <button
                  onClick={handleCarsNextPage}
                  disabled={carsPage >= pagination.pages}
                  className={`ml-2 px-4 py-2 border rounded-md ${
                    carsPage < pagination.pages
                      ? "hover:bg-gray-200 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Wishlist</h2>
            {wishlistLoading ? (
              <div className="text-center">
                <ClipLoader color="#f26624" size={50} />
              </div>
            ) : !wishlist || wishlist.length === 0 ? (
              <p className="text-center text-gray-500">
                No cars in your wishlist.
              </p>
            ) : (
              <div className="space-y-4">
                {wishlist.map((car: Car) => (
                  <div
                    key={car.id}
                    onClick={() => handleCarClick(car.id)}
                    className="cursor-pointer border p-4 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={car.images && car.images[0] || "/placeholder.png"}
                        alt={`${car.brand} ${car.model}`}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {car.brand} {car.model} ({car.year_of_manufacture || "N/A"})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Plate: {car.registration_number || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: {formatPrice(car.asking_price, car.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Seller:{" "}
                          {car.user?.showroom_corporate?.name || car.user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {car.listing_type?.toUpperCase() || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Verified: {car.is_verified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <button
                        onClick={(e) => handleRemoveFromWishlist(car.id, e)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
                        disabled={carActionLoading[car.id]}
                      >
                        {carActionLoading[car.id] ? (
                          <ClipLoader color="#fff" size={16} />
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {wishlistPagination && wishlist && wishlist.length > 0 && (
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={handleWishlistPrevPage}
                  disabled={wishlistPage <= 1}
                  className={`mr-2 px-4 py-2 border rounded-md ${
                    wishlistPage > 1
                      ? "hover:bg-gray-200 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Prev
                </button>
                <span className="mx-2 text-sm text-gray-600">
                  Page {wishlistPage} of {wishlistPagination.pages}
                </span>
                <button
                  onClick={handleWishlistNextPage}
                  disabled={wishlistPage >= wishlistPagination.pages}
                  className={`ml-2 px-4 py-2 border rounded-md ${
                    wishlistPage < wishlistPagination.pages
                      ? "hover:bg-gray-200 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "myBids" && (
          <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold mb-4">My Car Bids</h2>
            {bidsLoading ? (
              <div className="text-center">
                <ClipLoader color="#f26624" size={50} />
              </div>
            ) : !bids || bids.length === 0 ? (
              <p className="text-center text-gray-500">
                No bids on your auction cars.
              </p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid: Bid) => (
                  <div
                    key={bid.id}
                    className="border p-4 rounded-md flex flex-col md:flex-row items-start justify-between hover:shadow-lg transition"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold text-lg">
                        {bid.car.brand} {bid.car.model} (ID: {bid.car_id})
                      </h3>
                      <p className="text-sm text-gray-600">
                        Plate: {bid.car.registration_number || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Asking Price:{" "}
                        {formatPrice(bid.car.asking_price, bid.car.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Auction End: {formatDate(bid.car.auction_end_time)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Bidder:</strong> {bid.bidder.name || "N/A"} (ID:{" "}
                        {bid.bidder.id})
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {bid.bidder.email || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Phone:</strong> {bid.bidder.phone || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong>{" "}
                        {[
                          bid.bidder.address,
                          bid.bidder.city,
                          bid.bidder.state,
                          bid.bidder.postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>ID Number:</strong>{" "}
                        {bid.bidder.id_number || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Verified:</strong>{" "}
                        {bid.bidder.is_verified ? "Yes" : "No"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Seller Type:</strong>{" "}
                        {bid.bidder.seller_type || "N/A"}
                      </p>
                      {bid.bidder.showroom_corporate && (
                        <p className="text-sm text-gray-600">
                          <strong>Showroom:</strong>{" "}
                          {bid.bidder.showroom_corporate.name || "N/A"} (Contact:{" "}
                          {bid.bidder.showroom_corporate.contact_email || "N/A"})
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <strong>Bid:</strong>{" "}
                        {formatPrice(bid.bid_amount, bid.car.currency)} on{" "}
                        {formatDate(bid.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {bidsPagination && bids && bids.length > 0 && (
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={handleBidsPrevPage}
                  disabled={bidsPage <= 1}
                  className={`mr-2 px-4 py-2 border rounded-md ${
                    bidsPage > 1
                      ? "hover:bg-gray-200 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Prev
                </button>
                <span className="mx-2 text-sm text-gray-600">
                  Page {bidsPage} of {bidsPagination.pages}
                </span>
                <button
                  onClick={handleBidsNextPage}
                  disabled={bidsPage >= bidsPagination.pages}
                  className={`ml-2 px-4 py-2 border rounded-md ${
                    bidsPage < bidsPagination.pages
                      ? "hover:bg-gray-200 text-gray-600"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "sellerInfo" && (
          <div className="mt-6 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
            {isSeller ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[#262162] text-sm">Seller Type</label>
                  <p className="text-gray-600">
                    {user?.seller_type
                      ? user.seller_type.charAt(0).toUpperCase() +
                        user.seller_type.slice(1)
                      : "N/A"}
                  </p>
                </div>
                {user?.seller_type === "showroom" ||
                user?.seller_type === "corporate" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[#262162] text-sm">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={showroomName}
                        onChange={(e) => setShowroomName(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">Address</label>
                      <input
                        type="text"
                        value={showroomAddress}
                        onChange={(e) => setShowroomAddress(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">City</label>
                      <input
                        type="text"
                        value={showroomCity}
                        onChange={(e) => setShowroomCity(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={showroomPostalCode}
                        onChange={(e) => setShowroomPostalCode(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={showroomState}
                        onChange={(e) => setShowroomState(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-[#262162] text-sm">
                        Business Logo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full"
                      />
                      {showroomLogoPreview && (
                        <img
                          src={showroomLogoPreview}
                          alt="Logo Preview"
                          width={128}
                          height={128}
                          className="object-contain mt-2"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No additional information for individual sellers.
                  </p>
                )}
                {(user?.seller_type === "showroom" ||
                  user?.seller_type === "corporate") && (
                  <button
                    onClick={handleUpdateShowroomCorporate}
                    disabled={updateLoading}
                    className="w-full mt-6 bg-[#f26624] text-white py-2 rounded-md font-semibold hover:bg-orange-700 flex items-center justify-center"
                  >
                    {updateLoading ? (
                      <ClipLoader color="#fff" />
                    ) : (
                      "Update Business Details"
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">You are not a seller yet.</p>
                <button
                  onClick={handleBecomeSeller}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
                >
                  Become a Seller
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;