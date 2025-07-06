import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { ClipLoader } from "react-spinners";

const Navbar: React.FC = () => {
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounced toggle functions to prevent rapid state changes
  const debouncedSetIsMenuOpen = useCallback(
    debounce((value: boolean) => setIsMenuOpen(value), 300),
    []
  );
  const debouncedSetIsDropdownOpen = useCallback(
    debounce((value: boolean) => setIsDropdownOpen(value), 300),
    []
  );

  const handleSellCarClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        navigate("/authentication");
      } else if (user.seller_type) {
        navigate("/sellcar");
      } else {
        navigate("/seller-type-selection");
      }
    },
    [user, navigate]
  );

  const handleProfileClick = useCallback(() => {
    debouncedSetIsDropdownOpen(!isDropdownOpen);
  }, [isDropdownOpen, debouncedSetIsDropdownOpen]);

  // Handle clicks outside dropdown to close it
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".dropdown-container")) {
        debouncedSetIsDropdownOpen(false);
      }
    },
    [debouncedSetIsDropdownOpen]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Cars for Sale", href: "/cars?listing_type=sale&page=1" },
    { label: "Cars for Hire", href: "/cars?listing_type=hire&page=1" },
    { label: "Auction Cars", href: "/cars?listing_type=auction&page=1" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  // Ensure navbar doesn't render until auth state is loaded
  if (authLoading) {
    return (
      <div className="bg-white shadow-md w-full fixed top-0 left-0 z-50 h-16 flex items-center justify-center">
        <ClipLoader color="#f26624" size={32} />
      </div>
    );
  }

  const profileImage = user?.profile_photo
    ? user.profile_photo.startsWith("http")
      ? user.profile_photo
      : `${
          import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
        }/Uploads/users/profile/${user.profile_photo}`
    : "/profile.png";

  return (
    <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3 sm:py-4">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" aria-label="Home">
            <img
              src="/motiisasa.png"
              alt="Motiisasa Logo"
              width={100}
              height={40}
              className="cursor-pointer object-contain w-20 sm:w-24 lg:w-28"
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            />
          </Link>
        </div>

        {/* Desktop Menu - Centered */}
        <div className="hidden lg:flex flex-1 justify-center space-x-4 xl:space-x-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className="relative group text-[#262162] text-sm xl:text-base font-medium 
                hover:text-[#f26624] transition-colors duration-300
                after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 
                after:bg-[#f26624] after:transition-all after:duration-300 
                hover:after:w-full py-2 px-1"
              aria-label={label}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Section - Sell Car Button + Profile/Login/Register */}
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
          {user ? (
            <>
              <button
                onClick={handleSellCarClick}
                className="bg-[#f26624] text-white px-3 py-2 rounded-full text-sm xl:text-base font-semibold 
                  hover:bg-[#262162] transition-colors duration-300"
                aria-label="Sell Car"
              >
                Sell Car
              </button>
              <div
                className="dropdown-container relative flex items-center cursor-pointer"
                onClick={handleProfileClick}
                role="button"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleProfileClick()}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={profileImage}
                    alt={`${user.name}'s Avatar`}
                    width={32}
                    height={32}
                    className="object-cover"
                    onError={(e) => (e.currentTarget.src = "/profile.png")}
                  />
                </div>
                <span className="ml-2 text-[#262162] text-sm xl:text-base font-medium hidden xl:inline">
                  {user.name}
                </span>
                <span
                  className={`ml-1 transform transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  } text-[#262162]`}
                >
                  ▼
                </span>
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10"
                    role="menu"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-[#262162] text-sm hover:bg-[#f26624] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        debouncedSetIsDropdownOpen(false);
                      }}
                      role="menuitem"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/seller-type-selection"
                      className="block px-4 py-2 text-[#262162] text-sm hover:bg-[#f26624] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        debouncedSetIsDropdownOpen(false);
                      }}
                      role="menuitem"
                    >
                      Change Seller Type
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        debouncedSetIsDropdownOpen(false);
                        navigate("/");
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 text-sm hover:bg-[#f26624] hover:text-white"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex space-x-2 xl:space-x-3">
              <button
                onClick={() => navigate("/authentication")}
                className="bg-[#f26624] text-white px-3 py-2 rounded-full text-sm xl:text-base font-semibold 
                  hover:bg-[#262162] transition-colors duration-300"
                aria-label="Login"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/authentication")}
                className="bg-[#f26624] text-white px-3 py-2 rounded-full text-sm xl:text-base font-semibold 
                  hover:bg-[#262162] transition-colors duration-300"
                aria-label="Register"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile/Tablet Menu Button */}
        <button
          className="lg:hidden z-50 relative text-3xl text-[#262162] p-2"
          onClick={() => {
            debouncedSetIsMenuOpen(!isMenuOpen);
            if (isMenuOpen) debouncedSetIsDropdownOpen(false);
          }}
          aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile/Tablet Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 sm:w-3/5 max-w-xs bg-white shadow-lg transform 
          transition-transform duration-300 ease-in-out z-40 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col items-start p-6 space-y-4 mt-16 overflow-y-auto h-full">
          {/* Mobile/Tablet Profile Section */}
          {user ? (
            <div className="dropdown-container w-full p-4 bg-gray-100 rounded-lg shadow">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={handleProfileClick}
                role="button"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleProfileClick()}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={profileImage}
                      alt={`${user.name}'s Avatar`}
                      width={48}
                      height={48}
                      className="object-cover"
                      onError={(e) => (e.currentTarget.src = "/profile.png")}
                    />
                  </div>
                  <div>
                    <p className="text-[#262162] font-semibold text-base">
                      {user.name}
                    </p>
                    <p className="text-[#262162] text-sm">
                      {user.seller_type
                        ? user.seller_type.charAt(0).toUpperCase() +
                          user.seller_type.slice(1)
                        : "Customer"}
                    </p>
                  </div>
                </div>
                <span
                  className={`transform transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  } text-[#262162]`}
                >
                  ▼
                </span>
              </div>
              {isDropdownOpen && (
                <div className="mt-4 space-y-1" role="menu">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-[#262162] text-sm hover:bg-[#f26624] hover:text-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      debouncedSetIsDropdownOpen(false);
                      debouncedSetIsMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/seller-type-selection"
                    className="block px-4 py-2 text-[#262162] text-sm hover:bg-[#f26624] hover:text-white rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      debouncedSetIsDropdownOpen(false);
                      debouncedSetIsMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    Change Seller Type
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      debouncedSetIsDropdownOpen(false);
                      debouncedSetIsMenuOpen(false);
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2 text-red-600 text-sm hover:bg-[#f26624] hover:text-white rounded"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full p-4 bg-gray-100 rounded-lg shadow space-y-2">
              <button
                onClick={() => {
                  navigate("/authentication");
                  debouncedSetIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 bg-[#f26624] text-white rounded-full text-sm font-semibold 
                  hover:bg-[#262162] transition-colors duration-300"
                aria-label="Login"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/register");
                  debouncedSetIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 bg-[#f26624] text-white rounded-full text-sm font-semibold 
                  hover:bg-[#262162] transition-colors duration-300"
                aria-label="Register"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile/Tablet Sell Car Button */}
          {user && (
            <button
              onClick={handleSellCarClick}
              className="w-full bg-[#f26624] text-white px-4 py-2 rounded-full text-base font-semibold 
                hover:bg-[#262162] transition-colors duration-300"
              aria-label="Sell Car"
            >
              Sell Car
            </button>
          )}

          {/* Mobile/Tablet Navigation Links */}
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              onClick={() => debouncedSetIsMenuOpen(false)}
              className="text-[#262162] text-base font-medium hover:text-[#f26624] transition-colors duration-300 py-1"
              aria-label={label}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
