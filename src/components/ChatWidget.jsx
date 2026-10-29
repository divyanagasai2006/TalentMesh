import { useEffect, useState } from "react";
import {
  getChatId,
  sendMessage,
  subscribeMessages,
  createChatIfNotExists,
} from "../services/chatService";
import { useAuth } from "../context/authState";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();

  const currentUser = user?.email?.split("@")[0] || "user";
  const otherUser = "Ravi";

  const chatId = getChatId(currentUser, otherUser);

  useEffect(() => {
    if (!user?.email) return;

    createChatIfNotExists(currentUser, otherUser);

    const unsub = subscribeMessages(chatId, setMessages);
    return () => unsub?.();
  }, [chatId, user?.email, currentUser, otherUser]);

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(chatId, currentUser, text);
    setText("");
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-[#0F252C] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-80 h-[500px] bg-white shadow-2xl border border-gray-200 rounded-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0F252C] text-white p-4 flex justify-between items-center">
            <span className="font-semibold">Chat with {otherUser}</span>
            <button
              onClick={() => setOpen(false)}
              className="hover:opacity-80 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.from === currentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                      m.from === currentUser
                        ? "bg-[#0F252C] text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex p-3 border-t border-gray-200 gap-2 bg-gray-50">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border border-gray-300 p-2 rounded-lg outline-none focus:border-[#0F252C] text-sm"
              placeholder="Message..."
            />

            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="bg-[#0F252C] text-white p-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
