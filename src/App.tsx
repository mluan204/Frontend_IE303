import { useLocation } from 'react-router-dom';
import Router from "./router/router";
import Navigation from "./components/navigation";
import NavigationSale from './components/NavigationSale';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <NavigationSale />}
      <Router />
    </>
  );
}

export default App;