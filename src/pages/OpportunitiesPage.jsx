import { useEffect, useMemo, useState } from "react";
import { Badge, Card, EmptyState, LoadingState, PageShell, PrimaryButton, SecondaryButton, SelectInput, TextArea, TextInput } from "../components/ui";
import { useAuth } from "../context/authState";
import {
  applyToOpportunity,
  createOpportunity,
  formatDate,
  subscribeBookmarks,
  subscribeOpportunities,
  toggleBookmarkOpportunity,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

const opportunityTypes = ["internship", "job", "hackathon", "event", "project opportunity"];

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [opportunities, setOpportunities] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "internship",
    title: "",
    description: "",
    skillsRequired: "",
    deadline: "",
    location: "",
  });

  useEffect(() => {
    setLoading(true);
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeOpportunities(
      (items) => {
        clearSafety();
        setOpportunities(items);
        setLoading(false);
      },
      { type: filter },
    );
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, [filter]);

  useEffect(() => {
    if (!user?.uid || isAdmin) return undefined;
    const unsubscribe = subscribeBookmarks(user.uid, setBookmarks);
    return () => unsubscribe?.();
  }, [isAdmin, user?.uid]);

  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((bookmark) => bookmark.opportunityId)), [bookmarks]);

  const handleCreate = async () => {
    setSaving(true);
    setStatusMessage("");
    try {
      await createOpportunity({
        type: form.type,
        title: form.title,
        description: form.description,
        skillsRequired: form.skillsRequired.split(",").map((item) => item.trim()).filter(Boolean),
        deadline: form.deadline,
        location: form.location,
        postedDate: new Date().toISOString(),
      }, user);
      setForm({ type: "internship", title: "", description: "", skillsRequired: "", deadline: "", location: "" });
      setStatusMessage("Opportunity posted successfully.");
    } catch (error) {
      setStatusMessage(error.message || "Unable to create opportunity.");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (opportunity) => {
    try {
      await applyToOpportunity({ opportunity, student: user });
      setStatusMessage(`Applied to ${opportunity.title}.`);
    } catch (error) {
      setStatusMessage(error.message || "Unable to apply.");
    }
  };

  const handleBookmark = async (opportunity) => {
    try {
      const bookmarked = await toggleBookmarkOpportunity(opportunity.id, user.uid);
      setStatusMessage(bookmarked ? `Bookmarked ${opportunity.title}.` : `Removed bookmark for ${opportunity.title}.`);
    } catch (error) {
      setStatusMessage(error.message || "Unable to update bookmark.");
    }
  };

  if (loading) return <LoadingState label="Loading opportunities..." />;

  return (
    <PageShell title={isAdmin ? "Post Opportunities" : "Opportunities"} subtitle={isAdmin ? "Create internships, jobs, hackathons, events, and project opportunities for students." : "View, apply to, and bookmark opportunities posted by admins."}>
      {isAdmin ? (
        <Card className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput label="Type" value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}>
              {opportunityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </SelectInput>
            <TextInput label="Title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
            <TextInput label="Location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} />
            <TextInput label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm((current) => ({ ...current, deadline: e.target.value }))} />
          </div>
          <TextInput label="Skills Required" value={form.skillsRequired} onChange={(e) => setForm((current) => ({ ...current, skillsRequired: e.target.value }))} placeholder="Comma-separated skills" />
          <TextArea label="Description" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          <div className="flex items-center gap-4">
            <PrimaryButton type="button" onClick={handleCreate} disabled={saving}>{saving ? "Posting..." : "Post Opportunity"}</PrimaryButton>
            {statusMessage ? <p className="text-sm text-tm-muted">{statusMessage}</p> : null}
          </div>
        </Card>
      ) : (
        <Card>
          <SelectInput label="Filter opportunities" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            {opportunityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </SelectInput>
          {statusMessage ? <p className="mt-3 text-sm text-tm-muted">{statusMessage}</p> : null}
        </Card>
      )}

      {opportunities.length === 0 ? (
        <EmptyState title="No opportunities yet" description="Opportunities posted by admins will appear here automatically for students." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-tm-dark">{opportunity.title}</h2>
                  <p className="mt-1 text-sm text-tm-muted">{opportunity.location || "Remote / Hybrid"}</p>
                </div>
                <Badge tone="blue">{opportunity.type}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-tm-muted">{opportunity.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(opportunity.skillsRequired || []).map((skill) => <Badge key={skill}>{skill}</Badge>)}
              </div>
              <div className="mt-4 text-sm text-tm-muted">
                <p>Deadline: {opportunity.deadline || "Not specified"}</p>
                <p className="mt-1">Posted: {formatDate(opportunity.createdAt)}</p>
              </div>
              {!isAdmin ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  <PrimaryButton type="button" onClick={() => handleApply(opportunity)}>Apply</PrimaryButton>
                  <SecondaryButton type="button" onClick={() => handleBookmark(opportunity)}>
                    {bookmarkedIds.has(opportunity.id) ? "Bookmarked" : "Bookmark"}
                  </SecondaryButton>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
