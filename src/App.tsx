import { useLocation } from "react-router-dom";
import Router from "./router/router";
import Navigation from "./components/navigation";
import NavigationSale from "./components/NavigationSale";

export function App() {
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
