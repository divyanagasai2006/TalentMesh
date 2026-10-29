import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  createProject,
  deleteProject,
  formatDate,
  joinProject,
  subscribeProjects,
  updateProject,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Open",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeProjects((items) => {
      clearSafety();
      setProjects(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, []);

  const visibleProjects = useMemo(() => projects, [projects]);

  const resetForm = () => {
    setForm({ title: "", description: "", status: "Open" });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title?.trim() || !form.description?.trim()) {
      setMessage("Title and description are required.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      if (editingId) {
        await updateProject(
          editingId,
          {
            title: form.title.trim(),
            description: form.description.trim(),
            status: form.status,
          },
          isAdmin ? user : null,
        );
        setMessage("Project updated successfully.");
      } else {
        await createProject(
          {
            title: form.title.trim(),
            description: form.description.trim(),
            status: form.status,
            members: isAdmin
              ? []
              : [{ uid: user.uid, name: user.name, email: user.email }],
          },
          user,
        );
        setMessage("Project created successfully.");
      }
      resetForm();
    } catch (error) {
      setMessage(error.message || "Unable to save project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "Open",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project permanently?")) return;
    try {
      await deleteProject(projectId, user);
      setMessage("Project deleted.");
      if (editingId === projectId) resetForm();
    } catch (error) {
      setMessage(error.message || "Unable to delete project.");
    }
  };

  const handleJoin = async (projectId) => {
    try {
      await joinProject(projectId, user);
      setMessage("You joined the project successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to join project.");
    }
  };

  if (loading) return <LoadingState label="Loading projects..." />;

  return (
    <PageShell
      title="Projects"
      subtitle={
        isAdmin
          ? "Create and manage project opportunities students can join."
          : "Find collaborative projects and join active teams."
      }
    >
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-tm-dark">
          {editingId
            ? "Edit project"
            : isAdmin
              ? "Create project opportunity"
              : "Start a student project"}
        </h2>
        <TextInput
          label="Title"
          value={form.title}
          onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
        />
        <TextArea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
        />
        <TextInput
          label="Status"
          value={form.status}
          onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}
          placeholder="Open / In Progress / Completed"
        />
        <div className="flex flex-wrap items-center gap-4">
          <PrimaryButton type="button" onClick={handleSave} disabled={submitting}>
            {submitting ? "Saving..." : editingId ? "Update Project" : "Save Project"}
          </PrimaryButton>
          {editingId ? (
            <SecondaryButton type="button" onClick={resetForm}>
              Cancel Edit
            </SecondaryButton>
          ) : null}
          {message ? <p className="text-sm text-tm-muted">{message}</p> : null}
        </div>
      </Card>

      {visibleProjects.length === 0 ? (
        <EmptyState
          title="No projects available"
          description="Create a project opportunity to start collaboration on TalentMesh."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {visibleProjects.map((project) => {
            const isMember = (project.members || []).some(
              (member) => member.uid === user.uid,
            );
            return (
              <Card key={project.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-tm-dark">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-tm-muted">
                      {project.description}
                    </p>
                  </div>
                  <Badge tone="purple">{project.status || "Open"}</Badge>
                </div>
                <div className="mt-4 text-sm text-tm-muted">
                  <p>Members: {(project.members || []).length}</p>
                  <p className="mt-1">Created {formatDate(project.createdAt)}</p>
                  {project.createdByName ? (
                    <p className="mt-1">By {project.createdByName}</p>
                  ) : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {!isAdmin ? (
                    <PrimaryButton
                      type="button"
                      onClick={() => handleJoin(project.id)}
                      disabled={isMember}
                    >
                      {isMember ? "Joined" : "Join Project"}
                    </PrimaryButton>
                  ) : (
                    <>
                      <SecondaryButton
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil size={14} />
                        Edit
                      </SecondaryButton>
                      <SecondaryButton
                        type="button"
                        className="inline-flex items-center gap-2 text-red-600"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </SecondaryButton>
                    </>
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
