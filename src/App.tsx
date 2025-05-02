import { useLocation, useNavigate } from "react-router-dom";
import Router from "./router/router";
import NavigationSale from "./components/NavigationSale";
import Navigation from "./components/navigation";
import { useEffect } from "react";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSalesPage =
    location.pathname.startsWith("/ban-hang") ||
    location.pathname.startsWith("/lich-su-hoa-don") ||
    location.pathname.startsWith("/doanh-thu");

  return (
    <>
      {!isLoginPage && (isSalesPage ? <NavigationSale /> : <Navigation />)}
      <Router />
    </>
  );
}

export default App;
