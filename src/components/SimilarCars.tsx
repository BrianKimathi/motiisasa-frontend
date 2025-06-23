import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { carService } from "../services/carService";
import type { Car, CarResponse } from "../services/carService";

interface SimilarCarsProps {
  carId: number;
  askingPrice: string | null | undefined;
  currency: string | null;
}

const SimilarCars = ({ carId, askingPrice, currency }: SimilarCarsProps) => {
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarCars = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("SimilarCars Props:", { carId, askingPrice, currency });
        if (!askingPrice || !currency || isNaN(parseFloat(askingPrice))) {
          throw new Error("Invalid price or currency");
        }
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token available");
        }
        const response: CarResponse = await carService.getSimilarCars(
          token,
          carId,
          askingPrice,
          currency,
          1,
          4
        );
        console.log(
          "SimilarCars API Response:",
          JSON.stringify(response, null, 2)
        );
        if (response.status === "success" && response.data?.cars) {
          setSimilarCars(response.data.cars);
        } else {
          throw new Error(response.message || "Failed to fetch similar cars");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch similar cars";
        console.error("Error fetching similar cars:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (askingPrice && currency && !isNaN(parseFloat(askingPrice))) {
      fetchSimilarCars();
    } else {
      console.warn("Skipping fetch due to invalid price or currency:", {
        askingPrice,
        currency,
      });
      setLoading(false);
      setError("Invalid price or currency");
    }
  }, [carId, askingPrice, currency]);

  if (loading || error || similarCars.length === 0) {
    console.log("SimilarCars not rendered:", {
      loading,
      error,
      carCount: similarCars.length,
    });
    return null;
  }

  const formatPrice = (
    price: string | null | undefined,
    currency: string | null
  ): string => {
    if (!price || !currency) return "Price not available";
    const num = Number(price);
    if (isFinite(num)) {
      const currencyPrefix = currency === "KES" ? "Kes" : currency;
      return `${currencyPrefix} ${num.toLocaleString()}`;
    }
    return price ? price : "Unknown";
  };

  return (
    <section className="px-6 md:px-16 lg:px-24 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
        Similar Vehicles
      </h1>
      <p className="text-center text-gray-600 mt-2">
        Other cars in the same price range
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {similarCars.map((car) => (
          <Link key={car.id} to={`/cardetails?id=${car.id}`} className="group">
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition h-[510px]">
              <div className="relative">
                <img
                  src={car.images?.[0] || "/placeholder.png"}
                  alt={`${car.brand || "Car"} ${car.model || "Model"}`}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {car.status || "Available"}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {car.year_of_manufacture || ""} {car.brand || "Unknown"}{" "}
                  {car.model || "Model"}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {car.features && car.features.length > 0 ? (
                    car.features.map((tag: string, index: number) => (
                      <span
                        key={`${car.id}-tag-${index}`}
                        className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span>No features listed</span>
                  )}
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  {car.features && car.features.length > 0
                    ? `${car.features.join(", ").slice(0, 50)}...`
                    : "No details available"}
                </p>
              </div>
              <hr className="border-gray-300" />
              <div className="p-4 flex justify-between items-center">
                <span className="text-gray-900 font-semibold text-lg">
                  {formatPrice(car.asking_price, car.currency)}
                </span>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                    car.user?.seller_type === "individual"
                      ? "bg-black text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {car.user?.seller_type === "individual"
                    ? "PRIVATE SELLER"
                    : car.user?.seller_type
                    ? car.user.seller_type.toUpperCase()
                    : "UNKNOWN"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SimilarCars;