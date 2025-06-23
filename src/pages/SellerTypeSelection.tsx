import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const SellerTypeSelection = () => {
  const [sellerType, setSellerType] = useState<
    "individual" | "showroom" | "corporate" | null
  >(null);
  const { user, updateSellerType, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user || !sellerType) {
      toast.error("Please select a seller type and ensure you are logged in.");
      return;
    }
    try {
      await updateSellerType(sellerType); // Pass sellerType directly
      if (sellerType === "showroom" || sellerType === "corporate") {
        navigate("/showroom-corporate-details");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update seller type";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 bg-white">
        <img src="/motiisasa.png" alt="Logo" width={80} height={80} />
        <h2 className="text-2xl text-[#262162] font-bold mt-4">
          Select Seller Type
        </h2>
        <p className="text-[#262162] text-sm text-center">
          Choose how you want to list your vehicles
        </p>

        <div className="w-full max-w-sm mt-6 space-y-4">
          <button
            className={`w-full py-3 rounded-md font-semibold border transition ${
              sellerType === "individual"
                ? "bg-[#f26624] text-white border-[#f26624]"
                : "border-[#262162] text-[#262162] hover:bg-[#f26624] hover:text-white"
            }`}
            onClick={() => setSellerType("individual")}
          >
            Individual Seller
          </button>
          <button
            className={`w-full py-3 rounded-md font-semibold border transition ${
              sellerType === "showroom"
                ? "bg-[#f26624] text-white border-[#f26624]"
                : "border-[#262162] text-[#262162] hover:bg-[#f26624] hover:text-white"
            }`}
            onClick={() => setSellerType("showroom")}
          >
            Showroom Seller
          </button>
          <button
            className={`w-full py-3 rounded-md font-semibold border transition ${
              sellerType === "corporate"
                ? "bg-[#f26624] text-white border-[#f26624]"
                : "border-[#262162] text-[#262162] hover:bg-[#f26624] hover:text-white"
            }`}
            onClick={() => setSellerType("corporate")}
          >
            Corporate Seller
          </button>

          <button
            className={`w-full bg-[#f26624] text-white py-3 rounded-md font-semibold hover:bg-opacity-70 mt-4 flex justify-center items-center ${
              !sellerType ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={!sellerType || loading}
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Continue"}
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Select the seller type that best suits your needs.
        </p>
      </div>

      <div className="hidden md:flex md:w-1/2 justify-center items-center bg-gray-50">
        <img
          src="/auth.png"
          alt="Seller Type Illustration"
          width={800}
          height={400}
        />
      </div>
    </div>
  );
};

export default SellerTypeSelection;
