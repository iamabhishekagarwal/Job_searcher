import axios from "axios";
import { userState } from "../atoms";
import { useSetRecoilState } from "recoil";
const instance =axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL,
})

export default instance;