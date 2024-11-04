import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? (
    <div className="fixed inset-0 bg-black opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  ) : (
    <div>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
