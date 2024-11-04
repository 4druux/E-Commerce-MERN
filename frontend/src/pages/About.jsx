import React, { useState, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

const About = () => {
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
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full md:max-w-[450px]"
          src={assets.about_img}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus
            neque tempore eveniet, dolor eos, id esse veritatis iusto quos
            impedit deserunt non a. Quidem harum temporibus aliquam unde sunt
            nam!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem
            nesciunt explicabo quia at voluptatum mollitia est, neque
            voluptatibus, nam necessitatibus dolor. Quo illo facere ipsum ullam
            temporibus unde repellat dolores tempore quisquam minus mollitia
            expedita id ex facilis, distinctio dicta quidem autem odio beatae!
            Laborum laudantium modi unde odit fuga?
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
            beatae eaque, aliquid ex illum ab cum ducimus! Corporis nam, at
            nostrum eius impedit, soluta minus explicabo tempora quia molestiae
            et.
          </p>
        </div>
      </div>

      <div className="text-4xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Quality Assurance:</b>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corporis
            earum illum ad eveniet natus, autem atque reprehenderit? Cupiditate,
            quisquam eos.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Convenience:</b>
          <p className="text-gray-600">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corporis
            earum illum ad eveniet natus, autem atque reprehenderit? Cupiditate,
            quisquam eos.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Exceptional Customer Service:</b>
          <p className="text-gray-600">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Corporis
            earum illum ad eveniet natus, autem atque reprehenderit? Cupiditate,
            quisquam eos.
          </p>
        </div>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default About;
