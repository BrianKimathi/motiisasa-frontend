import { Link } from "react-router-dom"; // Replaced next/link
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
          Find The Simplest Way to Drive Revolution With MotiiSasa.
        </h1>
        <p className="text-[#262162] text-lg">
          Motiisasa specializes in assisting individuals facing car loan
          defaults by offering a unique debt-offset solution. If you&apos;re at
          risk of losing your vehicle, we step in by taking over the loan to
          prevent repossession. We hold the car until it&apos;s sold, using the
          proceeds to pay off the debt while applying a fixed 10% interest to
          the amount received. This approach ensures a fair resolution while
          covering loan repayment and operational costs. Our goal is to provide
          a transparent, hassle-free way to overcome financial hardship,
          offering a practical and manageable solution for those in need.
        </p>
        <div className="flex justify-center md:justify-start space-x-4">
          <Link to="/cars?listing_type=hire&is_published=true&page=1">
            <button className="px-6 py-3 bg-white text-[#262162] border border-[#f26624] rounded-md hover:bg-[#f26624] transition">
              Book Your Ride
            </button>
          </Link>
          {!authLoading && user && (
            <Link to="/sellcar">
              <button className="px-6 py-3 bg-[#f26624] text-white rounded-md hover:bg-[#262162] transition">
                Sell Your Car
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="w-full md:w-1/2 relative h-[300px] md:h-[500px]">
        <img
          src="/tx.png"
          alt="Green Car"
          className="absolute inset-0 w-full h-full object-contain lg:object-contain md:object-cover sm:object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;
