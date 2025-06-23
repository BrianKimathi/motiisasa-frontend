const AboutTop = () => {
  return (
    <section className="relative w-full h-[250px] md:h-[350px] flex items-center justify-center text-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/carss.jpg" // Ensure this path is correct in your Vite project
          alt="About Motiisasa"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      {/* Text Content */}
      <div className="relative z-10 text-white px-4">
        <h1 className="text-2xl md:text-4xl font-bold">
          About Us at Motiisasa
        </h1>
        <p className="text-sm md:text-lg mt-2">
          Discover, Rent, and Buy – Your Gateway to Exceptional Car Experiences
        </p>
      </div>
    </section>
  );
};

export default AboutTop;