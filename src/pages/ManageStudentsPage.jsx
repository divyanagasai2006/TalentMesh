import { useEffect, useMemo, useState } from "react";
import { Badge, Card, EmptyState, LoadingState, PageShell } from "../components/ui";
import { subscribeStudents } from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeStudents((items) => {
      clearSafety();
      setStudents(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((student) => {
      if (!term) return true;
      return [student.name, student.email, student.education, student.bio, ...(student.skills || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [search, students]);

  if (loading) return <LoadingState label="Loading students..." />;

  return (
    <PageShell title="Manage Students" subtitle="Review student profiles, skills, education, and campus network participation.">
      <Card>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students by name, email, education, or skill"
          className="tm-input"
        />
      </Card>

      {filteredStudents.length === 0 ? (
        <EmptyState title="No students found" description="Students will appear here once they register on TalentMesh." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.uid}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-tm-dark">{student.name}</h2>
                  <p className="mt-1 text-sm text-tm-muted">{student.email}</p>
                </div>
                <Badge tone="blue">Student</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-tm-muted">{student.bio || "No bio added yet."}</p>
              <div className="mt-4 text-sm text-tm-muted">
                <p><span className="font-medium text-tm-dark">Education:</span> {student.education || "Not provided"}</p>
                <p className="mt-2"><span className="font-medium text-tm-dark">Skills:</span> {(student.skills || []).join(", ") || "Not provided"}</p>
                <p className="mt-2"><span className="font-medium text-tm-dark">Interests:</span> {(student.interests || []).join(", ") || "Not provided"}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
