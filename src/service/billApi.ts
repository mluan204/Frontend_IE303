import api from "./api";

export const createBill = async (data: any) => {

    try {
        const response = await api.post("/bills/create-bill", data);
        console.log(response.data);
        return response.data.id;
    } catch (error) {
        console.log(error);
        return "Loi khi tao employee";
    }
};

export const getProductQuantity = async () => {
    try {
        const response = await api.get("/bill-detail/product-quantities");
        // console.log("api"+response.data.length);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};