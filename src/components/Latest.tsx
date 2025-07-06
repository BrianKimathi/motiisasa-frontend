import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";
import type { Car, CarResponse } from "../types/types";

const Latest = () => {
  const { user, authLoading } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestCars = async (retryCount = 2) => {
      if (authLoading || !isMounted) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://admin.motiisasa.co.ke/api/car/cars/latest",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch latest cars");
        }

        const responseData: CarResponse = await response.json();
        console.log("getLatestCars response:", responseData);

        if (responseData.status === "success" && responseData.data?.cars) {
          setCars(responseData.data.cars.slice(0, 4));
        } else {
          const message = responseData.message || "Failed to load cars";
          setError(message);
          console.error("getLatestCars response error:", responseData);
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        let errorMessage = err.message || "Failed to load latest cars";
        console.error("getLatestCars error:", {
          message: errorMessage,
          details: err,
        });
        if (retryCount > 0) {
          console.log(`Retrying... Attempts left: ${retryCount}`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
          await fetchLatestCars(retryCount - 1);
        } else {
          setError(errorMessage);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLatestCars();
    return () => {
      isMounted = false;
    }; // Cleanup on unmount
  }, [authLoading]);

  if (authLoading)
    return (
      <div className="text-center mt-8">
        <ClipLoader color="#f26624" size={40} />
      </div>
    );

  return (
    <section className="w-full items-center justify-between py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-[#262162] text-center">
        The Latest Car Collection
      </h2>
      <p className="text-[#262162] mt-2 max-w-2xl mx-auto text-center">
        At our company, we understand that your car is an investment, and we're
        committed to helping you protect that investment.
      </p>

      {loading ? (
        <div className="text-center mt-8">
          <ClipLoader color="#f26624" size={40} />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center mt-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 px-12 md:grid-cols-4 gap-6 mt-8">
          {cars.map((car) => (
            <Link to={`/cardetails?id=${car.id}`} key={car.id}>
              <div className="relative h-64 rounded-lg overflow-hidden group shadow-lg">
                <img
                  src={car.images?.length ? car.images[0] : "/cars.png"}
                  alt={`${car.brand || "Car"} ${car.model || ""}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-90"
                />
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-semibold">{`${
                    car.brand || "Unknown"
                  } ${car.model || "Model"}`}</h3>
                  <p className="text-xl font-bold">
                    {car.asking_price && car.currency
                      ? `${car.currency} ${car.asking_price}`
                      : "Price on request"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/cars">
          <button className="bg-[#f26624] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#262162] transition">
            BUY CAR
          </button>
        </Link>
        {!authLoading && user && (
          <Link to="/sellcar">
            <button className="border border-[#f26624] text-[#f26624] px-6 py-3 rounded-lg font-medium hover:bg-[#262162] hover:text-white transition">
              SELL CAR
            </button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default Latest;
