import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = () => {
  const { search, setSearch, showSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname.includes("collection") ||
      location.pathname.includes("orders")
    ) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 78) {
        setIsSticky(true);
      } else {
        setIsSticky(false); 
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const containerVariantsStatic = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.5, 
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const containerVariantsSticky = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const inputVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <AnimatePresence>
      {showSearch && visible && (
        <motion.div
          className="z-20 block sticky top-[78px]" 
          variants={
            isSticky ? containerVariantsSticky : containerVariantsStatic
          }
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex items-center justify-center relative">
            <motion.div
              className="border bg-white border-gray-400 px-5 py-2 my-4 rounded-full w-full sm:w-1/2 h-10 flex items-center"
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none bg-inherit text-sm"
                type="text"
                placeholder="Search"
              />
              {search && (
                <div className="hover:bg-slate-100 rounded-full p-1 group mr-1">
                  <X
                    onClick={handleClearSearch}
                    className="w-5 cursor-pointer text-gray-700 group-hover:text-gray-900"
                    alt="Clear Search"
                  />
                </div>
              )}
              <div className="border-l-2">
                <Search
                  className="w-5 ml-2 text-gray-700 cursor-pointer"
                  alt="Search Icon"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
