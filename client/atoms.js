import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const {persistAtom} = recoilPersist();

export const userState = atom({
    key:"userState",
    default:{
        id:null,
        fname:"",
        lname:"",
        email:"",
        isAdmin:false,
        role:"Employee",
        recentHomeSearch:[]
    },
    effects_UNSTABLE:[persistAtom]
})