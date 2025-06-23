import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faFileContract,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

const Steps = () => {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-12  relative">
      {/* Content */}
      <div className="relative z-10 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#262162]">
          Owning, Selling, Auctioning, or Hiring a Car is as Simple as
        </h2>
        <h3 className="text-3xl md:text-4xl font-bold text-[#262162] mt-2">
          One, Two, Three
        </h3>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4 md:px-12">
        {/* Step 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto bg-orange-100 rounded-full">
            <FontAwesomeIcon icon={faCar} className="text-2xl text-[#262162]" />
          </div>
          <h4 className="text-[#f26624] font-semibold mt-3">ONE</h4>
          <p className="text-lg text-[#262162] font-medium">Select Vehicle</p>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto bg-orange-100 rounded-full">
            <FontAwesomeIcon
              icon={faFileContract}
              className="text-2xl text-[#262162]"
            />
          </div>
          <h4 className="text-[#f26624] font-semibold mt-3">TWO</h4>
          <p className="text-lg text-[#262162] font-medium">Enquire</p>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto bg-orange-100 rounded-full">
            <FontAwesomeIcon
              icon={faCreditCard}
              className="text-2xl text-[#262162]"
            />
          </div>
          <h4 className="text-[#f26624] font-semibold mt-3">THREE</h4>
          <p className="text-lg text-[#262162] font-medium">Pay</p>
        </div>
      </div>
    </section>
  );
};

export default Steps;
