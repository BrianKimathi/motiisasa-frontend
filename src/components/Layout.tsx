import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = useCallback(
    debounce(() => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, 100),
    []
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      toggleVisibility.cancel();
    };
  }, [toggleVisibility]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <noscript>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            Please enable JavaScript to ensure the best experience.
          </div>
        </noscript>
        {children}
      </main>
      <Footer />
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary-orange text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition duration-300"
          aria-label="Back to top"
          title="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default Layout;
