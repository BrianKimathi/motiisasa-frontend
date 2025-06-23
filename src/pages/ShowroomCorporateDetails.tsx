import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const ShowroomCorporateDetails = () => {
  const { user, updateShowroomCorporate, loading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.showroom_corporate?.name || "",
    registration_number: user?.showroom_corporate?.registration_number || "",
    contact_email: user?.showroom_corporate?.contact_email || "",
    contact_phone: user?.showroom_corporate?.contact_phone || "",
    address: user?.showroom_corporate?.address || "",
    city: user?.showroom_corporate?.city || "",
    postal_code: user?.showroom_corporate?.postal_code || "",
    state: user?.showroom_corporate?.state || "",
  });
  const [logo, setLogo] = useState<File | null>(null);

  // Redirect if user is not authenticated or seller_type is not showroom/corporate
  useEffect(() => {
    if (!user) {
      navigate("/authentication");
    } else if (
      user.seller_type !== "showroom" &&
      user.seller_type !== "corporate"
    ) {
      console.log(`User seller type is: ${user.seller_type}`);
      navigate("/seller-type-selection");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Prevent rendering until redirect
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateShowroomCorporate({
        ...formData,
        logo: logo || undefined,
      });
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update showroom/corporate details";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 bg-white">
        <img src="/motiisasa.png" alt="Logo" width={80} height={80} />
        <h2 className="text-2xl text-[#262162] font-bold mt-4">
          Showroom/Corporate Details
        </h2>
        <p className="text-[#262162] text-sm text-center">
          Provide your business details to complete registration
        </p>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="w-full max-w-sm mt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Business Name
              </label>
              <input
                type="text"
                name="name"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter Business Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Registration Number
              </label>
              <input
                type="text"
                name="registration_number"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter Registration Number"
                value={formData.registration_number}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter Contact Email"
                value={formData.contact_email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Contact Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter Contact Phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Address
              </label>
              <input
                type="text"
                name="address"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter Address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                City
              </label>
              <input
                type="text"
                name="city"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter Postal Code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                State/County
              </label>
              <input
                type="text"
                name="state"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                placeholder="Enter State/County"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-[#262162] text-sm font-medium">
                Business Logo
              </label>
              <input
                type="file"
                name="logo"
                className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#f26624] text-white py-3 rounded-md font-semibold hover:bg-opacity-70 flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <ClipLoader color="#fff" size={20} />
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Finalize your business registration to start listing vehicles.
        </p>
      </div>

      <div className="hidden md:flex md:w-1/2 justify-center items-center bg-gray-50">
        <img
          src="/auth.png"
          alt="Business Details Illustration"
          width={800}
          height={400}
        />
      </div>
    </div>
  );
};

export default ShowroomCorporateDetails;
