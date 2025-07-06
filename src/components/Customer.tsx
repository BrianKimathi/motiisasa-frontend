import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface Feedback {
  id: number;
  name: string;
  review: string;
  is_published: boolean;
  created_at: string;
}

interface FeedbackResponse {
  status: "success" | "error";
  message: string;
  data: {
    feedback?: Feedback[];
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
    id?: number;
    name?: string;
    email?: string;
    review?: string;
    is_published?: boolean;
    created_at?: string;
  };
}

const Customer = () => {
  const { user, authLoading } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    review: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: "1",
          per_page: "10",
        });
        const response = await fetch(
          `https://admin.motiisasa.co.ke/api/feedback/published?${params}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch feedback");
        }

        const responseData: FeedbackResponse = await response.json();
        if (responseData.status === "success" && responseData.data.feedback) {
          setFeedbackList(
            responseData.data.feedback.filter((f) => f.is_published)
          );
        } else {
          throw new Error(responseData.message || "Failed to load feedback");
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        toast.error(err.message || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Update form data for logged-in users
  useEffect(() => {
    if (user && !authLoading) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user, authLoading]);

  // Automatic scroll effect
  useEffect(() => {
    if (feedbackList.length <= 1 || isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === feedbackList.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [feedbackList.length, isPaused]);

  const handlePrev = () => {
    setIsPaused(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? feedbackList.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setIsPaused(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === feedbackList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.review) {
      toast.error("Please fill in all fields");
      return;
    }

    setFormSubmitting(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        "https://admin.motiisasa.co.ke/api/feedback",
        {
          method: "POST",
          headers,
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback");
      }

      const responseData: FeedbackResponse = await response.json();
      if (responseData.status === "success") {
        toast.success(
          "Feedback submitted successfully! Awaiting admin approval."
        );
        setFormData({ ...formData, review: "" });
      } else {
        throw new Error(responseData.message || "Failed to submit feedback");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <section className="px-6 md:px-16 lg:px-24 py-12 flex flex-col md:flex-row items-center gap-10">
      {/* Left Side - Title */}
      <div className="w-full md:w-1/3">
        <h2 className="text-3xl md:text-4xl font-bold text-[#262162]">
          What are Our Customers Saying About Our Company?
        </h2>
      </div>

      {/* Right Side - Testimonial Card */}
      <div
        className="w-full md:w-2/3 bg-white shadow-lg rounded-lg p-6 relative flex flex-col items-center text-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {loading ? (
          <div>Loading feedback...</div>
        ) : feedbackList.length === 0 ? (
          <div className="text-[#262162]">No feedback available yet.</div>
        ) : (
          <>
            {/* Profile Image with Yellow Background */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-yellow-400 rounded-full"></div>
              <img
                src="/profile.png"
                alt={feedbackList[currentIndex].name}
                width={128}
                height={128}
                className="relative z-10 object-contain rounded-full"
              />
            </div>

            {/* Testimonial Text */}
            <p className="text-[#262162] italic mt-4 max-w-lg">
              {feedbackList[currentIndex].review}
            </p>

            {/* Customer Name */}
            <p className="mt-4 font-bold text-[#f26624]">
              {feedbackList[currentIndex].name}
            </p>
            <p className="text-sm text-[#262162]">Verified Customer</p>

            {/* Navigation Arrows */}
            <div className="flex justify-center items-center gap-6 mt-6">
              <button
                onClick={handlePrev}
                className="text-[#f26624] hover:text-[#262162]"
                disabled={feedbackList.length <= 1}
                aria-label="Previous feedback"
              >
                <FaArrowLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="text-[#f26624] hover:text-[#262162]"
                disabled={feedbackList.length <= 1}
                aria-label="Next feedback"
              >
                <FaArrowRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Feedback Form */}
      <div className="w-full max-w-md mt-10 mx-auto">
        <h3 className="text-2xl font-bold text-[#262162] text-center mb-4">
          Share Your Feedback
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your Name"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26624]"
            disabled={!!user || formSubmitting}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Your Email"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26624]"
            disabled={!!user || formSubmitting}
          />
          <textarea
            name="review"
            value={formData.review}
            onChange={handleInputChange}
            placeholder="Your Feedback"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26624] h-32 resize-none"
            disabled={formSubmitting}
          />
          <button
            type="submit"
            className="bg-[#f26624] text-white px-6 py-3 rounded-md font-medium hover:bg-[#262162] transition disabled:opacity-50"
            disabled={formSubmitting}
          >
            {formSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Customer;
