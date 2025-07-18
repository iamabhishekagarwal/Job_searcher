import Home from "./Pages/Home"
import Maintenance from "./Pages/Maintenance"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import Admin from "./Pages/Admin"
import EmployerDashBoard from "./Pages/EmployerDashBoard"
import {BrowserRouter,Routes,Route} from "react-router-dom"
import EmployeeDashBoard from "./Pages/EmployeeDashBoard"
function App() {
  return (
    <BrowserRouter>
    <div>
      <Routes>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        <Route path="/signin" element={<SignIn></SignIn>}></Route>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/employerDB" element={<EmployerDashBoard></EmployerDashBoard>}></Route>
        <Route path="/employeeDB" element={<EmployeeDashBoard></EmployeeDashBoard>}></Route>
        <Route path="/admin" element={<Admin></Admin>}></Route>
        <Route path="/maintenance" element={<Maintenance></Maintenance>}></Route>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App