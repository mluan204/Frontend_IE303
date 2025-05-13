import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from "react-router-dom";


// Kiểu dữ liệu cho context
interface AuthContextType {
  handleLogin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Tạo context mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState<boolean> (false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setAuthenticated(true);
    navigate("/"); 
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setAuthenticated(false);
    navigate("/login"); 
  };

  return (
    <AuthContext.Provider value={{ handleLogin, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
