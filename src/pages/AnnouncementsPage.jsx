import { useEffect, useState } from "react";
import {
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  TextArea,
  TextInput,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  createAnnouncement,
  formatDate,
  logUserActivity,
  subscribeAnnouncements,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ title: "", message: "" });

  useEffect(() => {
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeAnnouncements((items) => {
      clearSafety();
      setAnnouncements(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.message) return;
    setSaving(true);
    setMessage("");
    try {
      await createAnnouncement({
        title: form.title,
        message: form.message,
        createdById: user.uid,
        createdByName: user.name,
      });
      await logUserActivity({
        userId: user.uid,
        userName: user.name,
        userRole: "admin",
        action: "announcement_created",
        details: form.title,
      });
      setForm({ title: "", message: "" });
      setMessage("Announcement published.");
    } catch (error) {
      setMessage(error.message || "Unable to publish announcement.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading announcements..." />;

  return (
    <PageShell
      title="Announcements"
      subtitle={
        isAdmin
          ? "Publish updates, event notices, and campus communication for all students."
          : "Stay updated with the latest campus news and announcements."
      }
    >
      {isAdmin ? (
        <Card className="space-y-4">
          <TextInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
          />
          <TextArea
            label="Message"
            value={form.message}
            onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))}
          />
          <div className="flex items-center gap-4">
            <PrimaryButton type="button" onClick={handleCreate} disabled={saving}>
              {saving ? "Publishing..." : "Publish Announcement"}
            </PrimaryButton>
            {message ? <p className="text-sm text-tm-muted">{message}</p> : null}
          </div>
        </Card>
      ) : null}

      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description={
            isAdmin
              ? "Publish your first announcement to notify students in realtime."
              : "Campus announcements will appear here when admins publish them."
          }
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <h2 className="text-xl font-semibold text-tm-dark">{announcement.title}</h2>
              <p className="mt-3 text-sm leading-6 text-tm-muted">{announcement.message}</p>
              <p className="mt-4 text-xs text-tm-muted">
                Published {formatDate(announcement.createdAt, { includeTime: true })}
                {announcement.createdByName ? ` · ${announcement.createdByName}` : ""}
              </p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
