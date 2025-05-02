import { useState } from "react";
import { Link } from "react-router-dom";
import { faBars, faShop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NavigationSale = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            {/* Navbar */}
            <nav className="flex h-10 items-center justify-between px-6 bg-[#0070F4] relative">
                {/* Icon menu (bên trái) */}
                <button 
                    className="text-white p-2" 
                    onClick={() => setIsOpen(true)}
                >
                    <FontAwesomeIcon icon={faBars} size="lg" />
                </button>

                {/* Logo UIT Store */}
                <div className="absolute left-1/2 transform -translate-x-1/2 font-bold text-xl text-white">
                    JDK Store
                </div>
            </nav>

            {/* Overlay mờ nền khi mở menu */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-60 backdrop-blur-sm z-10"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Menu trượt từ bên trái */}
            <div 
                className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform z-20 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header menu */}
                <div className="flex items-center bg-[#0070F4] text-center justify-center h-10 border-b border-gray-400 ">
                    <span className="flex text-white font-bold text-center text-lg">Logo</span>                    
                </div>

                {/* Danh sách menu */}
                <ul className="">
                    <Link to="/ban-hang" onClick={() => setIsOpen(false)}>
                        <li className=" p-3 border-b border-gray-400 hover:bg-blue-100"><i className="fas fa-store mr-2"></i> Bán hàng </li>
                    </Link>
                    <Link to="/lich-su-hoa-don" onClick={() => setIsOpen(false)}>
                        <li className="p-3 border-b border-gray-400 hover:bg-blue-100"><i className="fas fa-receipt mr-2"></i>  Lịch sử hóa đơn</li>
                    </Link>
                    <Link to="/doanh-thu" onClick={() => setIsOpen(false)}>
                        <li className="p-3 border-b border-gray-400 hover:bg-blue-100"><i className="fas fa-chart-bar mr-2"></i> Báo cáo doanh thu</li>
                    </Link>
                </ul>
            </div>
        </div>
    );
};

export default NavigationSale;
