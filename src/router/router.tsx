import { Route, Routes, Navigate } from "react-router-dom";
import TongQuan from "../pages/TongQuan";
import HangHoa from "../pages/HangHoa";
import HoaDon from "../pages/HoaDon";
import KhoHang from "../pages/KhoHang";
import NhanVien from "../pages/NhanVien";
import BaoCao from "../pages/BaoCao";
import KhachHang from "../pages/KhachHang";
import Login from "../pages/Login";
import BanHang from "../pages/BanHang";
import LichsuHoadon from "../pages/LichsuHoadon";
import DoanhThu from "../pages/DoanhThu";

const Router = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<TongQuan />} />
            <Route path="/hang-hoa" element={<HangHoa />} />
            <Route path="/hoa-don" element={<HoaDon />} />
            <Route path="/kho-hang" element={<KhoHang />} />
            <Route path="/nhan-vien" element={<NhanVien />} />
            <Route path="/bao-cao" element={<BaoCao />} />
            <Route path="/khach-hang" element={<KhachHang />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/ban-hang" element={<BanHang />} />
            <Route path="/lich-su-hoa-don" element={<LichsuHoadon />} />
            <Route path="/doanh-thu" element={<DoanhThu />} />
        </Routes>
    );
}

export default Router;