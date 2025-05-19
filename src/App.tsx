import { useLocation, useNavigate } from "react-router-dom";
import Router from "./router/router";
import NavigationSale from "./components/NavigationSale";
import Navigation from "./components/navigation";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/login");
  }, []);

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSalesPage =
    location.pathname.startsWith("/ban-hang") ||
    location.pathname.startsWith("/lich-su-hoa-don") ||
    location.pathname.startsWith("/doanh-thu");

  return (
    <>
      <ToastContainer />
      {!isLoginPage && (isSalesPage ? <NavigationSale /> : <Navigation />)}
      <Router />
    </>
  );
}

export default App;
