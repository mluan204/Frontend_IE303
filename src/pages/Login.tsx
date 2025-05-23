import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import bgLogo from "../assets/login-bg-update.png"
import { useEffect, useState } from "react";
import { login } from "../service/mainApi";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

function Login() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    username: false,
    password: false,
    loginError: false
  });

  useEffect(() => {
    const expired = localStorage.getItem("sessionExpired");
    if (expired === "true") {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        autoClose: 1500
      });
      localStorage.removeItem("sessionExpired");
    }
  }, []);

  const validateForm = () => {
    const newErrors = {
      username: username.trim() === "",
      password: password.trim() === "",
      loginError: false
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setErrors(prev => ({ ...prev, username: false, loginError: false }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors(prev => ({ ...prev, password: false, loginError: false }));
  };

  const handleManageClick = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    const result = await login(username, password);
    if (result === 101) {
      setErrors(prev => ({ ...prev, loginError: true }));
      toast.error("Tài khoản hoặc mật khẩu không đúng");
    } else {
      setErrors(prev => ({ ...prev, loginError: false }));
      handleLogin();
    }
  };

  const handleEmployeeClick = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    const result = await login(username, password);
    if (result === 101) {
      setErrors(prev => ({ ...prev, loginError: true }));
      toast.error("Tài khoản hoặc mật khẩu không đúng");
    } else {
      setErrors(prev => ({ ...prev, loginError: false }));
      navigate('/ban-hang');
    }
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
            <label className="block text-gray-700">Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full px-3 py-2 border rounded-lg ${(errors.username || errors.loginError) ? 'border-red-500 bg-red-50' : ''}`}
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">Vui lòng nhập tài khoản</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-lg ${(errors.password || errors.loginError) ? 'border-red-500 bg-red-50' : ''}`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">Vui lòng nhập mật khẩu</p>}
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
            <button type="button" onClick={handleEmployeeClick} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 hover:scale-[1.02] hover:shadow-md
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