import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  createConnectionRequest,
  createOrGetChat,
  getMutualConnectionCount,
  subscribeConnections,
  subscribeOutgoingConnectionRequests,
  subscribeStudents,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submittingId, setSubmittingId] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    const clearSafety = withLoadingSafety(setLoading);
    const unsubStudents = subscribeStudents((items) => {
      clearSafety();
      setStudents(items.filter((student) => student.uid !== user.uid));
      setLoading(false);
    });
    const unsubConnections = subscribeConnections(user.uid, setConnections);
    const unsubOutgoing = subscribeOutgoingConnectionRequests(
      user.uid,
      setOutgoingRequests,
    );
    return () => {
      clearSafety();
      unsubStudents?.();
      unsubConnections?.();
      unsubOutgoing?.();
    };
  }, [user?.uid]);

  const connectedIds = useMemo(
    () =>
      new Set(
        connections
          .flatMap((connection) => connection.participants || [])
          .filter((id) => id !== user?.uid),
      ),
    [connections, user?.uid],
  );

  const pendingOutgoingIds = useMemo(
    () =>
      new Set(
        outgoingRequests
          .filter((request) => request.status === "pending")
          .map((request) => request.toUserId),
      ),
    [outgoingRequests],
  );

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      if (!term) return true;
      return [
        student.name,
        student.email,
        student.bio,
        ...(student.skills || []),
        ...(student.interests || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [search, students]);

  const startMessage = async (student) => {
    const chatId = await createOrGetChat(user, student);
    navigate(`/student/messages/${chatId}`);
  };

  const handleConnect = async (student) => {
    setMessage("");
    setSubmittingId(student.uid);
    try {
      await createConnectionRequest(user, student);
      setMessage(`Connection request sent to ${student.name}.`);
    } catch (error) {
      setMessage(error.message || "Unable to send request.");
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) return <LoadingState label="Loading students..." />;

  return (
    <PageShell
      title="Explore"
      subtitle="Discover students, send connection requests, and grow your campus network."
    >
      <Card>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, skill, interest, education, or bio"
          className="tm-input"
        />
      </Card>

      {message ? (
        <Card className="text-sm text-tm-dark">{message}</Card>
      ) : null}

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try a different search term or come back when more students join TalentMesh."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => {
            const isConnected = connectedIds.has(student.uid);
            const isPending = pendingOutgoingIds.has(student.uid);
            const mutual = getMutualConnectionCount(
              connections,
              user.uid,
              student.uid,
            );

            return (
              <Card
                key={student.uid}
                className="flex h-full flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-tm-dark">
                        {student.name}
                      </h2>
                      <p className="mt-1 text-sm text-tm-muted">
                        {student.headline || student.education || student.email}
                      </p>
                    </div>
                    <Badge tone="blue">Student</Badge>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-tm-muted">
                    {student.bio || "This student has not added a bio yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(student.skills || []).slice(0, 6).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 text-sm text-tm-muted">
                    <p>{mutual} Mutual Connections</p>
                    <p className="mt-1">
                      {isConnected ? "1st Connection" : "Not connected yet"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {isConnected ? (
                    <>
                      <SecondaryButton type="button" disabled>
                        Connected
                      </SecondaryButton>
                      <PrimaryButton
                        type="button"
                        onClick={() => startMessage(student)}
                      >
                        Message
                      </PrimaryButton>
                    </>
                  ) : isPending ? (
                    <SecondaryButton type="button" disabled>
                      Request Sent
                    </SecondaryButton>
                  ) : (
                    <PrimaryButton
                      type="button"
                      onClick={() => handleConnect(student)}
                      disabled={submittingId === student.uid}
                    >
                      {submittingId === student.uid ? "Sending..." : "Connect"}
                    </PrimaryButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
