import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { carService } from "../services/carService";
import type { Car, CarResponse } from "../services/carService";
import { FaCarSide, FaMapMarkerAlt, FaGasPump, FaRoad } from "react-icons/fa";
import SimilarCars from "../components/SimilarCars";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const formatPrice = (
  price: string | null | undefined,
  currency: string | null | undefined,
  isAuction: boolean = false,
  hasBid: boolean = false
): string => {
  if (!price || !currency) return "Price not available";
  const num = Number(price);
  if (isFinite(num)) {
    const currencyPrefix = currency === "KES" ? "Kes" : currency;
    const suffix =
      isAuction && hasBid
        ? " (Current Bid)"
        : isAuction
        ? " (Starting Bid)"
        : "";
    return `${currencyPrefix} ${num.toLocaleString()}${suffix}`;
  }
  return price || "Unknown";
};

const CarDetails = () => {
  const [searchParams] = useSearchParams();
  const carId = searchParams.get("id");
  const { user, token } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isBidding, setIsBidding] = useState<boolean>(false);

  useEffect(() => {
    if (!carId) {
      setError("No car ID provided");
      setLoading(false);
      return;
    }

    if (isNaN(parseInt(carId))) {
      setError("Invalid car ID");
      setLoading(false);
      return;
    }

    const fetchCar = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: CarResponse = await carService.getCarById(
          parseInt(carId)
        );
        if (response.status === "success" && response.data?.car) {
          setCar(response.data.car);
          setSelectedImage(response.data.car.images?.[0] || "/placeholder.png");
        } else {
          const message = response.message || "Car not found";
          setError(message);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch car details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  const isAuctionActive = useCallback(() => {
    if (!car?.auction_end_time) return false;
    const endTime = new Date(car.auction_end_time);
    return endTime > new Date();
  }, [car]);

  const handlePlaceBid = async () => {
    if (!token || !user) {
      toast.error("Please log in to place a bid");
      return;
    }
    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      toast.error("Please enter a valid bid amount");
      return;
    }
    if (!carId || !car) {
      toast.error("Invalid car selection");
      return;
    }
    setIsBidding(true);
    try {
      const bidValue = parseFloat(bidAmount);
      if (car.highest_bid && bidValue <= parseFloat(car.highest_bid)) {
        throw new Error("Bid must be higher than the current highest bid");
      }
      if (car.asking_price && bidValue <= parseFloat(car.asking_price)) {
        throw new Error("Bid must be higher than the starting bid");
      }
      const response = await carService.placeBid(
        token,
        parseInt(carId),
        bidValue.toString()
      );
      if (response.status === "success" && response.data?.bid) {
        setCar((prev) =>
          prev ? { ...prev, highest_bid: bidValue.toString() } : prev
        );
        toast.success("Bid placed successfully!");
      } else {
        toast.error(response.message || "Failed to place bid");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to place bid";
      toast.error(errorMessage);
    } finally {
      setIsBidding(false);
      setBidAmount("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-[#f26624] border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-12">{error}</div>;
  }

  if (!car) {
    return <div className="text-blue-500 text-center py-12">Car not found</div>;
  }

  // Handle features as an array or null, per the Car interface
  const featuresArr: string[] = Array.isArray(car.features)
    ? car.features.filter((f: string) => f.trim())
    : [];

  const displayPrice =
    car.listing_type === "auction" && car.highest_bid
      ? car.highest_bid
      : car.asking_price;

  return (
    <>
      <section className="px-6 md:px-16 lg:px-24 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="border rounded-lg overflow-hidden">
            <img
              src={selectedImage || "/placeholder.png"}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-96 object-cover"
            />
          </div>
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {car.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index}`}
                  className={`w-20 h-16 object-cover border rounded cursor-pointer ${
                    selectedImage === img
                      ? "border-[#262162]"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#262162]">
              {formatPrice(
                displayPrice,
                car.currency,
                car.listing_type === "auction",
                !!car.highest_bid
              )}
            </h2>
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                car.listing_type === "sale"
                  ? "bg-blue-600 text-white"
                  : car.listing_type === "hire"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {car.listing_type.charAt(0).toUpperCase() +
                car.listing_type.slice(1)}
            </span>
          </div>
          {car.listing_type === "auction" && (
            <div className="mt-4 p-4 bg-white border rounded-lg">
              <h3 className="text-lg font-semibold text-[#262162]">
                Auction Details
              </h3>
              <p className="text-gray-600">
                Current Highest Bid:{" "}
                {car.highest_bid
                  ? formatPrice(car.highest_bid, car.currency)
                  : "No bids yet"}
              </p>
              {user && token && isAuctionActive() && (
                <div className="mt-4">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid amount"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#262162]"
                    disabled={isBidding}
                  />
                  <button
                    onClick={handlePlaceBid}
                    disabled={isBidding}
                    className={`mt-2 w-full bg-[#262162] text-white py-2 rounded-lg hover:bg-[#1e1a55] transition ${
                      isBidding ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isBidding ? "Placing Bid..." : "Place Bid"}
                  </button>
                </div>
              )}
              {!user && (
                <p className="text-gray-600 mt-2">
                  Please{" "}
                  <Link
                    to="/authentication"
                    className="text-[#262162] underline"
                  >
                    log in
                  </Link>{" "}
                  to place a bid.
                </p>
              )}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#262162]">
            {car.brand} {car.model} ({car.year_of_manufacture || "N/A"})
          </h1>
          {featuresArr.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-[#262162]">Features</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {featuresArr.map((feature: string, idx: number) => (
                  <span
                    key={`${car.id}-feature-${idx}`}
                    className="bg-gray-200 text-gray-600 px-2 py-1 text-sm rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold mt-6">Specifications</h2>
          <ul className="mt-2 text-gray-600 space-y-2">
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Registration Number: {car.registration_number || "N/A"}
            </li>
            <li>
              <FaMapMarkerAlt className="inline-block mr-2 text-[#262162]" />
              Location: {car.location || "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Transmission: {car.transmission_type || "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Propulsion: {car.propulsion || "N/A"}
            </li>
            <li>
              <FaGasPump className="inline-block mr-2 text-[#262162]" />
              Fuel Type: {car.fuel_type || "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Condition: {car.condition || "N/A"}
            </li>
            <li>
              <FaRoad className="inline-block mr-2 text-[#262162]" />
              Mileage:{" "}
              {car.mileage
                ? `${car.mileage} ${car.mileage_unit || "KM"}`
                : "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Acceleration: {car.acceleration || "N/A"}
            </li>
            <li>
              <FaGasPump className="inline-block mr-2 text-[#262162]" />
              Consumption: {car.consumption_rate || "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Car Type: {car.car_type || "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Vehicle Category: {car.vehicle_category || "N/A"}
            </li>
            <li>
              <FaCarSide className="inline-block mr-2 text-[#262162]" />
              Tax: {car.price_tax || "N/A"}
            </li>
          </ul>
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold text-[#262162]">
              Seller Information
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <img
                src={
                  car.user?.showroom_corporate?.logo_url ||
                  car.user?.profile_photo ||
                  "/placeholder.png"
                }
                alt={car.user?.name || "Seller"}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-gray-900 font-semibold">
                  {car.user?.showroom_corporate?.name ||
                    car.user?.name ||
                    "Unknown"}
                </h3>
                {car.is_verified && (
                  <span className="text-green-600 text-sm flex items-center">
                    ✔ Verified Seller
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              <a
                href="https://wa.me/+254729389650"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#262162]"
                title="Contact via WhatsApp"
              >
                <img
                  src="https://simpleicons.org/icons/whatsapp.svg"
                  alt="WhatsApp"
                  className="w-6 h-6"
                />
                <span>+254729389650</span>
              </a>
              <a
                href="mailto:oridotalks@gmail.com"
                className="flex items-center gap-2 hover:text-[#262162]"
                title="Email via Gmail"
              >
                <img
                  src="https://simpleicons.org/icons/gmail.svg"
                  alt="Gmail"
                  className="w-6 h-6"
                />
                <span>oridotalks@gmail.com</span>
              </a>
              <a
                href="https://twitter.com/motiisasa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#262162]"
                title="Follow on Twitter"
              >
                <img
                  src="https://simpleicons.org/icons/twitter.svg"
                  alt="Twitter"
                  className="w-6 h-6"
                />
                <span>Twitter</span>
              </a>
              <a
                href="https://instagram.com/motiisasa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#262162]"
                title="Follow on Instagram"
              >
                <img
                  src="https://simpleicons.org/icons/instagram.svg"
                  alt="Instagram"
                  className="w-6 h-6"
                />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <SimilarCars
        carId={car.id}
        askingPrice={displayPrice ?? ""}
        currency={car.currency ?? "KES"}
      />
    </>
  );
};

export default CarDetails;
