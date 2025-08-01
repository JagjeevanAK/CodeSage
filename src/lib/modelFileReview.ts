import { getTool } from "../tools";
import { getModel } from "./getmodel";

export const modelFileReview = async (data : object) : Promise<object> =>{
    const res = getTool.provider(String(getModel()), data);
    
    return res;
};