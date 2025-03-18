import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import bgLogo from "../assets/login-bg-update.png"

function Login() {
  const navigate = useNavigate();

  const handleManageClick = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgLogo})` }}>
      <Helmet>
        <title>Đăng nhập</title>
      </Helmet>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl text-center text-[#1E4B7F] font-bold mb-4">Super Store UIT</h1>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Số điện thoại</label>
            <input type="text" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu</label>
            <input type="password" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-gray-700">Duy trì đăng nhập</label>
            </div>
            <a href="#" className="text-blue-500 hover:underline">Quên mật khẩu?</a>
          </div>
          <div className="flex space-x-4">
            <button type="button" onClick={handleManageClick} className="cursor-pointer flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 hover:scale-[1.02] hover:shadow-md
                                outline-none ring-indigo-500/70 ring-offset-2 focus-visible:ring-2 active:scale-[0.98] 
                                transition ">
              <i className="fas fa-home mr-2"></i> Quản lý
            </button>
            <button type="button" className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 hover:scale-[1.02] hover:shadow-md
                                outline-none ring-indigo-500/70 ring-offset-2 focus-visible:ring-2 active:scale-[0.98] 
                                transition">
              <i className="fas fa-shopping-cart mr-2"></i> Bán hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;