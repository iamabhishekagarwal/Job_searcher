// Responsive HomePage Component
import React, { useEffect, useState } from "react";
import { Search, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../atoms";

const jobs = [
  { id: 1, title: "Frontend Developer", company: "TCS", location: "Bangalore", tags: ["Full-time", "Remote", "React"] },
  { id: 2, title: "UI/UX Designer", company: "Zoho", location: "Chennai", tags: ["Internship", "On-site", "Figma"] },
  { id: 3, title: "Backend Engineer", company: "Swiggy", location: "Remote", tags: ["Full-time", "Node.js", "MongoDB"] },
];

const categories = ["Design", "Development", "Marketing", "Data Science", "Sales", "Support"];

const testimonials = [
  { name: "Anjali Sharma", position: "Frontend Engineer", quote: "Thanks to JobBoard, I landed my dream job within a week!" },
  { name: "Rahul Verma", position: "Backend Developer", quote: "The interface is clean and the job suggestions are accurate." },
];

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, filter: "blur(8px)" },
  animate: {
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { 
      duration: 1.2, 
      ease: [0.19, 1, 0.22, 1], 
      staggerChildren: 0.1, 
      delayChildren: 0.2 
    },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1], 
      staggerChildren: 0.08 
    } 
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.19, 1, 0.22, 1] 
    } 
  },
};

const FloatingBlob = ({ delay = 0, duration = 20, size = 200, gradient, className = "" }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{ 
      width: size, 
      height: size, 
      background: gradient, 
      filter: "blur(40px)", 
      opacity: 0.4 // Reduced opacity for mobile
    }}
    animate={{ 
      x: [0, 50, -25, 0], // Reduced movement for mobile
      y: [0, -50, 25, 0], 
      scale: [1, 1.1, 0.9, 1] 
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      delay, 
      ease: "easeInOut" 
    }}
  />
);

const JobCard = ({ title, company, location, tags }) => (
  <motion.div
    className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    variants={cardVariants}
    whileHover={{ scale: 1.02, y: -4 }} // Reduced scale for mobile
    whileTap={{ scale: 0.98 }}
  >
    <motion.h3 
      className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 line-clamp-2" 
      variants={cardVariants}
    >
      {title}
    </motion.h3>
    <p className="text-sm text-gray-600 mb-4 truncate">
      {company} • {location}
    </p>
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag, idx) => (
        <motion.span 
          key={idx} 
          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-full"
        >
          {tag}
        </motion.span>
      ))}
    </div>
    <motion.button 
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base font-medium"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Apply Now
    </motion.button>
  </motion.div>
);

