import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo_white.png";
import { useState, useEffect, useRef } from "react";
import ChangePassword from "./ChangePassword";
import Chatbot from "./Chatbot";

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
    { path: "/combo", icon: "fas fa-layer-group", label: "Combo" },
    { path: "/hoa-don", icon: "fas fa-receipt", label: "Hóa đơn" },
    { path: "/kho-hang", icon: "fas fa-warehouse", label: "Kho hàng" },
    { path: "/nhan-vien", icon: "fas fa-users", label: "Nhân viên" },
    { path: "/ca-lam", icon: "fas fa-clock", label: "Ca làm" },
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
    <div>
    <div className="bg-white shadow-md overflow-visible relative">
      {/* Desktop menu */}
      <nav className="bg-[#0070F4] flex flex-row items-center justify-between py-2 px-4 md:px-6 w-full overflow-visible">
      {/* <nav className="bg-[#0070F4] flex flex-col md:flex-row items-center justify-between py-2 px-4 md:px-6 xl:flex-row w-full overflow-visible"> */}
        <div className="flex items-center space-x-3">
          <img
            src={Logo}
            alt="UIT Store Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="font-bold text-xl text-white">JDK Store</span>
        </div>

        <ul className="hidden xl:flex items-center justify-center min-w-max space-x-3 md:space-x-4 lg:space-x-6">
          <li>
            <Link
              to="/"
              className={`flex rounded-md items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition duration-300 ease-in-out ${
                location.pathname === "/" ? "bg-blue-700" : ""
              }`}
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
              className={`flex rounded-md items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer ${
                location.pathname === "/hang-hoa" ? "bg-blue-700" : ""
              }`}
              onClick={() => navigate("/hang-hoa")}
            >
              <i className="fas fa-box mr-2"></i> Hàng hóa
              <i className={`fas ${isProductOpen ? "fa-caret-up" : "fa-caret-down"} ml-1`}></i>
            </div>
            {isProductOpen && (
              <ul className="absolute left-0 top-full bg-[#0070F4] text-white shadow-md z-30 rounded-md overflow-hidden">
                <li>
                  <Link
                    to="/hang-hoa"
                    className={`block px-4 py-2 hover:bg-blue-700 items-center gap-2 transition duration-300 ease-in-out whitespace-nowrap ${
                      location.pathname === "/hang-hoa" ? "bg-blue-700" : ""
                    }`}
                    onClick={() => setIsProductOpen(false)}
                  >
                    <i className="fas fa-box"></i> Quản lý hàng hóa
                  </Link>
                </li>

                <li>
                  <Link
                    to="/combo"
                    className={`block  px-4 py-2 hover:bg-blue-700 items-center gap-2 transition duration-300 ease-in-out whitespace-nowrap ${
                      location.pathname === "/combo" ? "bg-blue-700" : ""
                    }`}
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
              className={`flex rounded-md items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition duration-300 ease-in-out ${
                location.pathname === "/hoa-don" ? "bg-blue-700" : ""
              }`}
            >
              <i className="fas fa-receipt mr-2"></i> Hóa đơn
            </Link>
          </li>

          <li>
            <Link
              to="/kho-hang"
              className={`flex rounded-md items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition duration-300 ease-in-out ${
                location.pathname === "/kho-hang" ? "bg-blue-700" : ""
              }`}
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
              className={`flex rounded-md items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer ${
                location.pathname === "/nhan-vien" ? "bg-blue-700" : ""
              }`}
              onClick={() => navigate("/nhan-vien")}
            >
              <i className="fas fa-users mr-2"></i> Nhân viên
              <i className={`fas ${isEmployeeOpen ? "fa-caret-up" : "fa-caret-down"} ml-1`}></i>
            </div>
            {isEmployeeOpen && (
              <ul className="absolute left-0 top-full bg-[#0070F4] text-white shadow-md z-50 rounded-md overflow-hidden">
                <li>
                  <Link
                    to="/nhan-vien"
                    className={`block px-4 py-2 hover:bg-blue-700 items-center gap-2 transition duration-300 ease-in-out whitespace-nowrap ${
                      location.pathname === "/nhan-vien" ? "bg-blue-700" : ""
                    }`}
                    onClick={() => setIsEmployeeOpen(false)}
                  >
                    <i className="fas fa-users"></i> Quản lý nhân viên
                  </Link>
                </li>

                <li>
                  <Link
                    to="/ca-lam"
                    className={`block px-4 py-2 hover:bg-blue-700 items-center gap-2 transition duration-300 ease-in-out whitespace-nowrap ${
                      location.pathname === "/ca-lam" ? "bg-blue-700" : ""
                    }`}
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
              className={`flex rounded-md items-center py-3 px-2 text-white hover:text-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition duration-300 ease-in-out ${
                location.pathname === "/khach-hang" ? "bg-blue-700" : ""
              }`}
            >
              <i className="fas fa-user mr-2"></i> Khách hàng
            </Link>
          </li>
        </ul>

        {/* Account & Hamburger */}
        <div className="flex items-center space-x-4">
          {/* Account Icon */}
          <button
            data-testid="account-icon"
            className="border border-gray-200 cursor-pointer px-2 py-1 bg-gray-100 hover:bg-gray-300 rounded-full transition-colors"
            onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}
          >
            <i className="fas fa-user text-gray-600"></i>
          </button>

          {/* Hamburger icon - mobile only */}
          <div className="xl:hidden">
            <button
              data-testid="hamburger-icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="fas cursor-pointer fa-bars text-xl text-white"></i>
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
                  className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 hover:rounded-t-lg"
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
                  className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 hover:rounded-b-lg"
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
    <Chatbot />
  </div>
  );
};

export default Navigation;
