import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import bgLogo from "../assets/login-bg-update.png";
import { useState } from "react";
import { login } from "../service/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner} from "@fortawesome/free-solid-svg-icons";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    username: false,
    password: false,
    message: "",
  });


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error.username || error.message) {
      setError({ username: false, password: false, message: "" });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error.password || error.message) {
      setError({ username: false, password: false, message: "" });
    }
  };

  const handleLogin = async (redirectPath: string) => {
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    if (result) {
      navigate(redirectPath);
    } else {
      setError({
        username: true,
        password: true,
        message: "Đăng nhập thất bại, vui lòng kiểm tra lại!",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgLogo})` }}>
      <Helmet>
        <title>Đăng nhập</title>
      </Helmet>
      {isLoading && (
        <div className="absolute flex justify-center items-center w-full h-screen z-10 bg-opacity-100">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-6xl text-blue-500 animate-spin"
          />
        </div>
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl text-center text-[#1E4B7F] font-bold mb-4">JDK Store</h1>
        
        {error.message && (
          <div className="h-8 text-center items-center justify-center flex my-2 text-red-600">
            {error.message}
          </div>
        )}

        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full px-3 py-2 border focus:outline-none rounded-lg ${error.username ? "border-red-500" : "border-gray-700"}`}
            />
            {error.username && <p className="text-red-500 text-[12px] mt-1">Tài khoản không chính xác.</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border focus:outline-none rounded-lg ${error.password ? "border-red-500" : "border-gray-700"}`}
            />
            {error.password && <p className="text-red-500 text-[12px] mt-1">Mật khẩu không đúng.</p>}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-gray-700">Duy trì đăng nhập</label>
            </div>
            <a href="#" className="text-blue-500 hover:underline">Quên mật khẩu?</a>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleLogin('/')}
              disabled={isLoading}
              className="cursor-pointer flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 hover:scale-[1.02] hover:shadow-md
                        outline-none ring-indigo-500/70 ring-offset-2 focus-visible:ring-2 active:scale-[0.98] transition disabled:opacity-70"
            >
             <i className="fas fa-home mr-2"></i> Quản lý
            </button>
            <button
              type="button"
              onClick={() => handleLogin('/ban-hang')}
              disabled={isLoading}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 hover:scale-[1.02] hover:shadow-md
                        outline-none ring-indigo-500/70 ring-offset-2 focus-visible:ring-2 active:scale-[0.98] transition disabled:opacity-70"
            >
              <i className="fas fa-shopping-cart mr-2"></i> Bán hàng
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default Login;
