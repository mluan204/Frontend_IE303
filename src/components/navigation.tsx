import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import { useState, useEffect, useRef } from "react";
import ChangePassword from "./ChangePassword";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null); // Tham chiếu đến popup

  const navItems = [
    { path: "/", icon: "fas fa-eye", label: "Tổng quan" },
    { path: "/hang-hoa", icon: "fas fa-box", label: "Hàng hóa" },
    { path: "/hoa-don", icon: "fas fa-receipt", label: "Hóa đơn" },
    { path: "/kho-hang", icon: "fas fa-warehouse", label: "Kho hàng" },
    { path: "/nhan-vien", icon: "fas fa-users", label: "Nhân viên" },
    { path: "/bao-cao", icon: "fas fa-chart-bar", label: "Báo cáo" },
    { path: "/khach-hang", icon: "fas fa-user", label: "Khách hàng" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsAccountPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
    navigate("/login"); // Chuyển hướng đến màn hình đăng nhập
  };

  return (
    <div className="bg-white shadow-md">
      {/* Top navigation bar */}
      <nav className="flex items-center justify-between py-3 px-8 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={Logo}
            alt="UIT Store Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="font-bold text-xl text-gray-800">UIT Store</span>
        </div>
        <div className="flex items-center mt-2">
          <button
            className="border border-gray-200 px-2 py-1 bg-gray-100 hover:bg-gray-300 rounded-full transition-colors"
            onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}
          >
            <i className="fas fa-user text-gray-600 "></i>
          </button>
          {isAccountPopupOpen && (
            <div
              ref={popupRef}
              className="absolute right-8 top-[50px] w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <ul>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 rounded-t-lg hover:bg-gray-100"
                    onClick={() => {
                      setIsChangePasswordOpen(true); // Mở popup ChangePassword
                      setIsAccountPopupOpen(false); // Đóng popup Account
                    }}
                  >
                    <i className="fas fa-key text-gray-600 mr-1"></i>
                    <span>Thay đổi mật khẩu</span>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 rounded-b-lg hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt text-gray-600 mr-1"></i>
                    <span>Đăng xuất</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Main navigation */}
      <nav className="bg-[#0070F4] px-8">
        <ul className="flex space-x-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center py-4 text-white transition-colors relative group
                  ${
                    location.pathname === item.path
                      ? "font-semibold"
                      : "hover:text-blue-100"
                  }`}
              >
                <i className={`${item.icon} mr-2 text-sm`}></i>
                {item.label}
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {isChangePasswordOpen && (
        <ChangePassword onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </div>
  );
};

export default Navigation;
