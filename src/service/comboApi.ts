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

export const getAllCombo = async (page = 0, size = 10, isActive?: boolean) => {
    try {
        const response = await api.get("/combo/paged", {
            params: { page, size, isActive },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting all combos:", error);
        throw error;
    }
}

export const getAllComboList = async () => {
    try {
        const response = await api.get("/combo");
        return response.data;
    } catch (error) {
        console.error("Error getting all combo list:", error);
        throw error;
    }
}

export const updateCombo = async (id: number, timeEnd: string) => {
    try {
        const response = await api.put(`/combo/${id}/update`, { timeEnd: timeEnd});
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating combo time end:", error);
        throw error;
    }
}

export const deleteCombo = async (id: number) => {
    try {
        const response = await api.delete(`/combo/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting combo:", error);
        throw error;
    }
}


export const getAllComboListProduct = async () => {
    try {
        const response = await api.get("/combo/all");
        return response.data;
    } catch (error) {
        console.error("Error getting all combo list:", error);
        throw error;
    }
}
