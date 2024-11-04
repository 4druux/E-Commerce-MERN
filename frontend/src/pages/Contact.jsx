import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  ) : (
    <div>
      <div className="text-center text-2xl pt-8 border-t">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <img
          className="w-full md:max-w-[480px]"
          src={assets.contact_img}
          alt=""
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
            Pamulang, Banten <br /> Indonesia
          </p>
          <p className="text-gray-500">
            Tel: (+62) 88xxxxxxx <br /> Email: 4drux@example.com
          </p>
          <p className="font-semibold text-xl text-gray-600">
            Caeers at Forever
          </p>
          <p className="text-gray-500">
            Learn more about our teams and job openings.
          </p>
          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Explore Jobs
          </button>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
