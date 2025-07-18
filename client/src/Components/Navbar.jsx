import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../../atoms";
import { axiosInstance } from "../axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const user = useRecoilValue(userState);
  const setUser = useSetRecoilState(userState)
  const [message, setMessage] = useState({});
  const navigate = useNavigate();


  const handleNav = async(type)=>{
    navigate('/'+type)
  }

  //LOGOUT
  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/api/user/logout");
      if (res.data.success) {
        setMessage({"color" : "bg-green-500" , "msg":"✅ Logged out successfully."});
        setUser({
            id:null,
            fname:"",
            lname:"",
            email:"",
            isAdmin:false,
            role:"Employee"
        })
      } else {
        setMessage({"color" : "bg-red-400" , "msg":"❌ Error in logging out."});
      }
    } catch (e) {
        setMessage({"color" : "bg-red-400" , "msg":"❌ Error in logging out."});
      console.error(e);
    }

    setTimeout(() => {
      setMessage({});
    }, 5000);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <button onClick={()=>handleNav("")} className="text-2xl font-bold text-blue-700">JobBoard</button>
        {user.id === null ? <></> : <button className="text-blue-600 italic font-medium hover:underline hover:text-blue-500">{user.role === "Company"?"Create":"Apply"}</button>}
        
        <div className="space-x-4">
          {user.fname !== "" ? (
            <div className="flex flex-row items-center gap-4">
              <p className="text-blue-600 font-medium">Hi, {user.fname}</p>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-row items-center gap-4">
              <button onClick={()=>handleNav("signin")} className="text-blue-600 font-medium">Login</button>
              <button onClick={()=>handleNav("signup")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Message */}
      {message.msg && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 ${message.color} text-white px-6 py-3 rounded-md shadow-md z-50 transition-all duration-300`}>
          {message.msg}
        </div>
      )}
    </>
  );
}

export default Navbar;
