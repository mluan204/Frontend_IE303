// utils/printBillToPDF.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

export async function printBillToPDF(bill: Bill) {
  // 1. Tạo HTML tạm để render
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "600px";
  container.style.padding = "20px";
  container.style.background = "white";
  container.innerHTML = `
    <h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 5px;">JDK STORE</h1>
    <p style="text-align: center; margin: 0; font-size: 14px;">Khu phố 6, phường Linh Trung, Thủ Đức, TP. Hồ Chí Minh</p>
    <p style="text-align: center; margin: 0 0 10px; font-size: 14px;">SĐT: 0377417612</p>
    <h2 style="text-align: center; font-size: 20px; font-weight: bold; margin-top: 20px;">HÓA ĐƠN THANH TOÁN</h2>
    <p style="text-align: center; font-size: 14px;">Mã hóa đơn ${bill.id}</p>
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
      <span>Thời gian</span>
      <span>${new Date(bill.createdAt).toLocaleString()}</span>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 14px;">
      <span>Nhân viên</span>
      <span>${bill.employee.name}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
      <span>Khách hàng</span>
      <span>${bill.customer.name}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
      <span>Điện thoại</span>
      <span>${bill.customer.phone_number}</span>
    </div>
    
    <table style="width:100%; border-collapse:collapse; margin-top: 30px; font-size: 13px;">
  <thead>
    <tr style="border-top: 1px solid black; margin-bottom: 2px;">
      <th style="width: 50%; text-align: left; padding: 4px;">Sản phẩm</th>
      <th style="width: 10%; text-align: left; padding: 4px;">SL</th>
      <th style="width: 15%; text-align: left; padding: 4px;">Đơn giá</th>
      <th style="width: 10%; text-align: left; padding: 4px;">Giảm</th>
      <th style="width: 15%; text-align: left; padding: 4px;">Thành tiền</th>
    </tr>
  </thead>
  <tbody>
    ${bill.billDetails
      .map(
        (item, index) => `
        <tr>
          <td style="text-align: left; padding: 4px;">${item.productName}</td>
          <td style="text-align: left; padding: 4px;">${item.quantity}</td>
          <td style="text-align: left; padding: 4px;">${item.price.toLocaleString()}</td>
          <td style="text-align: left; padding: 4px;">${item.afterDiscount.toLocaleString()}</td>
          <td style="text-align: left; padding: 4px;">${((item.afterDiscount ? item.afterDiscount : item.price) * item.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join("")}
  </tbody>
</table>

    <div style="border-top: 1px solid black; display: flex; justify-content: space-between; margin-top: 20px; font-size: 14px; ">
      <span>Tổng SL hàng</span>
      <span>${bill.totalQuantity}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
          
      <span><strong>Tổng tiền</strong></span>
      <span>${bill.total_cost.toLocaleString()}</strong></span>
      
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px;">
      <span>Giảm giá</span>
      <span>${bill.pointsToUse?.toLocaleString() ?? 0}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-top: 20px; border-top: 1px solid black;">

      <span><strong>Tổng thanh toán</strong></span>
      <span><strong>${(bill.after_discount-bill.pointsToUse).toLocaleString()}</strong></span>

    </div>
    <p style ="font-size: 13px;">+ ${bill.notes}</p>
    <p style="text-align:center;margin-top:30px; font-size: 12px;"><i>Cảm ơn quý khách đã mua hàng tại JDK Store!</i></p>
  `;
  document.body.appendChild(container);

  // 2. Chụp canvas và tạo PDF
  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`HoaDon_${bill.id}.pdf`);

  // 3. Xoá DOM tạm
  document.body.removeChild(container);
}
