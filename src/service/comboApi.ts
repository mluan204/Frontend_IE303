import api from "./api";

interface ComboProduct {
    productId: number;
    price: number;
    quantity: number;
}

interface CreateComboRequest {
    timeEnd: string;
    comboProducts: ComboProduct[];
}

interface Combo {
    id: number;
    timeEnd: string;
    comboProducts: ComboProduct[];
}

export const createCombo = async (combo: CreateComboRequest) => {
    try {
        const response = await api.post("/combo", combo);
        return response.data;
    } catch (error) {
        console.error("Error creating combo:", error);
        throw error;
    }
}

export const getAllCombo = async (page = 0, size = 10) => {
    try {
        const response = await api.get("/combo/paged", {
            params: {page, size },
          });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting all combos:", error);
        throw error;
    }
}