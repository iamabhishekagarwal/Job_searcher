import Navbar from "./Components/Navbar"
import Home from "./Pages/Home"
import JobSearchPage from "./Pages/JobSearch"
import Maintenance from "./Pages/Maintenance"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import {BrowserRouter,Routes,Route} from "react-router-dom"
function App() {
  return (
    <BrowserRouter>
    <div>
      <Navbar></Navbar>
      <Routes>
        <Route path="/maintenance" element={<Maintenance></Maintenance>}></Route>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        <Route path="/signin" element={<SignIn></SignIn>}></Route>
        <Route path="/jobSearch" element={<JobSearchPage/>}></Route>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App