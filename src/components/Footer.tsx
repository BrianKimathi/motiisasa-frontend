import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faYoutube,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/newsletter/subscribe",
        { email }
      );
      toast.success(response.data.message || "Subscribed successfully");
      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast.error(
          axiosError.response?.data?.message || "Failed to subscribe"
        );
      } else {
        toast.error("Failed to subscribe");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#262162] text-gray-300 py-6">
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
        {/* Company Section */}
        <div>
          <h3 className="text-white font-semibold mb-2">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-gray-400">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-gray-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-gray-400">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-gray-400">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-white font-semibold mb-2">Contact Us</h3>
          <ul className="space-y-2">
            <li className="flex justify-center md:justify-start items-center gap-2">
              <FontAwesomeIcon icon={faPhone} />
              <a href="tel:+254729389650" className="hover:text-gray-400">
                +254729389650
              </a>
            </li>
            <li className="flex justify-center md:justify-start items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} />
              <a
                href="mailto:info@motiisasa.com"
                className="hover:text-gray-400"
              >
                info@motiisasa.com
              </a>
            </li>
            <li className="flex justify-center md:justify-start items-center gap-2">
              <FontAwesomeIcon icon={faFacebook} />
              <a
                href="https://facebook.com/motiisasa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div>
          <h3 className="text-white font-semibold mb-2">Follow Us</h3>
          <ul className="space-y-2">
            <li className="flex justify-center md:justify-start items-center gap-2">
              <FontAwesomeIcon icon={faInstagram} />
              <a
                href="https://instagram.com/motiisasa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400"
              >
                Instagram
              </a>
            </li>
            <li className="flex justify-center md:justify-start items-center gap-2">
              <FontAwesomeIcon icon={faYoutube} />
              <a
                href="https://youtube.com/motiisasa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400"
              >
                Youtube
              </a>
            </li>
            <li className="flex justify-center md:justify-start items-center gap-2">
              <FontAwesomeIcon icon={faTwitter} />
              <a
                href="https://twitter.com/motiisasa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400"
              >
                Twitter
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription Section */}
        <div>
          <h3 className="text-white font-semibold mb-2">
            Subscribe to Newsletter
          </h3>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="p-2 rounded-md text-gray-900 bg-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#f26624] text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center text-gray-400 mt-6 text-sm">
        © {new Date().getFullYear()} Motiisasa. All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
