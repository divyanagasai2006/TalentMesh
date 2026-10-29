import { useEffect, useState } from "react";
import {
  Card,
  PageShell,
  PrimaryButton,
  TextArea,
  TextInput,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  logUserActivity,
  subscribeSkills,
  updateCurrentUserProfile,
} from "../services/platformService";

const listToText = (list) => (Array.isArray(list) ? list.join(", ") : "");
const textToList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    education: "",
    skills: "",
    interests: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      headline: user.headline || "",
      bio: user.bio || "",
      education: user.education || "",
      skills: listToText(user.skills),
      interests: listToText(user.interests),
    });
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeSkills(setCatalogSkills);
    return () => unsubscribe?.();
  }, []);

  const handleChange = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const addSkillFromCatalog = (skillName) => {
    const current = textToList(form.skills);
    if (current.includes(skillName)) return;
    handleChange("skills", [...current, skillName].join(", "));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setMessage("");
    const updates = {
      name: form.name,
      headline: form.headline,
      bio: form.bio,
      education: form.education,
      skills: textToList(form.skills),
      interests: textToList(form.interests),
    };

    try {
      await updateCurrentUserProfile(user.uid, updates);
      updateUserProfile(updates);
      await logUserActivity({
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        action: "profile_updated",
        details: "Profile information updated",
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Profile"
      subtitle="Build your professional TalentMesh presence with a strong profile and skills showcase."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <Card className="space-y-4">
          <TextInput
            label="Full name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextInput
            label="Headline"
            value={form.headline}
            onChange={(e) => handleChange("headline", e.target.value)}
            placeholder="e.g. CSE Student | Frontend Developer | Hackathon Enthusiast"
          />
          <TextArea
            label="Bio / Resume summary"
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell students and admins about your goals, strengths, and experience."
          />
          <TextInput
            label="Education"
            value={form.education}
            onChange={(e) => handleChange("education", e.target.value)}
            placeholder="e.g. B.Tech CSE, 2027"
          />
          <TextInput
            label="Skills"
            value={form.skills}
            onChange={(e) => handleChange("skills", e.target.value)}
            placeholder="Comma-separated skills"
          />
          {catalogSkills.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-tm-dark">
                Add from platform catalog
              </p>
              <div className="flex flex-wrap gap-2">
                {catalogSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addSkillFromCatalog(skill.name)}
                    className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/15 hover:shadow-tm-glow"
                  >
                    + {skill.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <TextInput
            label="Interests"
            value={form.interests}
            onChange={(e) => handleChange("interests", e.target.value)}
            placeholder="Comma-separated interests"
          />
          <div className="flex items-center gap-4">
            <PrimaryButton type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </PrimaryButton>
            {message ? (
              <p className="text-sm text-tm-muted">{message}</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-tm-dark">Profile showcase</h2>
          <dl className="mt-4 space-y-4 text-sm text-tm-muted">
            <div>
              <dt className="font-medium text-tm-muted">Email</dt>
              <dd className="mt-1 text-tm-dark">{user?.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-tm-muted">Role</dt>
              <dd className="mt-1 capitalize text-tm-dark">{user?.role}</dd>
            </div>
            <div>
              <dt className="font-medium text-tm-muted">Headline</dt>
              <dd className="mt-1 text-tm-dark">
                {form.headline || "Add a headline to stand out."}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-tm-muted">Skills</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {textToList(form.skills).length > 0 ? (
                  textToList(form.skills).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-tm-dark">No skills added yet.</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-tm-muted">Interests</dt>
              <dd className="mt-1 text-tm-dark">
                {textToList(form.interests).join(", ") ||
                  "No interests added yet."}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </PageShell>
  );
}
