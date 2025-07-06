import { useState, useEffect } from "react";

const Assurance = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      img: "/usichotwe-motiisasa.jpg",
      alt: "Woman with car model",
      title: "Hire or Sell with Confidence",
      description:
        "Explore our platform to hire a car for your next adventure or sell your vehicle seamlessly with Motiisasa. Whether you need a reliable ride for a day or a quick sale, we ensure a trusted, user-friendly process. For those facing loan defaults, our fast loan offset solutions help you avoid repossession, offering peace of mind and financial relief.",
      link: "/cars?listing_type=hire",
      buttonText: "Hire Now",
    },
    {
      img: "/loan-approval.jpg",
      alt: "Woman with loan approval phone",
      title: "Quick Loan Approval in 48hrs",
      description:
        "Get your loan approved within 48 hours to secure your vehicle and keep your journey on track. Our transparent, efficient process eliminates delays, helping you avoid repossession while providing flexible payment options tailored to your needs. Trust Motiisasa to be your partner in financial stability.",
      link: "/loan-application",
      buttonText: "Apply Now",
    },
    {
      img: "/loan-approval.jpg",
      alt: "Man with loan approval phone",
      title: "Sell and Offset Your Loan",
      description:
        "Sell your car with us and offset your loan without hidden interest or fees. Our streamlined process ensures you receive fair value while we handle the loan repayment, offering a hassle-free way to manage financial challenges. Take control of your finances with Motiisasa today.",
      link: "/sellcar",
      buttonText: "Sell Now",
    },
    {
      img: "/loan-defaults.jpg",
      alt: "Car on bicycle",
      title: "Support for Loan Defaults",
      description:
        "Facing car loan defaults? Motiisasa offers a compassionate alternative solution to prevent repossession, ensuring fairness and support throughout the process. Our expert team works with you to create a manageable plan, protecting your vehicle and easing financial stress with transparency you can rely on.",
      link: "/support",
      buttonText: "Get Help",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="px-4 md:px-8 lg:px-16 py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-2xl shadow-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="min-w-full flex flex-col md:flex-row items-center p-6 md:p-10"
            >
              {/* Left Side - Image */}
              <div className="relative w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[#f26624] to-[#ff8c42] w-60 h-60 md:w-80 md:h-80 rounded-full opacity-50 blur-md z-0"></div>
                <img
                  src={slide.img}
                  alt={slide.alt}
                  className="relative z-10 object-contain w-[250px] h-[250px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Right Side - Text Content */}
              <div className="w-full md:w-1/2 md:ml-8 text-center md:text-left flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#262162] mb-4 drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="text-[#262162] text-base md:text-lg lg:text-xl mb-6 leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 text-[#262162] p-3 rounded-full shadow-lg hover:bg-[#f26624] hover:text-white transition-all duration-300"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 text-[#262162] p-3 rounded-full shadow-lg hover:bg-[#f26624] hover:text-white transition-all duration-300"
        >
          →
        </button>
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? "bg-[#f26624]" : "bg-gray-400"
              } hover:bg-[#ff8c42] transition-colors`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Assurance;
