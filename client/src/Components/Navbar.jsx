import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../atoms";
import axiosInstance from "../axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState);
  const [message, setMessage] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/user/me");
        console.log(res);
        if (res.data.success) {
          const resData = res.data.user;
          setUser({
            id: resData.id,
            fname: resData.firstName,
            lname: resData.lastName,
            email: resData.email,
            isAdmin: resData.isAdmin,
            role: resData.role,
          });
        } else {
          setMessage({
            color: "from-red-500 to-red-600",
            icon: "❌",
            msg: "Session Invalid, Logging Out!",
          });
          handleLogout();
        }
      } catch (e) {
        console.log(e);
        setUser({
          id: null,
          fname: "",
          lname: "",
          email: "",
          isAdmin: false,
          role: "Employee",
        });
        setMessage({ 
          color: "from-yellow-500 to-yellow-600", 
          icon: "⚠️",
          msg: "Please Login again!" 
        });
      }
      setTimeout(() => {
        setMessage({});
      }, 5000);
    };
    fetchUser();
    const interval = setInterval(fetchUser, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = async (type) => {
    navigate("/" + type);
  };

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/api/user/logout");
      if (res.data.success) {
        setMessage({
          color: "from-green-500 to-green-600",
          icon: "✅",
          msg: "Logged out successfully.",
        });
      } else {
        setMessage({
          color: "from-yellow-400 to-yellow-500",
          icon: "⚠️",
          msg: "Logged out locally (session expired).",
        });
      }
    } catch (e) {
      console.warn("Token may be expired. Logging out locally.");
      setMessage({
        color: "from-yellow-400 to-yellow-500",
        icon: "⚠️",
        msg: "Session expired. Logged out locally.",
      });
    }
    setUser({
      id: null,
      fname: "",
      lname: "",
      email: "",
      isAdmin: false,
      role: "Employee",
    });
    localStorage.clear();
    setTimeout(() => {
      setMessage({});
    }, 5000);
  };

  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1],
        staggerChildren: 0.1,
      }
    },
  };

  const itemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.19, 1, 0.22, 1],
      }
    },
  };

  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: -50, 
      scale: 0.9,
      filter: "blur(10px)"
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      }
    },
    exit: { 
      opacity: 0, 
      y: -30, 
      scale: 0.95,
      filter: "blur(5px)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
  };

  return (
    <>
      {/* Enhanced Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20"
            : "bg-white/70 backdrop-blur-lg shadow-md"
        }`}
        variants={navVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <motion.button
            onClick={() => handleNav("")}
            className="relative group"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">💼</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobBoard
              </span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </motion.button>

          {/* Navigation Links */}
          <motion.div
            className="flex items-center gap-8"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => handleNav("jobs")}
              className="relative text-gray-700 font-medium hover:text-blue-600 transition-colors duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                Browse Jobs
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
            </motion.button>
          </motion.div>

          {/* User Actions */}
          <motion.div 
            className="flex items-center gap-4"
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              {user.fname !== "" ? (
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* User Avatar & Greeting */}
                  <div className="flex items-center gap-3 bg-white/50 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/20">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.fname.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">
                      Hi, {user.fname}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <motion.button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <span>🚪</span>
                      Logout
                    </span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Login Button */}
                  <motion.button
                    onClick={() => handleNav("signin")}
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors duration-300 px-4 py-2 rounded-xl hover:bg-blue-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <span>🔑</span>
                      Login
                    </span>
                  </motion.button>

                  {/* Sign Up Button */}
                  <motion.button
                    onClick={() => handleNav("signup")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      <span>✨</span>
                      Sign Up
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.nav>

      {/* Enhanced Message Toast */}
      <AnimatePresence>
        {message.msg && (
          <motion.div
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={`bg-gradient-to-r ${message.color} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 max-w-md`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.icon}</span>
                <span className="font-medium">{message.msg}</span>
              </div>
              
              {/* Progress bar */}
              <motion.div
                className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden"
                initial={{ width: "100%" }}
              >
                <motion.div
                  className="h-full bg-white/60 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20" />
    </>
  );
}

export default Navbar;
