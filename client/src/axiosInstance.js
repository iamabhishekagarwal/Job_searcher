import axios from "axios";
import { userState } from "../atoms";
import { useSetRecoilState } from "recoil";
const instance =axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL,
})
export const setUpInterceptors=(setUser)=>{
    instance.interceptors.response.use(
        (response)=>response,
        (error)=>{
            if(error.response?.status===401){
                setUser(null);
                localStorage.clear();
                window.location.href="/signin";
            }
            return Promise.reject(error);
        }
    );
};

export default instance;