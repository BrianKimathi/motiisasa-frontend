import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { carService } from "../services/carService";
import type { Car, CarResponse } from "../services/carService";
import { FaCarSide, FaMapMarkerAlt, FaGasPump, FaRoad } from "react-icons/fa";
import Layout from "../components/Layout";
import SimilarCars from "../components/SimilarCars";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const formatPrice = (
  price: string | null | undefined,
  currency: string | null,
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
        if (
          response.status === "success" &&
          response.data &&
          response.data.car
        ) {
          setCar(response.data.car);
          setSelectedImage(response.data.car.images?.[0] || "/placeholder.png");
          toast.success("Car retrieved successfully!");
        } else {
          const message = response.message || "Car data not found";
          setError(message);
          toast.error(message);
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

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  if (!car) return <div className="text-center mt-8">No car found</div>;

  const displayPrice =
    car.listing_type === "auction" && car.highest_bid
      ? car.highest_bid
      : car.asking_price;

  return (
    <Layout>
      <div className="car-details max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="car-images">
            <img
              src={selectedImage || "/placeholder.png"}
              alt={`${car.brand || "Car"} ${car.model || ""}`}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />
            <div className="thumbnail-gallery flex flex-wrap items-center gap-2 overflow-x-auto">
              {car.images?.length ? (
                car.images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index}`}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer ${
                      selectedImage === img ? "border-2 border-blue-500" : ""
                    }`}
                    width={80}
                    height={80}
                  />
                ))
              ) : (
                <div>No images available</div>
              )}
            </div>
          </div>
          <div className="car-info">
            <h1 className="text-3xl font-bold mb-2">
              {car.brand || "Unknown"} {car.model || "Model"}
            </h1>
            <p className="text-xl font-semibold text-gray-700 mb-4">
              {formatPrice(
                displayPrice,
                car.currency,
                car.listing_type === "auction",
                !!car.highest_bid
              )}
            </p>
            <div className="car-specs grid grid-cols-2 gap-4 mb-6">
              <p className="flex items-center gap-2">
                <FaCarSide /> {car.year_of_manufacture || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt /> {car.location || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaGasPump /> {car.fuel_type || "N/A"}
              </p>
              <p className="flex items-center gap-2">
                <FaRoad />{" "}
                {car.mileage
                  ? `${car.mileage} ${car.mileage_unit || ""}`
                  : "N/A"}
              </p>
            </div>
            {car.listing_type === "auction" && (
              <div className="auction-info mb-6">
                <p className="text-gray-600">
                  Auction Ends:{" "}
                  {car.auction_end_time
                    ? new Date(car.auction_end_time).toLocaleString()
                    : "N/A"}
                </p>
                {isAuctionActive() && (
                  <div className="bid-section mt-4 flex gap-4">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      disabled={isBidding}
                      className="border p-2 rounded w-full"
                    />
                    <button
                      onClick={handlePlaceBid}
                      disabled={isBidding}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {isBidding ? "Placing Bid..." : "Place Bid"}
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="seller-info bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
              <p>Name: {car.user?.name || "N/A"}</p>
              <p>Email: {car.user?.email || "N/A"}</p>
              <p>Phone: {car.user?.phone || "N/A"}</p>
              {car.user?.showroom_corporate && (
                <p>Showroom: {car.user.showroom_corporate.name || "N/A"}</p>
              )}
            </div>
          </div>
        </div>
        <SimilarCars
          carId={car.id}
          askingPrice={displayPrice ?? ""}
          currency={car.currency ?? "KES"}
        />
      </div>
    </Layout>
  );
};

export default CarDetails;
