import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const UserTypeSelection = () => {
  const [userType, setUserType] = useState<"individual" | "showroom" | null>(
    null
  );
  const { user, updateSellerType, loading } = useAuth();

  const handleSubmit = async () => {
    if (!user || !userType) {
      toast.error("Please select a user type and ensure you are logged in.");
      return;
    }
    try {
      await updateSellerType(userType); // Pass sellerType string directly
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
          Choose Your Role
        </h2>
        <p className="text-[#262162] text-sm text-center">
          Select whether you want to join as a customer or a seller
        </p>

        <div className="w-full max-w-sm mt-6 space-y-4">
          <button
            className={`w-full py-3 rounded-md font-semibold border transition ${
              userType === "individual"
                ? "bg-[#f26624] text-white border-[#f26624]"
                : "border-[#262162] text-[#262162] hover:bg-[#f26624] hover:text-white"
            }`}
            onClick={() => setUserType("individual")}
          >
            Register as Customer
          </button>
          <button
            className={`w-full py-3 rounded-md font-semibold border transition ${
              userType === "showroom"
                ? "bg-[#f26624] text-white border-[#f26624]"
                : "border-[#262162] text-[#262162] hover:bg-[#f26624] hover:text-white"
            }`}
            onClick={() => setUserType("showroom")}
          >
            Register as Seller
          </button>

          <button
            className={`w-full bg-[#f26624] text-white py-3 rounded-md font-semibold hover:bg-opacity-70 mt-4 flex justify-center items-center ${
              !userType ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={!userType || loading}
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Continue"}
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Join our platform to buy or sell vehicles with ease.
        </p>
      </div>

      <div className="hidden md:flex md:w-1/2 justify-center items-center bg-gray-50">
        <img
          src="/auth.png"
          alt="User Type Illustration"
          width={800}
          height={400}
        />
      </div>
    </div>
  );
};

export default UserTypeSelection;
