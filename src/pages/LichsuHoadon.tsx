import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faPrint,
  faTrash,
  faBan,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { deleteBillById, fetchAllBill, fetchBill } from "../service/mainApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Helmet } from "react-helmet";
import { set } from "date-fns";
import { printBillToPDF } from "../components/PrintBill";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Invoice {
  id: string;
  date: string; // or use Date if the date is a JavaScript Date object
  total: number;
  customerName: string;
  staffName: string;
  paymentMethod: string;
  discount: number;
  isDelete: boolean;
  items: {
    productId: number;
    productName: string;
    price: number;
    after_discount: number;
    quantity: number;
  }[];
}

type Bill = {
  id: number;
  total_cost: number;
  after_discount: number;
  customer: { id: number; name: string, phone_number: string };
  employee: { id: number; name: string };
  billDetails: {
    productId: number;
    productName: string;
    price: number;
    afterDiscount: number;
    quantity: number;
  }[];
  createdAt: string;
  totalQuantity: number;
  notes: string;
  pointsToUse: number | null;
};


function LishsuHoadon() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    invoices[0]
  );
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);


  const mapInvoiceToBill = (invoice: Invoice): Bill => {
  const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: Number(invoice.id),
    total_cost: invoice.total + invoice.discount,
    after_discount: invoice.total,
    customer: {
      id: 0, // Nếu không có ID thực, gán mặc định
      name: invoice.customerName,
      phone_number: "",
    },
    employee: {
      id: 0,
      name: invoice.staffName,
    },
    billDetails: invoice.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      afterDiscount: item.after_discount,
      quantity: item.quantity,
    })),
    createdAt: invoice.date,
    totalQuantity,
    notes: "",
    pointsToUse: invoice.discount,
  };
};

 const handlePrint = (invoice: Invoice) => {
  const billData = mapInvoiceToBill(invoice);
  printBillToPDF(billData);
};

  const fetchData = async () => {
  try {
    setLoading(true);
    const tempStartDate = dayjs().format("YYYY-MM-DD");
    const [startDay, startMonth, startYear] = tempStartDate.split("-");
    const startDate = `${startYear}-${startMonth}-${startDay}`;

    const result = await fetchBill(0, 100, "", startDate, startDate);
   

    if (typeof result === "string") {
      console.error("Lỗi khi lấy hóa đơn:", result);
      return;
    }

    const bills = result.content || [];

    const mapped: Invoice[] = bills.map((item: any) => ({
      id: item.id?.toString() || "",
      date: item.createdAt,
      total: item.after_discount,
      customerName: item.customer?.name || "Không rõ",
      staffName: item.employee?.name || "Không rõ",
      paymentMethod: "Tiền mặt",
      isDelete: item.isDeleted,
      discount: item.total_cost - item.after_discount,
      items: item.billDetails?.map((d: any) => ({
        productId: d.productId,
        productName: d.productName,
        price: d.price,
        after_discount: d.afterDiscount ?? d.price,
        quantity: d.quantity,
      })) || [],
    }));

    setInvoices(mapped);
    setSelectedInvoice(mapped[0] || null);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    setError(true);
  }
  setLoading(false);
};


  const deleteInvoiceById = async (id: string) => {
    try {
      const result = await deleteBillById(Number(id));
      console.log("Xóa thành công:", result);

      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === id ? { ...invoice, isDelete: true } : invoice
        )
      );

      if (selectedInvoice?.id === id) {
        setSelectedInvoice({ ...selectedInvoice, isDelete: true });
      }
    } catch (error) {
      console.error("Xóa thất bại:", error);
      alert("Xóa hóa đơn thất bại. Vui lòng thử lại!");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //  LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-blue-500 animate-spin mb-4"
          />
          <p className="text-gray-600">Đang tải dữ liệu hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={(e) => {
        // nếu click bên ngoài popup menu
        if (!(e.target as HTMLElement).closest(".menu-popup")) {
          setMenuOpen(null);
        }
      }}
      className="flex h-[calc(100vh-2.5rem)] bg-gray-100 overflow-y-hidden"
    >
      <Helmet>Lịch sử hóa đơn</Helmet>
      {/* Danh sách hóa đơn */}
      <div className="w-1/3 bg-white border-r-2 border-gray-300 flex flex-col h-[calc(100vh-2.5rem)]">
        {/* Tiêu đề cố định */}
        <h2 className="text-lg font-bold text-center py-2 shadow-md bg-white sticky top-0 ">
          Danh sách hóa đơn
        </h2>
        <div className="flex items-center gap-4">
    </div>


        {/* Danh sách hóa đơn có thể cuộn */}
        <ul
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {invoices.length > 0 ? (
            invoices.sort((a, b) => b.date.localeCompare(a.date))
            .map((invoice) => (
              <li key={invoice.id} className="border-b border-gray-300">
                <div
                  className={`cursor-pointer ${
                    selectedInvoice?.id === invoice.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-200"
                  } p-3 flex justify-between items-center`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex flex-col">
                    <p className="font-semibold">Số hóa đơn: {invoice.id}</p>
                    <div className="flex justify-between space-x-6 mt-1 text-base">
                      <p>
                        Ngày:{" "}
                        {dayjs(invoice.date)
                          .tz("Asia/Ho_Chi_Minh")
                          .format("DD/MM/YYYY HH:mm:ss")
                          .slice(0, 10)}
                      </p>
                      <p>Số lượng: {invoice.items.length}</p>
                      <p className="font-medium">
                        Tổng tiền: {invoice.total.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    {invoice.isDelete ? (
                      <div className="text-red-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faBan} />
                      </div>
                    ) : (
                      <>
                        <button
                          className="text-gray-500 hover:bg-gray-200 rounded-full p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(
                              menuOpen === invoice.id ? null : invoice.id
                            );
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>

                        {/* Popup menu */}
                        {menuOpen === invoice.id && (
                          <div className=" menu-popup absolute -right-1 top-full min-w-[150px] bg-white shadow-lg rounded-lg border border-gray-300 z-10">
                            <button
                              className="flex items-center px-4 py-2 text-sm hover:bg-gray-200 rounded-t-lg w-full"
                              onClick={() => {handlePrint(invoice)
                                setMenuOpen(null); 
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faPrint}
                                className="mr-2"
                              />
                              In hóa đơn
                            </button>
                            <button
                              className="flex items-center px-4 py-2 text-sm rounded-b-lg text-red-600 hover:bg-gray-200 w-full"
                              onClick={() => {
                                setConfirmDeleteId(invoice.id);
                                setMenuOpen(null); // Đóng menu sau khi chọn xóa
                              }}
                              disabled={invoice.isDelete}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2"
                              />
                              Xóa hóa đơn
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))
          ):(
            <div className="flex  justify-center h-full">
              <p className="text-gray-500">Hiện tại không có hóa đơn nào</p>
            </div>
          )}
        </ul>
      </div>

      {/* Chi tiết hóa đơn */}
      <div className="w-2/3 bg-white h-[calc(100vh-2.5rem)] flex flex-col">
        {/* Title cố định */}
        <h2 className="text-lg font-bold text-center py-2 shadow-md sticky top-0 bg-white">
          Thông tin chi tiết
        </h2>

        {/* Phần cuộn được */}
        <div
          className="p-4 flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {selectedInvoice ? (
            <>
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-500 mx-10"></div>
                </div>
                <h2
                  className={`relative bg-white px-4 text-xl  text-gray-800 ${
                    selectedInvoice.isDelete
                      ? "text-red-500 font-medium"
                      : "font-bold"
                  }`}
                >
                  Hóa đơn {selectedInvoice.id}{" "}
                  {selectedInvoice.isDelete && (
                    <span className="text-red-500">đã bị hủy</span>
                  )}
                </h2>
              </div>

              {/* Thông tin khách hàng và nhân viên */}
              <div className="mt-2  text-base  mx-10">
                <p className="my-3 py-1 flex justify-between border-b border-gray-400">
                  <span>Thời gian</span>{" "}
                  <span>
                    {dayjs(selectedInvoice.date)
                      .tz("Asia/Ho_Chi_Minh")
                      .format("HH:mm:ss DD/MM/YYYY")}
                  </span>
                </p>
                <p className="my-3 py-1 flex justify-between border-b border-gray-400">
                  <span>Khách hàng</span>{" "}
                  <span>{selectedInvoice.customerName}</span>
                </p>
                <p className="my-3 py-1 flex justify-between border-b border-gray-400">
                  <span>Nhân viên</span>{" "}
                  <span>{selectedInvoice.staffName}</span>
                </p>
                <p className="my-3 py-1 flex justify-between border-b border-gray-400">
                  <span>Giảm giá</span>{" "}
                  <span>{selectedInvoice.discount.toLocaleString()}</span>
                </p>
                <p className="my-3 py-1 flex justify-between border-b border-gray-400">
                  <span>Ghi chú</span>{" "}
                  <span>{selectedInvoice.paymentMethod}</span>
                </p>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="mt-6">
                <h3 className="font-semibold w-full text-center pb-2">
                  Danh sách sản phẩm
                </h3>

                <ul className="w-full">
                  {/* Header */}
                  <li className="flex font-semibold bg-gray-100 p-2 mx-10 border-b border-t text-sm">
                    <span className="w-1/12 text-center">#</span>
                    <span className="w-4/12">Tên sản phẩm</span>
                    <span className="w-2/12 text-center">Đơn giá</span>
                    <span className="w-1/12 text-center">Số lượng</span>
                    <span className="w-2/12 text-center">Giảm giá</span>
                    <span className="w-2/12 text-right">Thành tiền</span>
                  </li>

                  {/* Danh sách sản phẩm */}
                  {selectedInvoice.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between p-2 mx-10 border-b border-gray-400 text-sm"
                    >
                      <span className="w-1/12 text-center">{index + 1}</span>
                      <span className="w-4/12 truncate">
                        {item.productName}
                      </span>
                      <span className="w-2/12 text-center">
                        {item.price.toLocaleString()}đ
                      </span>
                      <span className="w-1/12 text-center">
                        {item.quantity}
                      </span>
                      <span className="w-2/12 text-center">
                        {(item.price - item.after_discount).toLocaleString()}đ
                      </span>
                      <span className="w-2/12 text-right">
                        {(item.after_discount * item.quantity).toLocaleString()}
                        đ
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tổng tiền */}
              <div className="mt-4 text-right mx-10">
                Tổng thành tiền: {(selectedInvoice.total + selectedInvoice.discount).toLocaleString()}đ
              </div>
              <div className="mt-4 text-right font-bold mx-10">
                Tiền thanh toán: {selectedInvoice.total.toLocaleString()}đ
              </div>

              {/* Nút xóa */}
              {!selectedInvoice.isDelete ? (
                <div className="mt-4 text-right font-bold mx-10">
                  <button
                    onClick={() => setConfirmDeleteId(selectedInvoice.id)}
                    disabled={selectedInvoice.isDelete}
                    className="text-white bg-red-600 p-2 text-sm rounded mt-2"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Xóa hóa đơn
                  </button>
                </div>
              ) : (
                ""
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">
              Chọn một hóa đơn để xem chi tiết
            </p>
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30 backdrop-blur-sm z-20"></div>
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md z-50">
            <h2 className="text-lg font-semibold mb-4">Xác nhận xóa hóa đơn</h2>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa{" "}
              <strong>hóa đơn {confirmDeleteId}</strong> không? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setConfirmDeleteId(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => deleteInvoiceById(confirmDeleteId)}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LishsuHoadon;
