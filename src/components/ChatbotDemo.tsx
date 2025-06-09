import React, { useState, useEffect } from "react";
import { chatbotAI } from "./GeminiService";
import { getAllProduct } from "../service/productApi";
import { getAllComboList } from "../service/comboApi";
import { fetchAllBill } from "../service/mainApi";
import { searchReceipts } from "../service/receiptApi";
import { getAllEmployees } from "../service/employeeApi";
import { getAllCustomer } from "../service/customerApi";

interface StoreData {
  products: any[];
  combos: any[];
  bills: any[];
  receipts: any[];
  employees: any[];
  customers: any[];
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}

const ChatbotDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setIsLoading(true);
      const [products, combos, bills, receipts, employees, customers] =
        await Promise.all([
          getAllProduct(),
          getAllComboList(),
          fetchAllBill(),
          searchReceipts({}),
          getAllEmployees(),
          getAllCustomer(),
        ]);

      setStoreData({
        products,
        combos,
        bills,
        receipts,
        employees,
        customers,
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching store data:", error);
      setError("Không thể tải dữ liệu cửa hàng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !storeData) return;

    const userMessage = input.trim();
    setInput("");

    // Thêm tin nhắn người dùng vào lịch sử
    const newUserMessage: Message = {
      text: userMessage,
      isUser: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);
    setError(null);

    try {
      // Tạo ngữ cảnh từ lịch sử chat gần đây (giới hạn 5 tin nhắn gần nhất)
      const recentMessages = messages.slice(-5);
      const conversationContext = recentMessages
        .map((msg) => `${msg.isUser ? "Người dùng" : "Chatbot"}: ${msg.text}`)
        .join("\n");

      const response = await chatbotAI(
        userMessage,
        storeData,
        conversationContext
      );
      console.log("storeData", storeData);
      console.log("conversationContext", conversationContext);
      console.log("userMessage", userMessage);
      console.log("response", response);

      // Thêm phản hồi của chatbot vào lịch sử
      const newBotMessage: Message = {
        text: response,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);
      setError("Đã có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
              Đang xử lý...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-800 rounded-lg p-3">
              {error}
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            disabled={isLoading || !storeData}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !storeData || !input.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDemo;
