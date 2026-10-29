import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  formatDate,
  sendChatMessage,
  subscribeConnections,
  subscribeMessages,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function Chart() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [connections, setConnections] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user?.uid || !chatId) return;
    const clearSafety = withLoadingSafety(setLoading);
    const unsubConnections = subscribeConnections(user.uid, setConnections);
    const unsubMessages = subscribeMessages(chatId, (items) => {
      clearSafety();
      setMessages(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubConnections?.();
      unsubMessages?.();
    };
  }, [chatId, user?.uid]);

  const otherParticipantId = (chatId?.split("_") || []).find(
    (participant) => participant !== user?.uid,
  );
  const isConnected = connections.some(
    (connection) =>
      connection.participants?.includes(user.uid) &&
      connection.participants?.includes(otherParticipantId),
  );

  const handleSend = async () => {
    if (!text.trim() || !isConnected) return;
    setSending(true);
    try {
      await sendChatMessage({ chatId, sender: user, text });
      setText("");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState label="Loading chat..." />;
  if (!isConnected) {
    return (
      <PageShell
        title="Messages"
        subtitle="Messaging is available only between accepted student connections."
      >
        <EmptyState
          title="Messaging unavailable"
          description="This chat is hidden because the connection is not active or has not been accepted."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Messages"
      subtitle="Realtime Firebase chat between accepted connections only."
    >
      <Card className="flex min-h-[70vh] flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-primary/15 pb-4">
          <button
            type="button"
            onClick={() => navigate(`/${user.role}/messages`)}
            className="text-sm font-semibold text-tm-muted hover:text-primary"
          >
            ← Back to inbox
          </button>
          <p className="text-sm text-tm-muted">Connected conversation</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Start the conversation with your connection."
            />
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === user.uid;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-3xl px-4 py-3 ${isOwn ? "bg-gradient-to-r from-primary to-secondary text-white shadow-tm-glow" : "bg-white/80 text-tm-dark border border-primary/15"}`}
                  >
                    <p className="text-sm leading-6">{message.text}</p>
                    <p
                      className={`mt-2 text-xs ${isOwn ? "text-white/70" : "text-tm-muted"}`}
                    >
                      {formatDate(message.createdAt, { includeTime: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex gap-3 border-t border-primary/15 pt-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message"
            className="tm-input flex-1"
          />
          <PrimaryButton
            type="button"
            onClick={handleSend}
            disabled={sending || !text.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </PrimaryButton>
        </div>
      </Card>
    </PageShell>
  );
}
