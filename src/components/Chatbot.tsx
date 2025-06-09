import { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      isUser: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 3 * 24); // 24px is roughly one line height
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      text: inputMessage,
      isUser: true
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Auto scroll to bottom
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        text: "Cảm ơn bạn đã gửi tin nhắn. Tôi sẽ phản hồi sớm nhất có thể.",
        isUser: false
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;             /* Chrome, Safari and Opera */
          }
        `}
      </style>
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 ${
          isOpen ? 'rotate-360' : ''
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
                <p className="text-sm opacity-75">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
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
            className="h-96 overflow-y-auto p-4 space-y-4 messages-container"
            style={{ scrollBehavior: 'smooth' }}
            onLoad={(e) => {
              const element = e.currentTarget;
              element.scrollTop = element.scrollHeight;
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="py-2 px-4">
            <div className="flex space-x-2 items-end">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 bg-gray-100 rounded-2xl px-3 py-1 focus:outline-none resize-none min-h-[20px] max-h-[72px] overflow-y-auto hide-scrollbar"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className={`rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                  inputMessage.trim() 
                    ? 'text-blue-500 hover:text-blue-600' 
                    : 'text-gray-400 cursor-not-allowed'
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