import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageShell,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  formatDate,
  subscribeChats,
  subscribeConnections,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function ChartList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const clearSafety = withLoadingSafety(setLoading);
    const unsubConnections = subscribeConnections(user.uid, setConnections);
    const unsubChats = subscribeChats(user.uid, (items) => {
      clearSafety();
      setChats(
        items.sort(
          (a, b) =>
            (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0),
        ),
      );
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubConnections?.();
      unsubChats?.();
    };
  }, [user?.uid]);

  const connectedIds = useMemo(
    () =>
      new Set(
        connections
          .flatMap((connection) => connection.participants || [])
          .filter((id) => id !== user.uid),
      ),
    [connections, user.uid],
  );

  if (loading) return <LoadingState label="Loading messages..." />;

  return (
    <PageShell
      title="Messages"
      subtitle="Realtime chat is available only for accepted connections."
    >
      {chats.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Once you and another student accept a connection request, your chat inbox will appear here."
        />
      ) : (
        <div className="space-y-4">
          {chats
            .filter((chat) =>
              (chat.participants || []).some(
                (participant) =>
                  participant !== user.uid && connectedIds.has(participant),
              ),
            )
            .map((chat) => {
              const otherId = (chat.participants || []).find(
                (participant) => participant !== user.uid,
              );
              const otherProfile = chat.participantProfiles?.[otherId];
              return (
                <Card
                  key={chat.id}
                  className="cursor-pointer transition hover:border-primary/40 hover:shadow-tm-glow"
                  onClick={() => navigate(`/${user.role}/messages/${chat.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-tm-dark">
                        {otherProfile?.name || "Conversation"}
                      </h2>
                      <p className="mt-2 text-sm text-tm-muted">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge tone="green">Connected</Badge>
                      <p className="mt-2 text-xs text-tm-muted">
                        {formatDate(chat.lastMessageAt, { includeTime: true })}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      )}
    </PageShell>
  );
}
