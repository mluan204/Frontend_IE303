import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from "react-router-dom";


// Kiểu dữ liệu cho context
interface AuthContextType {
  handleLogin: (username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  username: string | null;
}

// Tạo context mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setAuthenticated(true);
    setUsername(username);
    navigate("/"); 
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setAuthenticated(false);
    setUsername("");
    navigate("/login"); 
  };

  return (
    <AuthContext.Provider value={{ handleLogin, logout, isAuthenticated, username }}>
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