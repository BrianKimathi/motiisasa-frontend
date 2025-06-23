const Assurance = () => {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-12 flex flex-col md:flex-row items-center bg-gray-100">
      {/* Left Side - Image with Yellow Background */}
      <div className="relative w-full md:w-1/2 flex justify-center">
        {/* Yellow Background Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#f26624] w-64 h-64 md:w-80 md:h-80 rounded-full z-0"></div>

        {/* Person Image */}
        <img
          src="/assuarance.png" // Ensure this path is correct in your Vite project
          alt="Person pointing"
          className="relative z-10 object-contain w-[400px] h-[400px]"
        />
      </div>

      {/* Right Side - Text Content */}
      <div className="w-full md:w-1/2 md:ml-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#262162]">
          Experience Unmatched Quality and Protection with Our Premium Car
          Sealing Services
        </h2>
        <p className="text-[#262162] mt-4">
          At our car sealing company, we take pride in offering top-notch
          services that provide your vehicle with the protection it needs to
          maintain its appearance and value. Our team of highly skilled
          professionals has years of experience in the industry and utilizes
          only the best materials and techniques to ensure your car receives the
          highest level of care.
        </p>
        {/* Call-to-Action */}
        <a
          href="/cars"
          className="mt-6 inline-block text-[#f26624] font-medium hover:underline flex items-center gap-2"
        >
          VISIT OUR CAR COLLECTION PAGE →
        </a>
      </div>
    </section>
  );
};

export default Assurance;
