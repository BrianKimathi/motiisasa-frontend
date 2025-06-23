import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { user, verifyOtp, resendOtp, loading } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^[0-9]{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      setOtp(newOtp);
      document.getElementById(`otp-input-5`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("User not found. Please log in again.");
      return;
    }
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      alert("Please enter a 6-digit OTP");
      return;
    }
    try {
      await verifyOtp(user.id, otpCode);
      // Optionally redirect or show success message
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to verify OTP";
      alert(errorMessage);
    }
  };

  const handleResend = async () => {
    if (!user) {
      alert("User not found. Please log in again.");
      return;
    }
    try {
      await resendOtp(user.id);
      alert("OTP resent successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to resend OTP";
      alert(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 bg-white">
        <img src="/motiisasa.png" alt="Logo" width={80} height={80} />
        <h2 className="text-2xl text-[#262162] font-bold mt-4">
          Verify Your Account
        </h2>
        <p className="text-[#262162] text-sm text-center">
          Enter the 6-digit OTP sent to your email
        </p>

        <div className="w-full max-w-sm mt-6">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 border p-3 rounded-md text-center text-[#262162] text-lg focus:ring focus:ring-[#e41d48]"
                  placeholder="-"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  id={`otp-input-${index}`}
                />
              ))}
            </div>

            <p className="text-[#262162] text-sm text-center mt-4">
              Didn’t receive the code?{" "}
              <button
                type="button"
                className="text-[#f26624] hover:underline"
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader color="#f26624" size={16} />
                ) : (
                  "Resend OTP"
                )}
              </button>
            </p>

            <button
              type="submit"
              className="w-full bg-[#f26624] text-white py-3 rounded-md font-semibold hover:bg-opacity-70 mt-6 flex justify-center items-center"
              disabled={loading}
            >
              {loading ? <ClipLoader color="#fff" size={20} /> : "Verify OTP"}
            </button>
          </form>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          Securely verify your account to start exploring our services.
        </p>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:flex md:w-1/2 justify-center items-center bg-gray-50">
        <img
          src="/auth.png"
          alt="Verification Illustration"
          width={800}
          height={400}
        />
      </div>
    </div>
  );
};

export default OtpVerification;
