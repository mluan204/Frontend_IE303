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

export const deleteReceiptById = async (id: number) => {
  try {
    const response =  await api.delete(`/receipts/${id}`);
    console.log("xoa nhap hang thanh cong");
    return response.data;
  } catch (error) {
    console.log(error);
    return "Loi khi xoa nhap hang";
  }
};