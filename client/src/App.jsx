import Home from "./Pages/Home"
import Maintenance from "./Pages/Maintenance"
import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import {BrowserRouter,Routes,Route} from "react-router-dom"
function App() {
  return (
    <BrowserRouter>
    <div>
      <Routes>
        <Route path="/" element={<Maintenance></Maintenance>}></Route>
        {/* <Route path="/" element={<Home></Home>}></Route>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        <Route path="/signin" element={<SignIn></SignIn>}></Route> */}
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App