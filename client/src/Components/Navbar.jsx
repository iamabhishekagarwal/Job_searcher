import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../atoms";
import axiosInstance from "../axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

function Navbar() {
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState);
  const [message, setMessage] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
        setUser({
          id: null,
          fname: "",
          lname: "",
          email: "",
          isAdmin: false,
          role: "Employee",
        });
      }
      setTimeout(() => setMessage({}), 5000);
    };
    fetchUser();
    const interval = setInterval(fetchUser, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (type) => {
    setMobileMenuOpen(false);
    navigate("/" + type);
  };

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/api/user/logout");
      setMessage({
        color: res.data.success ? "from-green-500 to-green-600" : "from-yellow-400 to-yellow-500",
        icon: res.data.success ? "✅" : "⚠️",
        msg: res.data.success
          ? "Logged out successfully."
          : "Logged out locally (session expired).",
      });
    } catch {
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
    setTimeout(() => setMessage({}), 5000);
  };

  const menuVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20"
            : "bg-white/70 backdrop-blur-lg shadow-md"
        }`}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <motion.button
            onClick={() => handleNav("")}
            className="relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">💼</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobBoard
              </span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </motion.button>

          {/* Hamburger Menu */}
          <div className="sm:hidden">
            <button onClick={() => setMobileMenuOpen((prev) => !prev)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-8">
            <button
              onClick={() => handleNav("jobs")}
              className="relative text-gray-700 font-medium hover:text-blue-600 transition-colors duration-300 group"
            >
              <span className="flex items-center gap-2 text-base">
                🔍 Browse Jobs
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
            </button>

            {user.fname !== "" ? (
              <>
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/20">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.fname.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">Hi, {user.fname}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav("signin")}
                  className="text-gray-700 font-medium hover:text-blue-600 transition-colors duration-300 px-4 py-2 rounded-xl hover:bg-blue-50"
                >
                  🔑 Login
                </button>
                <button
                  onClick={() => handleNav("signup")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  ✨ Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="sm:hidden bg-white px-4 py-4 border-t border-gray-200"
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleNav("jobs")}
                  className="text-gray-700 font-medium text-base"
                >
                  🔍 Browse Jobs
                </button>
                {user.fname !== "" ? (
                  <>
                    <div className="flex items-center gap-3 bg-white/70 px-3 py-2 rounded-xl border">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.fname.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 font-medium">Hi, {user.fname}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl font-medium"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav("signin")}
                      className="text-gray-700 font-medium"
                    >
                      🔑 Login
                    </button>
                    <button
                      onClick={() => handleNav("signup")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl font-medium"
                    >
                      ✨ Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Toast */}
      <AnimatePresence>
        {message.msg && (
          <motion.div
            className="fixed top-24 left-1/2 w-[90%] sm:w-auto transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: { type: "spring", damping: 20, stiffness: 300 },
            }}
            exit={{ opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.3 } }}
          >
            <div className={`bg-gradient-to-r ${message.color} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 max-w-md`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.icon}</span>
                <span className="font-medium">{message.msg}</span>
              </div>
              <motion.div
                className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden"
                initial={{ width: "100%" }}
              >
                <motion.div
                  className="h-full bg-white/60 rounded-full"
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </>
  );
}

export default Navbar;
