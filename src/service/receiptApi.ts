import api from "./api"

export const addReceipt = async (receiptData: any) => {
    try {
        const response = await api.post("/receipts/add", receiptData);
        return response.data.id;
    } catch (error) {
        console.log(error);
        return "Loi khi add receipt";
    }
};
