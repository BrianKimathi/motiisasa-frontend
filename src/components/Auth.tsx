import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ClipLoader } from "react-spinners";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    state: "",
  });
  const { login, register, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    await register(
      formData.name,
      formData.email,
      formData.phone,
      formData.password,
      formData.state
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 bg-white">
        <img src="/motiisasa.png" alt="Logo" className="w-[80px] h-[80px]" />
        <h2 className="text-2xl text-[#262162] font-bold mt-4">Welcome Back</h2>
        <p className="text-[#262162] text-sm">Please enter your details</p>

        <div className="flex bg-[#262162] rounded-full mt-6 p-1 w-full max-w-sm">
          <button
            className={`w-1/2 py-2 rounded-full transition ${
              activeTab === "signin"
                ? "bg-white shadow font-semibold"
                : "text-[#f26624]"
            }`}
            onClick={() => setActiveTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`w-1/2 py-2 rounded-full transition ${
              activeTab === "signup"
                ? "bg-white shadow font-semibold"
                : "text-[#f26624]"
            }`}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>
        </div>

        <div className="w-full max-w-sm mt-6">
          {activeTab === "signin" ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#f26624] text-white py-3 rounded-md font-semibold hover:bg-opacity-70 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : "Login"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Enter Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Enter Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-[#262162] text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="w-full border p-3 rounded-md focus:ring focus:ring-[#e41d48]"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
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
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#f26624] text-white py-3 rounded-md font-semibold hover:bg-opacity-70 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : "Register"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Or Continue With</p>
            <div className="flex justify-center gap-4 mt-2">
              <img
                src="/google.png"
                alt="Google"
                className="w-[40px] h-[40px] cursor-pointer"
              />
              <img
                src="/apple.png"
                alt="Apple"
                className="w-[40px] h-[40px] cursor-pointer"
              />
              <img
                src="/facebook.png"
                alt="Facebook"
                className="w-[40px] h-[40px] cursor-pointer"
              />
            </div>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            Join millions of smart investors who trust us to manage their
            finances.
          </p>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 justify-center items-center bg-gray-50">
        <img
          src="/auth.png"
          alt="Auth Illustration"
          className="w-[800px] h-[400px]"
        />
      </div>
    </div>
  );
};

export default Auth;
