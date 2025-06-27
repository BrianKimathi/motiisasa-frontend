import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface User {
  name?: string;
  email?: string;
}

const HeroSection = () => {
  const { user, authLoading } = useAuth() as {
    user: User | null;
    authLoading: boolean;
  };

  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-between py-12 md:py-20 bg-gray-100">
      {/* Left Column - Text Content */}
      <div className="w-full md:w-1/2 px-6 md:px-16 text-center md:text-left space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold text-[#262162] leading-tight">
          Hire, Sell, or Auction Your Car with Motiisasa
        </h1>
        <p className="text-[#262162] text-lg">
          Motiisasa is your one-stop platform for all things cars. Easily hire a
          vehicle for your next trip, sell your car hassle-free, or auction it
          to the highest bidder. For those facing car loan challenges, we offer
          a unique debt-offset solution to prevent repossession and resolve
          financial stress transparently. Discover a simple, trusted way to
          drive your journey forward.
        </p>
        <div className="flex justify-center md:justify-start space-x-4">
          <Link to="/cars?listing_type=hire&is_published=true&page=1">
            <button className="px-6 py-3 bg-white text-[#262162] border border-[#f26624] rounded-md hover:bg-[#f26624] transition">
              Hire a Car
            </button>
          </Link>
          {!authLoading && user && (
            <>
              <Link to="/sellcar">
                <button className="px-6 py-3 bg-[#f26624] text-white rounded-md hover:bg-[#262162] transition">
                  Sell Your Car
                </button>
              </Link>
              <Link to="/auctioncar">
                <button className="px-6 py-3 bg-[#262162] text-white rounded-md hover:bg-[#f26624] transition">
                  Auction Your Car
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
        <img
          src="/tx.png"
          alt="Car for Hire, Sale, or Auction"
          className="absolute inset-0 w-full h-full object-contain lg:object-contain md:object-cover sm:object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;
