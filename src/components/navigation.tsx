import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import { useState, useEffect, useRef } from "react";
import ChangePassword from "./ChangePassword";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: "/", icon: "fas fa-eye", label: "Tổng quan" },
    { path: "/hang-hoa", icon: "fas fa-box", label: "Hàng hóa" },
    { path: "/combo", icon: "fas fa-layer-group", label: "Combo" },
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-md">
      {/* Top bar */}
      <nav className="flex items-center justify-between py-3 px-4 md:px-8 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="UIT Store Logo" className="h-10 w-10 object-contain" />
          <span className="font-bold text-xl text-gray-800">UIT Store</span>
        </div>

        {/* Account & Hamburger */}
        <div className="flex items-center space-x-4">
          {/* Account Icon */}
          <button
            className="border border-gray-200 px-2 py-1 bg-gray-100 hover:bg-gray-300 rounded-full transition-colors"
            onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}
          >
            <i className="fas fa-user text-gray-600"></i>
          </button>

          {/* Hamburger icon - mobile only */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <i className="fas fa-bars text-xl text-gray-700"></i>
            </button>
          </div>
        </div>

        {/* Account popup */}
        {isAccountPopupOpen && (
          <div
            ref={popupRef}
            className="absolute right-4 top-[60px] w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <ul>
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsChangePasswordOpen(true);
                    setIsAccountPopupOpen(false);
                  }}
                >
                  <i className="fas fa-key text-gray-600 mr-1"></i> Thay đổi mật khẩu
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt text-gray-600 mr-1"></i> Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Desktop menu */}
      <nav className="bg-[#0070F4] px-4 md:px-6 overflow-x-auto hidden md:block">
        <ul className="flex min-w-max space-x-3 md:space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center py-3 px-2 text-sm md:text-base text-white transition-colors relative group ${
                  location.pathname === item.path ? "font-semibold" : "hover:text-blue-100"
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0070F4] px-4 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 px-3 text-white rounded hover:bg-blue-600 ${
                    location.pathname === item.path ? "font-semibold" : ""
                  }`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isChangePasswordOpen && (
        <ChangePassword onClose={() => setIsChangePasswordOpen(false)} />
      )}
    </div>
  );
};

export default Navigation;
