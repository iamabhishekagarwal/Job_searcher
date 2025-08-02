import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../axios.js";
import FilterInput from "../Components/FilterInput";
import useDebounce from "../hooks/useDebounce.js";

const filterTypes = [
  { key: "tags", label: "Tags" },
  { key: "locations", label: "Locations" },
  { key: "companies", label: "Companies" },
  { key: "vias", label: "Via" },
];

// Animation variants matching the video style
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const sidebarVariants = {
  initial: {
    x: -100,
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const filterItemVariants = {
  initial: {
    y: 30,
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const contentVariants = {
  initial: {
    y: 50,
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.06,
      delayChildren: 0.4,
    },
  },
};

const jobCardVariants = {
  initial: {
    y: 40,
    opacity: 0,
    scale: 0.9,
    rotateX: 15,
  },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const FloatingBlob = ({ delay = 0, duration = 20, size = 200, color = "rgba(59, 130, 246, 0.1)" }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(40px)",
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

const AllJobsPage = () => {
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState({
    tags: "",
    locations: "",
    companies: "",
    vias: "",
  });
  const [selected, setSelected] = useState({
    tags: [],
    locations: [],
    companies: [],
    vias: [],
  });
  const [suggestions, setSuggestions] = useState({
    tags: [],
    locations: [],
    companies: [],
    vias: [],
  });
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobs, setJobs] = useState([]);

  const debouncedQueries = {
    tags: useDebounce(queries.tags, 200),
    locations: useDebounce(queries.locations, 200),
    companies: useDebounce(queries.companies, 200),
    vias: useDebounce(queries.vias, 200),
  };

  const query = debouncedQueries[activeFilter];

  useEffect(() => {
    if (!activeFilter || !query) {
      setSuggestions((prev) => ({ ...prev, [activeFilter]: [] }));
      return;
    }
    axiosInstance
      .get(`/api/user/filters`, {
        params: {
          type: activeFilter,
          query,
          limit: 10,
        },
      })
      .then((res) => {
        setSuggestions((prev) => ({
          ...prev,
          [activeFilter]: res.data.items || [],
        }));
      })
      .catch(() => {
        setSuggestions((prev) => ({ ...prev, [activeFilter]: [] }));
      });
  }, [query, activeFilter]);

  const removeItem = (filterKey, value) => {
    setSelected((prev) => ({
      ...prev,
      [filterKey]: prev[filterKey].filter((item) => item !== value),
    }));
  };

  const addItem = (filterKey, value) => {
    setSelected((prev) => ({
      ...prev,
      [filterKey]: Array.from(new Set([...prev[filterKey], value])),
    }));
    setQueries((prev) => ({ ...prev, [filterKey]: "" }));
  };

  useEffect(() => {
    setPage(1);
  }, [selected]);

  const fetchJobs = useCallback(() => {
    axiosInstance
      .get("/api/user/getJobs", {
        params: {
          tags: selected.tags || [],
          locations: selected.locations || [],
          companies: selected.companies || [],
          vias: selected.vias || [],
          page,
          limit,
        },
      })
      .then((res) => {
        setJobs(res.data.jobs);
        setTotalJobs(res.data.totalCount || 0);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [selected.tags, selected.locations, selected.companies, selected.vias, page, limit]);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const totalPages = Math.ceil(totalJobs / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated loading background */}
        <FloatingBlob delay={0} size={300} color="rgba(59, 130, 246, 0.15)" />
        <FloatingBlob delay={2} size={200} color="rgba(147, 51, 234, 0.1)" />
        <FloatingBlob delay={4} size={250} color="rgba(16, 185, 129, 0.1)" />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-sans text-gray-700">Loading amazing opportunities...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floating background elements */}
      <FloatingBlob delay={0} size={400} color="rgba(59, 130, 246, 0.08)" />
      <FloatingBlob delay={3} size={300} color="rgba(147, 51, 234, 0.06)" />
      <FloatingBlob delay={6} size={350} color="rgba(16, 185, 129, 0.06)" />
      <FloatingBlob delay={9} size={250} color="rgba(245, 158, 11, 0.06)" />

      <motion.div className="relative z-10 flex gap-6 px-4 py-8">
        {/* Sidebar */}
        <motion.div
          className="w-full max-w-xs space-y-4"
          variants={sidebarVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
            variants={filterItemVariants}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
            <div className="space-y-4">
              {filterTypes.map(({ key, label }, index) => (
                <motion.div
                  key={key}
                  variants={filterItemVariants}
                  custom={index}
                >
                  <FilterInput
                    label={label}
                    query={queries[key]}
                    setQuery={(val) => setQueries((prev) => ({ ...prev, [key]: val }))}
                    suggestions={suggestions[key].filter((item) => !selected[key].includes(item))}
                    onSelect={(updateFn) => {
                      setSelected((prev) => ({
                        ...prev,
                        [key]: updateFn(prev[key]),
                      }));
                      setQueries((prev) => ({ ...prev, [key]: "" }));
                    }}
                    selectedItems={selected[key]}
                    onRemove={(item) => removeItem(key, item)}
                    isActive={activeFilter === key}
                    setActiveFilter={() => setActiveFilter(key)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.button
            onClick={fetchJobs}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
            variants={filterItemVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            Apply Filters
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex-1"
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 mb-6"
            variants={filterItemVariants}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Available Positions ({jobs.length})
            </h2>
            <p className="text-gray-600">Discover your next career opportunity</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={contentVariants}
          >
            <AnimatePresence>
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-xl transition-all duration-300"
                  variants={jobCardVariants}
                  custom={index}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  }}
                  layout
                >
                  {/* Company logo */}
                  <motion.div 
                    className="flex items-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={`${job.companyName} logo`}
                        className="w-16 h-16 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                        N/A
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <p className="text-sm font-medium text-gray-600">{job.companyName}</p>
                      <p className="text-sm text-gray-500">
                        {job.location} • {job.experience} • {job.jobType}
                      </p>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4 flex-grow">
                    {job.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.map((tag, idx) => (
                      <motion.span
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-gray-500 mb-4 flex justify-between">
                    <span>Posted: {job.postedAt}</span>
                    <span>Via: {job.via}</span>
                  </div>

                  {/* Apply button */}
                  <motion.a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-center font-semibold py-3 rounded-xl transition duration-300 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply Now
                  </motion.a>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-8"
            variants={filterItemVariants}
          >
            <motion.button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-6 py-2 bg-white/70 backdrop-blur-lg border border-white/20 rounded-xl disabled:opacity-50 hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Previous
            </motion.button>

            <span className="px-4 py-2 bg-white/70 backdrop-blur-lg border border-white/20 rounded-xl">
              Page {page} of {totalPages}
            </span>

            <motion.button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-6 py-2 bg-white/70 backdrop-blur-lg border border-white/20 rounded-xl disabled:opacity-50 hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AllJobsPage;
