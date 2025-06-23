import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faHandshake,
  faGavel,
  faRoad,
} from "@fortawesome/free-solid-svg-icons";

// Function to handle counting effect
const useCountUp = (endValue: number, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(percentage * endValue));
      if (progress < duration) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(endValue);
      }
    };
    requestAnimationFrame(updateCount);
  }, [endValue, duration]);

  return count;
};

const AboutHero = () => {
  // Animated counters
  const carHire = useCountUp(1050);
  const carSelling = useCountUp(150);
  const auctionedCars = useCountUp(3000);
  const totalListings = useCountUp(3400);

  return (
    <section className="px-6 md:px-16 lg:px-24 py-12">
      {/* Title & Description */}
      <div className="text-center md:text-left max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#262162]">
          About Motiisasa
        </h1>
        <p className="text-[#262162] mt-4">
          At Motiisasa, we specialize in helping individuals facing car loan
          defaults by offering a unique solution to help offset their debt. If
          you&apos;re at risk of losing your vehicle, we can step in to provide
          an alternative that benefits you.<br></br>
          <br></br>
          Our process is simple: we work directly with defaulters, taking over
          the debt on their car loan to prevent repossession. In return, we hold
          the car until it&apos;s sold. Once the car is sold, the proceeds are
          used to pay off the loan, and we apply a fixed 10% interest to the
          amount received. This ensures you get a fair resolution while also
          helping us recover the funds needed to cover the loan and our
          operational costs.<br></br>
          <br></br>
          Our goal is to provide a hassle-free way out of financial hardship
          while maintaining transparency and fairness throughout the process.
          Whether you&apos;re looking to avoid repossession or simply need a
          manageable solution, we&apos;re here to help.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {/* Car Hire */}
        <div className="bg-[#262162] text-white p-6 rounded-lg text-center">
          <FontAwesomeIcon icon={faCar} className="text-3xl mb-3" />
          <h2 className="text-2xl text-[#f26624] font-bold">{carHire}+</h2>
          <p className="text-sm">Cars Available for Hire</p>
        </div>

        {/* Car Selling */}
        <div className="bg-[#262162] text-white p-6 rounded-lg text-center">
          <FontAwesomeIcon icon={faHandshake} className="text-3xl mb-3" />
          <h2 className="text-2xl text-[#f26624] font-bold">{carSelling}+</h2>
          <p className="text-sm">Successful Car Sales</p>
        </div>

        {/* Auctioned Cars */}
        <div className="bg-[#262162] text-white p-6 rounded-lg text-center">
          <FontAwesomeIcon icon={faGavel} className="text-3xl mb-3" />
          <h2 className="text-2xl text-[#f26624] font-bold">
            {auctionedCars}+
          </h2>
          <p className="text-sm">Auctioned Vehicles</p>
        </div>

        {/* Total Listings */}
        <div className="bg-[#262162] text-white p-6 rounded-lg text-center">
          <FontAwesomeIcon icon={faRoad} className="text-3xl mb-3" />
          <h2 className="text-2xl text-[#f26624] font-bold">
            {totalListings}+
          </h2>
          <p className="text-sm">Total Car Listings</p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
