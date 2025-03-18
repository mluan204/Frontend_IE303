import { Link } from 'react-router-dom';
import Logo from '../assets/logoTest.jpg'


const Navigation = () => {
    return (
        <div>
            <nav className="flex items-center py-2 px-6">
                <div className="flex items-center mr-auto">
                    <img src={Logo} alt="Logo" className="h-10 mr-2" />
                    <span className="font-bold text-lg">UIT Store</span>
                </div>
            </nav>

            <nav className='flex bg-[#0070F4] items-center py-2 px-6'>
                <ul className="flex space-x-10 text-white ">
                    <li>
                        <Link to="/" className="flex items-center hover:underline">
                            <i className="fas fa-eye mr-1"></i> Tổng quan
                        </Link>
                    </li>
                    <li>
                        <Link to="/hang-hoa" className="flex items-center hover:underline">
                            <i className="fas fa-box mr-1"></i> Hàng hóa
                        </Link>
                    </li>
                    <li>
                        <Link to="/so-quy" className="flex items-center hover:underline">
                            <i className="fas fa-dollar-sign mr-1"></i> Sổ quỹ
                        </Link>
                    </li>
                    <li>
                        <Link to="/nhan-vien" className="flex items-center hover:underline">
                            <i className="fas fa-users mr-1"></i> Nhân viên
                        </Link>
                    </li>
                    <li>
                        <Link to="/bao-cao" className="flex items-center hover:underline">
                            <i className="fas fa-chart-bar mr-1"></i> Báo cáo
                        </Link>
                    </li>
                    <li>
                        <Link to="/khach-hang" className="flex items-center hover:underline">
                            <i className="fas fa-user mr-1"></i> Khách hàng
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Navigation;