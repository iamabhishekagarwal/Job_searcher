import SignIn from "./Pages/Signin"
import Signup from "./Pages/Signup"
import {BrowserRouter,Routes,Route} from "react-router-dom"
function App() {
  return (
    <BrowserRouter>
    <div>
      <Routes>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        <Route path="/signin" element={<SignIn></SignIn>}></Route>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App