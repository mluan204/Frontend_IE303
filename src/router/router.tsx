import { Route, Routes, Navigate } from "react-router-dom";
import TongQuan from "../pages/TongQuan";
import HangHoa from "../pages/HangHoa";
import SoQuy from "../pages/SoQuy";
import NhanVien from "../pages/NhanVien";
import BaoCao from "../pages/BaoCao";
import KhachHang from "../pages/KhachHang";
import Login from "../pages/Login";

const Router = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<TongQuan />} />
            <Route path="/hang-hoa" element={<HangHoa />} />
            <Route path="/so-quy" element={<SoQuy />} />
            <Route path="/nhan-vien" element={<NhanVien />} />
            <Route path="/bao-cao" element={<BaoCao />} />
            <Route path="/khach-hang" element={<KhachHang />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default Router;