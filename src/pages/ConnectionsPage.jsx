import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Card, EmptyState, LoadingState, PageShell, PrimaryButton, SecondaryButton } from "../components/ui";
import { useAuth } from "../context/authState";
import {
  createOrGetChat,
  formatDate,
  respondToConnectionRequest,
  subscribeConnections,
  subscribeIncomingConnectionRequests,
  subscribeOutgoingConnectionRequests,
} from "../services/platformService";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const safety = setTimeout(() => setLoading(false), 8000);
    const unsubConnections = subscribeConnections(user.uid, (items) => {
      clearTimeout(safety);
      setConnections(items);
      setLoading(false);
    });
    const unsubIncoming = subscribeIncomingConnectionRequests(user.uid, setIncomingRequests);
    const unsubOutgoing = subscribeOutgoingConnectionRequests(user.uid, setOutgoingRequests);
    return () => {
      clearTimeout(safety);
      unsubConnections?.();
      unsubIncoming?.();
      unsubOutgoing?.();
    };
  }, [user?.uid]);

  const acceptedConnections = useMemo(
    () =>
      connections.map((connection) => {
        const otherId = (connection.participants || []).find((participant) => participant !== user.uid);
        return connection.participantDetails?.[otherId];
      }).filter(Boolean),
    [connections, user.uid]
  );

  const handleRequestAction = async (requestId, action) => {
    setError("");
    setActionState((current) => ({ ...current, [requestId]: action }));
    try {
      await respondToConnectionRequest(requestId, action);
    } catch (err) {
      setError(err.message || "Unable to update connection request.");
    } finally {
      setActionState((current) => ({ ...current, [requestId]: "" }));
    }
  };

  const handleMessage = async (connectionProfile) => {
    setError("");
    try {
      const chatId = await createOrGetChat(user, connectionProfile);
      const base = user?.role === "admin" ? "/admin" : "/student";
      navigate(`${base}/messages/${chatId}`);
    } catch (err) {
      setError(err.message || "Unable to open chat.");
    }
  };

  if (loading) return <LoadingState label="Loading connections..." />;

  return (
    <PageShell title="Connections" subtitle="Manage your network, review requests, and message accepted connections.">
      {error ? <Card className="text-sm text-red-700">{error}</Card> : null}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-semibold text-tm-dark">Connection Requests</h2>
          <div className="mt-4 space-y-4">
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-tm-muted">No incoming requests.</p>
            ) : (
              incomingRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-primary/15 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-tm-dark">{request.fromUserName}</h3>
                      <p className="text-sm text-tm-muted">{request.fromUserEmail}</p>
                      <p className="mt-2 text-xs text-tm-muted">Received {formatDate(request.createdAt)}</p>
                    </div>
                    <Badge tone={request.status === "accepted" ? "green" : request.status === "rejected" ? "red" : "amber"}>
                      {request.status}
                    </Badge>
                  </div>
                  {request.status === "pending" ? (
                    <div className="mt-4 flex gap-3">
                      <PrimaryButton type="button" onClick={() => handleRequestAction(request.id, "accepted")} disabled={Boolean(actionState[request.id])}>
                        {actionState[request.id] === "accepted" ? "Accepting..." : "Accept"}
                      </PrimaryButton>
                      <SecondaryButton type="button" onClick={() => handleRequestAction(request.id, "rejected")} disabled={Boolean(actionState[request.id])}>
                        {actionState[request.id] === "rejected" ? "Rejecting..." : "Reject"}
                      </SecondaryButton>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-tm-dark">Your 1st Connections</h2>
            <div className="mt-4 space-y-4">
              {acceptedConnections.length === 0 ? (
                <EmptyState title="No connections yet" description="Accepted connections will appear here, and messaging will unlock automatically." />
              ) : (
                acceptedConnections.map((connectionProfile) => (
                  <div key={connectionProfile.uid} className="flex flex-col gap-4 rounded-2xl border border-primary/15 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-tm-dark">{connectionProfile.name}</h3>
                      <p className="text-sm text-tm-muted">{connectionProfile.email}</p>
                      <p className="mt-2 text-xs text-emerald-700">1st Connection</p>
                    </div>
                    <PrimaryButton type="button" onClick={() => handleMessage(connectionProfile)}>
                      Message
                    </PrimaryButton>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-tm-dark">Outgoing Requests</h2>
            <div className="mt-4 space-y-3">
              {outgoingRequests.length === 0 ? (
                <p className="text-sm text-tm-muted">No outgoing requests.</p>
              ) : (
                outgoingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-2xl border border-primary/15 p-4">
                    <div>
                      <h3 className="font-semibold text-tm-dark">{request.toUserName}</h3>
                      <p className="text-sm text-tm-muted">{request.toUserEmail}</p>
                    </div>
                    <Badge tone={request.status === "accepted" ? "green" : request.status === "rejected" ? "red" : "amber"}>{request.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