const HomePage = () => {
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (input.trim().length === 0) {
      setSuggestions([]);
    } else {
      const handleSearch = async () => {
        try {
          const jobs = await axiosInstance(`/api/user/suggestions?query=${input}`);
          setSuggestions(jobs.data);
        } catch {
          console.log("Something went wrong");
        }
      };
      const debounce = setTimeout(handleSearch, 500);
      return () => clearTimeout(debounce);
    }
  }, [input]);

  const handleClick = (search) => {
    if (!search) return;
    setUser((prev) => {
      const prevSearches = prev?.recentHomeSearch || [];
      const updatedSearches = [search, ...prevSearches.filter((item) => item !== search)].slice(0, 3);
      return { ...prev, recentHomeSearch: updatedSearches };
    });
  };

  const handleRemoveRecent = (term) => {
    if (!term) return;
    setUser((prevState) => {
      const prevSearch = prevState?.recentHomeSearch || [];
      const filtered = prevSearch.filter((item) => item !== term);
      return { ...prevState, recentHomeSearch: filtered };
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 text-gray-900 relative overflow-hidden" 
      variants={pageVariants} 
      initial="initial" 
      animate="animate"
    >
      {/* Floating Blobs - Smaller and less prominent on mobile */}
      <FloatingBlob 
        delay={0} 
        size={300} 
        gradient="radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" 
        className="top-0 left-0" 
      />
      <FloatingBlob 
        delay={5} 
        size={250} 
        gradient="radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" 
        className="bottom-0 right-0" 
      />
      <FloatingBlob 
        delay={10} 
        size={200} 
        gradient="radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" 
        className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
      />

      {/* Hero Section */}
      <motion.section 
        className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative z-10" 
        variants={sectionVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight" 
            variants={cardVariants}
          >
            Find Your Dream Job
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0" 
            variants={cardVariants}
          >
            Explore thousands of job opportunities tailored just for you with our intelligent matching system.
          </motion.p>

          <motion.div className="relative w-full max-w-2xl mx-auto" variants={cardVariants}>
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-white/20">
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Search jobs..." 
                  className="flex-1 p-3 sm:p-4 bg-transparent border-none rounded-xl focus:outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base" 
                />
                <motion.button 
                  onClick={() => handleClick(input)} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base" 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Search size={18} />
                  <span>Search</span>
                </motion.button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul 
                  className="absolute left-0 right-0 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl z-20 mt-2 max-h-48 sm:max-h-60 overflow-auto" 
                  initial={{ opacity: 0, y: -10, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: -10, scale: 0.98 }} 
                  transition={{ duration: 0.3 }}
                >
                  {suggestions.map((title, idx) => (
                    <motion.li 
                      key={idx} 
                      className="text-left px-4 sm:px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors text-sm sm:text-base" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        setInput(title);
                        setSuggestions([]);
                      }}
                    >
                      {title}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Recent Searches */}
            <AnimatePresence>
              {user?.recentHomeSearch?.length > 0 && (
                <motion.div 
                  className="mt-4 sm:mt-6" 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Recent Searches</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    {user.recentHomeSearch.map((term, idx) => (
                      <motion.div 
                        key={idx} 
                        className="relative bg-white/70 backdrop-blur-lg text-xs sm:text-sm px-3 sm:px-4 py-2 pr-8 rounded-full flex items-center shadow-md border border-white/20" 
                        initial={{ scale: 0, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0, opacity: 0 }} 
                        transition={{ delay: idx * 0.1 }} 
                        whileHover={{ scale: 1.05 }}
                      >
                        <span 
                          className="cursor-pointer text-gray-700 max-w-24 sm:max-w-none truncate" 
                          onClick={() => setInput(term)}
                        >
                          {term}
                        </span>
                        <motion.button 
                          onClick={() => handleRemoveRecent(term)} 
                          className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center" 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={12} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Jobs */}
      <motion.section 
        className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto" 
        variants={sectionVariants}
      >
        <motion.h3 
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800" 
          variants={cardVariants}
        >
          Featured Opportunities
        </motion.h3>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
          variants={sectionVariants}
        >
          {jobs.map((job) => <JobCard key={job.id} {...job} />)}
        </motion.div>
      </motion.section>

      {/* Categories */}
      <motion.section 
        className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white/30 backdrop-blur-lg" 
        variants={sectionVariants}
      >
        <motion.h3 
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800" 
          variants={cardVariants}
        >
          Explore by Categories
        </motion.h3>
        <motion.div 
          className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4" 
          variants={sectionVariants}
        >
          {categories.map((cat, idx) => (
            <motion.button 
              key={idx} 
              className="text-xs sm:text-sm md:text-base bg-white/70 backdrop-blur-lg text-purple-800 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-md font-medium" 
              variants={cardVariants} 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12" 
        variants={sectionVariants}
      >
        <motion.h3 
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800" 
          variants={cardVariants}
        >
          What Our Users Say
        </motion.h3>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto" 
          variants={sectionVariants}
        >
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx} 
              className="bg-white/70 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-white/20" 
              variants={cardVariants} 
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <p className="text-gray-700 mb-4 sm:mb-6 italic text-sm sm:text-base md:text-lg leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <motion.div 
                  className="flex gap-1" 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: 0.2 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-current" />
                  ))}
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">{t.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{t.position}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="text-center py-4 sm:py-6 md:py-8 text-xs sm:text-sm md:text-base text-gray-600 bg-white/20 backdrop-blur-lg border-t border-white/20" 
        variants={cardVariants}
      >
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
        >
          © {new Date().getFullYear()} JobBoard. All rights reserved.
        </motion.p>
      </motion.footer>
    </motion.div>
  );
};

export default HomePage;
