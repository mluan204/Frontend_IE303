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
  const [isEmployeeSubmenuOpen, setIsEmployeeSubmenuOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const employeeMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: "/", icon: "fas fa-eye", label: "Tổng quan" },
    { path: "/hang-hoa", icon: "fas fa-box", label: "Hàng hóa" },
    { path: "/hoa-don", icon: "fas fa-receipt", label: "Hóa đơn" },
    { path: "/combo", icon: "fas fa-layer-group", label: "Combo" },
    { path: "/kho-hang", icon: "fas fa-warehouse", label: "Kho hàng" },
    { path: "/nhan-vien", icon: "fas fa-users", label: "Nhân viên" },
    { path: "/ca-lam", icon: "fas fa-clock", label: "Ca làm" },
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
      if (
        employeeMenuRef.current &&
        !employeeMenuRef.current.contains(event.target as Node)
      ) {
        setIsEmployeeSubmenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  return (
    <div className="bg-white shadow-md overflow-visible relative">
      {/* Top bar */}
      <nav className="flex items-center justify-between py-3 px-4 md:px-8 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={Logo}
            alt="UIT Store Logo"
            className="h-10 w-10 object-contain"
          />
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
          <div className="xl:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <i className="fas fa-bars text-xl text-gray-700"></i>
            </button>
          </div>
        </div>

        {/* Account popup */}
        {isAccountPopupOpen && (
          <div
            ref={popupRef}
            className="absolute right-4 top-[60px] w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[999]"
          >
            <ul>
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-t-lg"
                  onClick={() => {
                    setIsChangePasswordOpen(true);
                    setIsAccountPopupOpen(false);
                  }}
                >
                  <i className="fas fa-key text-gray-600 mr-1"></i> Thay đổi mật
                  khẩu
                </button>
              </li>
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-b-lg"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt text-gray-600 mr-1"></i>{" "}
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Desktop menu */}
      <nav className="bg-[#0070F4] px-4 md:px-6 hidden xl:block w-full overflow-visible relative">
        <ul className="flex items-center justify-center min-w-max space-x-3 md:space-x-4 lg:space-x-6 relative">
          <li>
            <Link
              to="/"
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out"
            >
              <i className="fas fa-eye mr-2"></i> Tổng quan
            </Link>
          </li>

          {/* Hàng hóa + Combo */}
          <li
            className="relative"
            onMouseEnter={() => setIsProductOpen(true)}
            onMouseLeave={() => setIsProductOpen(false)}
          >
            <div
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer "
              onClick={() => navigate("/hang-hoa")}
            >
              <i className="fas fa-box mr-2"></i> Hàng hóa
              <i className="fas fa-caret-down ml-1"></i>
            </div>
            {isProductOpen && (
              <ul className="absolute left-0 top-full bg-[#0056b3] text-white shadow-md w-full z-30 rounded-md overflow-hidden">
                <li>
                  <Link
                    to="/combo"
                    className="block px-4 py-2 hover:bg-blue-600 items-center gap-2 transition duration-300 ease-in-out"
                    onClick={() => setIsProductOpen(false)}
                  >
                    <i className="fas fa-layer-group"></i> Combo
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/hoa-don"
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out"
            >
              <i className="fas fa-receipt mr-2"></i> Hóa đơn
            </Link>
          </li>

          <li>
            <Link
              to="/kho-hang"
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out"
            >
              <i className="fas fa-warehouse mr-2"></i> Kho hàng
            </Link>
          </li>

          {/* Nhân viên + Ca làm */}
          <li
            className="relative"
            onMouseEnter={() => setIsEmployeeOpen(true)}
            onMouseLeave={() => setIsEmployeeOpen(false)}
          >
            <div
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer"
              onClick={() => navigate("/nhan-vien")}
            >
              <i className="fas fa-users mr-2"></i> Nhân viên
              <i className="fas fa-caret-down ml-1"></i>
            </div>
            {isEmployeeOpen && (
              <ul className="absolute left-0 top-full bg-[#0056b3] text-white shadow-md w-full z-50 rounded-md overflow-hidden">
                <li>
                  <Link
                    to="/ca-lam"
                    className="block px-4 py-2 hover:bg-blue-600 items-center gap-2 transition duration-300 ease-in-out"
                    onClick={() => setIsEmployeeOpen(false)}
                  >
                    <i className="fas fa-clock"></i> Ca làm
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/khach-hang"
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out"
            >
              <i className="fas fa-user mr-2"></i> Khách hàng
            </Link>
          </li>

          <li>
            <Link
              to="/bao-cao"
              className="flex items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-900 hover:scale-[1.02] transition duration-300 ease-in-out"
            >
              <i className="fas fa-chart-bar mr-2"></i> Báo cáo
            </Link>
          </li>
        </ul>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#0070F4] px-4 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 px-3 text-white rounded hover:bg-blue-600 ${
                    location.pathname === item.path ? "bg-blue-600" : ""
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
