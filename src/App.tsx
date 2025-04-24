import { useLocation, useNavigate } from 'react-router-dom';
import Router from "./router/router";
import NavigationSale from './components/NavigationSale';
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) 
      navigate('/login');
  },[]);

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