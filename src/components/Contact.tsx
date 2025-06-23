"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faXTwitter, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Layout from "../components/Layout";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  [key: string]: string | undefined; // Index signature to allow string indexing
}

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    if (!name) newErrors.name = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.message) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const name = `${formData.firstName} ${formData.lastName}`.trim();
    const message = `
      Message: ${formData.message}
      Phone: ${formData.phone || "Not provided"}
      Services Interested In: ${
        selectedServices.length > 0 ? selectedServices.join(", ") : "None"
      }
    `;

    try {
      const response = await axios.post("http://127.0.0.1:5000/contact", {
        name,
        email: formData.email,
        message,
      });
      if (response.status === 201) {
        toast.success("Message sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
        });
        setSelectedServices([]);
      } else {
        throw new Error(response.data.message || "Failed to send message");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage =
        err.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <Layout>
      <section className="px-6 md:px-16 lg:px-24 py-12 bg-gray-50 min-h-screen">
        {/* Title */}
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-[#262162]">
            Contact Our Team
          </h1>
          <p className="text-[#262162] mt-2 max-w-2xl mx-auto text-lg">
            Have questions about our platform or services? Our team is here to
            assist you 24/7. Get in touch and start exploring in minutes!
          </p>
        </div>

        {/* Form & Contact Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          {/* Left: Contact Form */}
          <div className="md:col-span-2 bg-white p-8 shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#f26624] transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className={`border p-3 rounded-lg w-full mt-4 focus:ring-2 focus:ring-[#f26624] transition ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254 700 000 000"
                className="border p-3 rounded-lg w-full mt-4 focus:ring-2 focus:ring-[#f26624] transition border-gray-300"
              />
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Leave us a message..."
                  className={`border p-3 rounded-lg w-full mt-4 h-32 focus:ring-2 focus:ring-[#f26624] transition ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Services */}
              <h3 className="text-lg text-[#262162] font-semibold mt-6">
                Services
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {["Car Sale", "Car Hire", "Auctioned Cars"].map((service) => (
                  <label
                    key={service}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className={`w-5 h-5 transition-colors ${
                        selectedServices.includes(service)
                          ? "text-[#262162]"
                          : "text-gray-400"
                      }`}
                      onClick={() => toggleService(service)}
                    />
                    <span
                      className="text-[#262162] hover:text-[#f26624] transition"
                      onClick={() => toggleService(service)}
                    >
                      {service}
                    </span>
                  </label>
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-[#f26624] to-[#262162] text-white py-3 text-lg font-medium rounded-lg mt-6 transition-all ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gradient-to-r hover:from-[#262162] hover:to-[#f26624]"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-8">
            {/* Chat with Us */}
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold text-[#262162]">
                Chat with Us
              </h3>
              <p className="text-[#262162] mt-1">
                Reach our friendly team instantly via your preferred channel.
              </p>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="https://wa.me/+254729389650"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f26624] hover:text-[#262162] flex items-center gap-2 transition"
                  >
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      className="w-5 h-5 text-green-600"
                    />
                    Message us on WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@motiisasa.com"
                    className="text-[#f26624] hover:text-[#262162] flex items-center gap-2 transition"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                    support@motiisasa.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/motiisasa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f26624] hover:text-[#262162] flex items-center gap-2 transition"
                  >
                    <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5" />
                    Message us on X
                  </a>
                </li>
              </ul>
            </div>

            {/* Call Us */}
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold text-[#262162]">Call Us</h3>
              <p className="text-[#262162] mt-1">
                Available Mon-Fri, 8 AM to 5 PM EAT.
              </p>
              <a
                href="tel:+254729389650"
                className="text-[#f26624] hover:text-[#262162] font-semibold flex items-center gap-2 mt-2 transition"
              >
                <FontAwesomeIcon icon={faPhone} className="w-5 h-5" />
                +254 729 389 650
              </a>
            </div>

            {/* Visit Us */}
            <div className="animate-slide-in">
              <h3 className="text-lg font-semibold text-[#262162]">Visit Us</h3>
              <p className="text-[#262162] mt-1">
                Meet us at our Nairobi headquarters.
              </p>
              <a
                href="https://maps.google.com/?q=Westlands,+Nairobi,+Kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f26624] hover:text-[#262162] font-semibold flex items-center gap-2 mt-2 transition"
              >
                <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5" />
                Westlands, Nairobi, Kenya
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
