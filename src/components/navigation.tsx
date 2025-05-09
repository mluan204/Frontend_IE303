import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: "fas fa-eye", label: "Tổng quan" },
    { path: "/hang-hoa", icon: "fas fa-box", label: "Hàng hóa" },
    { path: "/hoa-don", icon: "fas fa-receipt", label: "Hóa đơn" },
    { path: "/kho-hang", icon: "fas fa-warehouse", label: "Kho hàng" },
    { path: "/nhan-vien", icon: "fas fa-users", label: "Nhân viên" },
    { path: "/bao-cao", icon: "fas fa-chart-bar", label: "Báo cáo" },
    { path: "/khach-hang", icon: "fas fa-user", label: "Khách hàng" },
  ];

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
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <i className="fas fa-cog text-gray-600"></i>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i className="fas fa-sign-out-alt text-gray-600"></i>
          </button>
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
    </div>
  );
};

export default Navigation;
