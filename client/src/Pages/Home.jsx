import React from "react";
import { Search, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../axios";
import { useState } from "react";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../atoms";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TCS",
    location: "Bangalore",
    tags: ["Full-time", "Remote", "React"],
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "Zoho",
    location: "Chennai",
    tags: ["Internship", "On-site", "Figma"],
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "Swiggy",
    location: "Remote",
    tags: ["Full-time", "Node.js", "MongoDB"],
  },
];

const categories = [
  "Design",
  "Development",
  "Marketing",
  "Data Science",
  "Sales",
  "Support",
];

const testimonials = [
  {
    name: "Anjali Sharma",
    position: "Frontend Engineer",
    quote: "Thanks to JobBoard, I landed my dream job within a week!",
  },
  {
    name: "Rahul Verma",
    position: "Backend Developer",
    quote: "The interface is clean and the job suggestions are accurate.",
  },
];

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.19, 1, 0.22, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const sectionVariants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.19, 1, 0.22, 1],
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.19, 1, 0.22, 1],
    },
  },
};

const FloatingBlob = ({ delay = 0, duration = 20, size = 200, gradient, className = "" }) => (
  <motion.div
    className={`absolute rounded-full ${className}`}
    style={{
      width: size,
      height: size,
      background: gradient,
      filter: "blur(40px)",
      opacity: 0.6,
    }}
    animate={{
      x: [0, 100, -50, 0],
      y: [0, -100, 50, 0],
      scale: [1, 1.2, 0.8, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const JobCard = ({ title, company, location, tags }) => (
  <motion.div
    className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    variants={cardVariants}
    whileHover={{
      scale: 1.03,
      y: -8,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    }}
    whileTap={{ scale: 0.98 }}
  >
    <motion.h3 
      className="text-xl font-semibold text-gray-800 mb-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {title}
    </motion.h3>
    <p className="text-sm text-gray-600 mb-4">
      {company} • {location}
    </p>
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag, idx) => (
        <motion.span
          key={idx}
          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 * idx }}
        >
          {tag}
        </motion.span>
      ))}
    </div>
    <motion.button
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
    if (input.trim().length === 0) setSuggestions([]);
    else {
      const handleSearch = async () => {
        try {
          const jobs = await axiosInstance(
            `/api/user/suggestions?query=${input}`
          );
          setSuggestions(jobs.data);
        } catch {
          console.log("Something went wrong");
        }
      };
      const debounce = setTimeout(handleSearch, 300);
      return () => clearTimeout(debounce);
    }
  }, [input]);

  const handleClick = (search) => {
    if (!search) return;

    setUser((prev) => {
      const prevSearches = prev?.recentHomeSearch || [];
      const updatedSearches = [
        search,
        ...prevSearches.filter((item) => item !== search),
      ].slice(0, 3);
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
      {/* Floating Background Elements */}
      <FloatingBlob
        delay={0}
        size={400}
        gradient="radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)"
        className="top-0 left-0"
      />
      <FloatingBlob
        delay={5}
        size={350}
        gradient="radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)"
        className="bottom-0 right-0"
      />
      <FloatingBlob
        delay={10}
        size={300}
        gradient="radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)"
        className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />

      {/* Hero Section */}
      <motion.section
        className="px-6 py-16 relative z-10"
        variants={sectionVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            variants={cardVariants}
          >
            Find Your Dream Job
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto"
            variants={cardVariants}
          >
            Explore thousands of job opportunities tailored just for you with our intelligent matching system.
          </motion.p>

          <motion.div
            className="relative w-full max-w-2xl mx-auto"
            variants={cardVariants}
          >
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-white/20">
              <div className="flex flex-row">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search by job title or keyword..."
                  className="flex-1 p-4 bg-transparent border-none rounded-l-xl focus:outline-none text-gray-800 placeholder-gray-500"
                />
                <motion.button
                  onClick={() => handleClick(input)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search size={20} />
                  Search
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              <div className="z-100">
              {suggestions.length > 0 && (
                <motion.ul
                  className="absolute left-0 right-0 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl z-20 mt-2 max-h-60 overflow-auto"
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {suggestions.map((title, idx) => (
                    <motion.li
                      key={idx}
                      className="text-left px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {title}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
              </div>
            </AnimatePresence>


            <AnimatePresence>
              {user?.recentHomeSearch?.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="text-gray-500 text-sm mb-4">Recent Searches</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {user.recentHomeSearch.map((term, idx) => (
                      <motion.div
                        key={idx}
                        className="relative bg-white/70 backdrop-blur-lg text-sm px-4 py-2 pr-8 rounded-full flex items-center shadow-md border border-white/20"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span
                          className="cursor-pointer text-gray-700"
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
                          ×
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

      {/* Job Listings */}
      <motion.section
        className="px-6 py-12 max-w-6xl mx-auto relative z-0"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h3
          className="text-3xl font-bold mb-8 text-center text-gray-800"
          variants={cardVariants}
        >
          Featured Opportunities
        </motion.h3>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={sectionVariants}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </motion.div>
      </motion.section>

      {/* Categories */}
      <motion.section
        className="px-6 py-12 bg-white/30 backdrop-blur-lg relative z-10"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h3
          className="text-3xl font-bold mb-8 text-center text-gray-800"
          variants={cardVariants}
        >
          Explore by Categories
        </motion.h3>
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          variants={sectionVariants}
        >
          {categories.map((cat, index) => (
            <motion.button
              key={index}
              className="bg-white/70 backdrop-blur-lg text-purple-800 px-6 py-3 rounded-full hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-md"
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
        className="px-6 py-12 relative z-10"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h3
          className="text-3xl font-bold mb-8 text-center text-gray-800"
          variants={cardVariants}
        >
          What Our Users Say
        </motion.h3>
        <motion.div
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          variants={sectionVariants}
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <p className="text-gray-700 mb-6 italic text-lg">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </motion.div>
                <div>
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  <p className="text-sm text-gray-600">{t.position}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="text-center py-8 text-gray-600 bg-white/20 backdrop-blur-lg border-t border-white/20 relative z-10"
        variants={cardVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
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
