import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // import đúng path
import { changePass } from "../service/mainApi";
import { useNavigate } from "react-router-dom";

const ChangePassword = ({ onClose }: { onClose: () => void }) => {
  const { username } = useAuth(); 
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      setMessage("Không thể xác định người dùng.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    try {
      const data = await changePass(username, oldPassword, newPassword);

      if (data.status === 100) {
        setSuccess(true);
        setMessage("Cập nhật mật khẩu thành công!");
        setTimeout(() => {
          onClose();          // đóng modal (nếu vẫn muốn)
          navigate("/login"); // chuyển về trang login
        }, 800);
      } else {
        setMessage(data.message || "Đã có lỗi xảy ra");
      }
    } catch (error) {
      setMessage("Lỗi kết nối đến máy chủ");
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-1/2 z-10">
        <h2 className="text-xl font-bold mb-4">Thay đổi mật khẩu</h2>
        {message && (
          <p className={`mb-2 ${success ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu cũ</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded-lg"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
