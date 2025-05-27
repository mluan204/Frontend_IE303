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

export const searchReceipts = async ({
  employeeName,
  fromDate,
  toDate,
  page = 0,
  size = 10,
}: {
  employeeName?: string;
  fromDate?: string; 
  toDate?: string;   
  page?: number;
  size?: number;
}) => {
  try {
    const params: any = {
      page,
      size,
    };

    if (employeeName) params.employeeName = employeeName;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await api.get("/receipts/search", { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm receipt:", error);
    return null;
  }
};

