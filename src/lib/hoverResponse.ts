import { getTool } from "../tools";
import { getModel } from "./getmodel";

export const modelHoverRes = async (data: object): Promise<object> => {
    const res = getTool.provider(String(getModel()), data);
    
    return res;
};