import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import JobSearchPage from "./Pages/JobSearch";
import Maintenance from "./Pages/Maintenance";
import SignIn from "./Pages/Signin";
import Signup from "./Pages/Signup";
import Admin from "./Pages/Admin";
import EmployerDashBoard from "./Pages/EmployerDashBoard";
import EmployeeDashBoard from "./Pages/EmployeeDashBoard";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "./axios";
import AllJobsPage from "./Pages/AllJobsPage";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/user/me");
        const resData = res.data.user;
        setIsAdmin(resData.isAdmin);
      } catch (e) {
        console.log("Error fetching user", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (isLoading) return <div>Loading...</div>; 

  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<Home />} />
          <Route path="/employerDB" element={<EmployerDashBoard />} />
          <Route path="/employeeDB" element={<EmployeeDashBoard />} />
          <Route
            path="/admin"
            element={isAdmin ? <Admin /> : <Navigate to="/" />}
          />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/jobSearch" element={<JobSearchPage />} />
          <Route path="/jobs" element={<AllJobsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
