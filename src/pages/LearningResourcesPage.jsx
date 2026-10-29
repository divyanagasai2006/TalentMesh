import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import {
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  createLearningResource,
  deleteLearningResource,
  formatDate,
  subscribeLearningResources,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

const resourceTypes = ["article", "video", "course", "tutorial", "documentation"];

export default function LearningResourcesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    type: "article",
    category: "General",
  });

  useEffect(() => {
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeLearningResources((items) => {
      clearSafety();
      setResources(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      await createLearningResource(form, user);
      setForm({ title: "", description: "", url: "", type: "article", category: "General" });
      setMessage("Resource published.");
    } catch (error) {
      setMessage(error.message || "Unable to publish resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await deleteLearningResource(resourceId, user);
    } catch (error) {
      setMessage(error.message || "Unable to delete resource.");
    }
  };

  if (loading) return <LoadingState label="Loading resources..." />;

  return (
    <PageShell
      title={isAdmin ? "Content Management" : "Learning Resources"}
      subtitle={
        isAdmin
          ? "Publish learning materials, tutorials, and resources for students."
          : "Explore curated learning materials to grow your skills and career."
      }
    >
      {isAdmin ? (
        <Card className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Title"
              value={form.title}
              onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
            />
            <TextInput
              label="URL"
              value={form.url}
              onChange={(e) => setForm((c) => ({ ...c, url: e.target.value }))}
              placeholder="https://..."
            />
            <SelectInput
              label="Type"
              value={form.type}
              onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))}
            >
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </SelectInput>
            <TextInput
              label="Category"
              value={form.category}
              onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
            />
          </div>
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
          />
          <div className="flex items-center gap-4">
            <PrimaryButton type="button" onClick={handleCreate} disabled={saving}>
              {saving ? "Publishing..." : "Publish Resource"}
            </PrimaryButton>
            {message ? <p className="text-sm text-tm-muted">{message}</p> : null}
          </div>
        </Card>
      ) : null}

      {resources.length === 0 ? (
        <EmptyState
          title="No resources yet"
          description={
            isAdmin
              ? "Publish your first learning resource for students."
              : "Learning resources will appear here when admins publish them."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                    {resource.type} · {resource.category}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-tm-dark">{resource.title}</h3>
                  {resource.description ? (
                    <p className="mt-2 text-sm text-tm-muted">{resource.description}</p>
                  ) : null}
                  <p className="mt-3 text-xs text-tm-muted">
                    Added {formatDate(resource.createdAt)}
                  </p>
                </div>
                {isAdmin ? (
                  <SecondaryButton
                    type="button"
                    className="shrink-0 text-red-600"
                    onClick={() => handleDelete(resource.id)}
                  >
                    <Trash2 size={14} />
                  </SecondaryButton>
                ) : null}
              </div>
              {resource.url ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
                >
                  Open resource
                  <ExternalLink size={14} />
                </a>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
