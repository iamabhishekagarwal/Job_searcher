import { useRecoilState, useRecoilValue } from "recoil"
import { userState } from "../../atoms"
import { axiosInstance } from "../axios"

function Navbar() {
    const user = useRecoilValue(userState)

    const handleLogout = ()=>{
        try{
            const res = axiosInstance.get("/api/user/logout");
            if(res.data.success)
            {
                alert("Logged out successfully!");
            }
            else{
                alert("Error in logging out")
            }
        }catch(e)
        {
            alert("Error in logging out")
            console.error(e)
        }
    }
  return (
    <div><nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-700">JobBoard</h1>
        <div className="space-x-4">
            {user.fname !== ""?<div className="flex flex-row items-center gap-4">
                <p className="text-blue-600 font-medium">Hi, {user.fname}</p>
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Logout
                </button>
            </div>:
            <div>
                <button className="text-blue-600 font-medium">Login</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Sign Up
                </button>
          </div>}
          
        </div>
      </nav></div>
  )
}

export default Navbar