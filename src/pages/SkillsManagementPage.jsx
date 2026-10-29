import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
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
import { createSkill, deleteSkill, subscribeSkills } from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function SkillsManagementPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", category: "General", description: "" });

  useEffect(() => {
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeSkills((items) => {
      clearSafety();
      setSkills(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      await createSkill(form, user);
      setForm({ name: "", category: "General", description: "" });
      setMessage("Skill added successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to add skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skillId) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await deleteSkill(skillId, user);
    } catch (error) {
      setMessage(error.message || "Unable to delete skill.");
    }
  };

  if (loading) return <LoadingState label="Loading skills..." />;

  return (
    <PageShell
      title="Skills Management"
      subtitle="Manage the platform skills catalog that students can add to their profiles."
    >
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Skill name"
            value={form.name}
            onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
            placeholder="e.g. React, Python, UI Design"
          />
          <TextInput
            label="Category"
            value={form.category}
            onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
            placeholder="e.g. Programming, Design"
          />
        </div>
        <TextArea
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
        />
        <div className="flex items-center gap-4">
          <PrimaryButton type="button" onClick={handleCreate} disabled={saving}>
            {saving ? "Adding..." : "Add Skill"}
          </PrimaryButton>
          {message ? <p className="text-sm text-tm-muted">{message}</p> : null}
        </div>
      </Card>

      {skills.length === 0 ? (
        <EmptyState
          title="No skills in catalog"
          description="Add skills to help students build consistent profiles across the platform."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-tm-dark">{skill.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {skill.category}
                  </span>
                </div>
                {skill.description ? (
                  <p className="mt-2 text-sm text-tm-muted">{skill.description}</p>
                ) : null}
              </div>
              <SecondaryButton
                type="button"
                className="mt-4 flex items-center gap-2 text-red-600 hover:border-red-200 hover:bg-red-50"
                onClick={() => handleDelete(skill.id)}
              >
                <Trash2 size={14} />
                Remove
              </SecondaryButton>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
