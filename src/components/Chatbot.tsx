import { useState, useRef, useEffect } from "react";
import { chatbotAI } from "./GeminiService";
import { getAllProduct } from "../service/productApi";
import { getAllComboList } from "../service/comboApi";
import { fetchAllBill } from "../service/mainApi";
import { searchReceipts } from "../service/receiptApi";
import { getAllEmployees } from "../service/employeeApi";
import { getAllCustomer } from "../service/customerApi";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface StoreData {
  products: any[];
  combos: any[];
  bills: any[];
  receipts: any[];
  employees: any[];
  customers: any[];
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      isUser: false,
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStoreData();
  }, [isOpen]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  // Auto resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 3 * 24); // 24px is roughly one line height
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !storeData) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Thêm tin nhắn người dùng
    const newUserMessage: Message = {
      text: userMessage,
      isUser: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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

      // Thêm phản hồi của chatbot
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

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Hàm reset lại cuộc trò chuyện
  const resetChat = () => {
    setMessages([
      {
        text: "Xin chào! Tôi có thể giúp gì cho bạn?",
        isUser: false,
        timestamp: Date.now(),
      },
    ]);

    setInputMessage("");
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none; 
            scrollbar-width: none;     
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;        
          }
        `}
      </style>
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 ${
          isOpen ? "rotate-360" : ""
        }`}
      >
        <i className={`fas fa-comments text-xl`}></i>
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-500 text-white px-4 py-1">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">JDK Store Chat Support</h3>
                <p className="text-sm opacity-75">
                  Chúng tôi luôn sẵn sàng hỗ trợ bạn
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:text-gray-300 text-xl transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className="h-96 overflow-y-auto p-4 space-y-4 messages-container hide-scrollbar"
            style={{ scrollBehavior: "smooth" }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <p className="text-sm">Đang xử lý...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-800 rounded-lg p-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="py-2 px-4">
            <div className="flex space-x-2 items-end">
              <button
                onClick={() => resetChat()}
                className={`rounded-full cursor-pointer p-2 h-8 w-8 flex items-center justify-center flex-shrink-0 text-blue-500 hover:text-blue-600 transition-colors`}
              >
                <i className="fas fa-undo"></i>
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 bg-gray-100 rounded-2xl px-3 py-1 focus:outline-none resize-none min-h-[20px] max-h-[72px] overflow-y-auto hide-scrollbar"
                disabled={isLoading || !storeData}
              />
              <button
                type="submit"
                disabled={isLoading || !storeData || !inputMessage.trim()}
                className={`rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                  inputMessage.trim() && !isLoading && storeData
                    ? "text-blue-500 hover:text-blue-600"
                    : "text-gray-400 cursor-not-allowed"
                } transition-colors`}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
