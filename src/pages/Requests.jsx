import { useEffect, useState } from "react";
import { useAuth } from "../context/authState";
import {
  getRequests,
  updateRequestStatus,
} from "../services/requestService";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      if (!user?.email) {
        if (!cancelled) {
          setRequests([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getRequests(user.email);
        if (!cancelled) setRequests(data || []);
      } catch (error) {
        console.error("Error loading requests:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const handleAction = async (req, status) => {
    try {
      await updateRequestStatus(req.id, status);
      setRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === req.id
            ? { ...currentRequest, status }
            : currentRequest
        )
      );
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-[#0F252C]">Requests</h1>
        <p className="text-[#405D66]">Manage your collaboration requests</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition border-l-4 border-[#0F252C]"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="font-bold text-[#0F252C] text-lg">
                    Request from {req.from || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Skill: {req.skill || "Not specified"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {req.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                    {req.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} /> Accepted
                      </span>
                    )}
                    {req.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        <XCircle size={14} /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req, "accepted")}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      <CheckCircle size={18} />
                      Accept
                    </button>

                    <button
                      onClick={() => handleAction(req, "rejected")}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
