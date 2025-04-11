import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faPrint, faTrash } from "@fortawesome/free-solid-svg-icons";

interface Invoice {
  id: string;
  date: string;
  total: number;
  customerName: string;
  staffName: string;
  paymentMethod: string;
  discount: number;
  items: { name: string; quantity: number; price: number, discount: number }[];
}

const invoicesData: Invoice[] = [
  {
    id: 'HD001',
    date: '2025-04-10',
    customerName: 'Nguyễn Văn A', // hoặc null / undefined
    staffName: 'Trần Thị B',
    paymentMethod: 'Tiền mặt' ,
    discount: 10000, // số tiền giảm giá
    total: 150000,
    items: [
      { name: "Sản phẩm dsds ds hfsd vshdgfv snbvhsgvc csvcyhsd sdhvsghcs sgcvA", quantity: 2, discount:145000, price: 150000 },
      { name: "Sản phẩm B", quantity: 1, price: 200000, discount:195000 },
      { name: "Sản phẩm A", quantity: 2, price: 150000, discount:145000 },
      
    ],
  },
  {
    id: 'HD002',
    date: '2025-04-10',
    customerName: 'Nguyễn Văn A', // hoặc null / undefined
    staffName: 'Trần Thị B',
    paymentMethod: 'Tiền mặt' ,
    discount: 10000, // số tiền giảm giá
    total: 150000,
    items: [{ name: "Sản phẩm C", quantity: 3, price: 250000, discount:195000 }],
  },
  
];

function LishsuHoadon() {
  const [invoices, setInvoices] = useState<Invoice[]>(invoicesData);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
    if (selectedInvoice?.id === id) setSelectedInvoice(null);
  };

  const handlePrint = (id: string) => {
    alert(`Đang in hóa đơn ${id}...`);
  };

  return (
    <div onMouseDown={()=>setMenuOpen(null)} className="flex h-[calc(100vh-2.5rem)] bg-gray-100 overflow-y-hidden">
      {/* Danh sách hóa đơn */}
      <div className="w-1/3 bg-white border-r-2 border-gray-300 flex flex-col h-[calc(100vh-2.5rem)]">
            {/* Tiêu đề cố định */}
            <h2 className="text-lg font-bold text-center py-2 shadow-md bg-white sticky top-0 ">
                Danh sách hóa đơn
            </h2>

            {/* Danh sách hóa đơn có thể cuộn */}
            <ul className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {invoices.map((invoice) => (
                <li key={invoice.id} className="border-b border-gray-300">
                    <div
                    className={`cursor-pointer ${
                        selectedInvoice?.id === invoice.id ? "bg-blue-100" : "hover:bg-gray-200"
                    } p-3 flex justify-between items-center`}
                    onClick={() => setSelectedInvoice(invoice)}
                    >
                    <div className="flex flex-col">
                        <p className="font-semibold">Mã: {invoice.id}</p>
                        <div className="flex justify-between space-x-6 mt-1 text-base">
                        <p>Ngày: {invoice.date}</p>
                        <p>Số lượng: {invoice.items.length}</p>
                        <p className="font-medium">Tổng tiền: {invoice.total.toLocaleString()}đ</p>
                        </div>
                    </div>

                    {/* Icon More (⋮) */}
                    <div className="relative">
                        <button
                        className="text-gray-500 hover:bg-gray-200 rounded-full p-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === invoice.id ? null : invoice.id);
                        }}
                        >
                        <FontAwesomeIcon icon={faEllipsisV} />
                        </button>

                        {/* Popup menu */}
                        {menuOpen === invoice.id && (
                        <div className="absolute right-0 top-full mt-2 min-w-[150px] bg-white shadow-lg rounded-lg border p-2 z-10">
                            <button
                            className="flex items-center px-4 py-2 text-sm hover:bg-gray-200 w-full"
                            onClick={() => handlePrint(invoice.id)}
                            >
                            <FontAwesomeIcon icon={faPrint} className="mr-2" />
                            In hóa đơn
                            </button>
                            <button
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-200 w-full"
                            onClick={() => handleDelete(invoice.id)}
                            >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Xóa hóa đơn
                            </button>
                        </div>
                        )}
                    </div>
                    </div>
                </li>
                ))}
            </ul>
        </div>

   

      {/* Chi tiết hóa đơn */}
      <div className="w-2/3 bg-white h-[calc(100vh-2.5rem)] flex flex-col">
        {/* Title cố định */}
        <h2 className="text-lg font-bold text-center py-2 shadow-md sticky top-0 bg-white">
            Thông tin chi tiết
        </h2>

        {/* Phần cuộn được */}
        <div className="p-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {selectedInvoice ? (
              <>
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-500 mx-10"></div>
                  </div>
                  <h2 className="relative bg-white px-4 text-xl font-bold text-gray-800">
                    Hóa đơn {selectedInvoice.id}
                  </h2>
                </div>              

                {/* Thông tin khách hàng và nhân viên */}
                <div className="mt-2  text-base  mx-10">
                  <p className="my-3 py-1 flex justify-between border-b border-gray-400"><span >Thời gian</span> <span >{selectedInvoice.date}</span></p>
                  <p className="my-3 py-1 flex justify-between border-b border-gray-400"><span >Khách hàng</span> <span >{selectedInvoice.customerName}</span></p>
                  <p className="my-3 py-1 flex justify-between border-b border-gray-400"><span >Nhân viên</span> <span >{selectedInvoice.staffName}</span></p>
                  <p className="my-3 py-1 flex justify-between border-b border-gray-400"><span >Giảm giá</span> <span >{selectedInvoice.discount.toLocaleString()}</span></p>
                  <p className="my-3 py-1 flex justify-between border-b border-gray-400"><span >Ghi chú</span> <span >{selectedInvoice.paymentMethod}</span></p>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="mt-6">
                  <h3 className="font-semibold w-full text-center pb-2">Danh sách sản phẩm</h3>

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
                      <li key={index} className="flex justify-between p-2 mx-10 border-b border-gray-400 text-sm">
                        <span className="w-1/12 text-center">{index + 1}</span>
                        <span className="w-4/12 truncate">{item.name}</span>
                        <span className="w-2/12 text-center">{item.price.toLocaleString()}đ</span>  
                        <span className="w-1/12 text-center">{item.quantity}</span>
                        <span className="w-2/12 text-center">{item.discount.toLocaleString()}đ</span>
                        <span className="w-2/12 text-right">{(item.discount * item.quantity).toLocaleString()}đ</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tổng tiền */}
                <div className="mt-4 text-right font-bold mx-10">
                  Tổng tiền: {selectedInvoice.total.toLocaleString()}đ
                </div>

                {/* Nút xóa */}
                <div className="mt-4 text-right font-bold mx-10">
                  <button className="text-white bg-red-600 p-2 text-sm rounded mt-2">
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Xóa hóa đơn
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Chọn một hóa đơn để xem chi tiết</p>
            )}
          </div>

        </div>

    </div>
  )

}

export default LishsuHoadon;
