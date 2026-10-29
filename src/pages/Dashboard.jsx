import { useEffect, useState } from "react";
import {
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  SectionTitle,
  StatCard,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  formatDate,
  getAdminDashboardStats,
  getStudentDashboardStats,
  subscribeAnnouncements,
  subscribeIncomingConnectionRequests,
  subscribeOpportunities,
  subscribeStudentApplications,
} from "../services/platformService";
import { seedPlatformDataIfEmpty } from "../services/seedService";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let mounted = true;

    const loadStats = async () => {
      try {
        if (isAdmin) {
          await seedPlatformDataIfEmpty(user);
        }
        const data = isAdmin
          ? await getAdminDashboardStats()
          : await getStudentDashboardStats(user.uid);
        if (mounted) setStats(data);
      } catch (error) {
        console.error("[TalentMesh] Dashboard stats error:", error);
        if (mounted) {
          setStats(
            isAdmin
              ? { totalStudents: 0, totalPosts: 0, applicationsReceived: 0, activeProjects: 0 }
              : { connections: 0, applications: 0, projects: 0, notifications: 0 },
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();

    const unsubAnnouncements = subscribeAnnouncements(setAnnouncements);
    const unsubOpportunities = subscribeOpportunities(setOpportunities);
    const unsubRequests = !isAdmin
      ? subscribeIncomingConnectionRequests(user.uid, setRequests)
      : () => {};
    const unsubApplications = !isAdmin
      ? subscribeStudentApplications(user.uid, setApplications)
      : () => {};

    return () => {
      mounted = false;
      unsubAnnouncements?.();
      unsubOpportunities?.();
      unsubRequests?.();
      unsubApplications?.();
    };
  }, [isAdmin, user?.uid]);

  if (loading && !stats) {
    return <LoadingState label="Loading dashboard..." />;
  }

  const studentStats = [
    ["Connections", stats?.connections || 0],
    ["Applications", stats?.applications || 0],
    ["Projects", stats?.projects || 0],
    ["Notifications", stats?.notifications || 0],
  ];

  const adminStats = [
    ["Total Students", stats?.totalStudents || 0],
    ["Total Posts", stats?.totalPosts || 0],
    ["Applications Received", stats?.applicationsReceived || 0],
    ["Active Projects", stats?.activeProjects || 0],
  ];

  return (
    <PageShell
      title={isAdmin ? "Admin Dashboard" : "Student Dashboard"}
      subtitle={
        isAdmin
          ? "Manage recruitment, opportunities, announcements, and student activity from one place."
          : "Track your network, applications, projects, and campus opportunities in realtime."
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(isAdmin ? adminStats : studentStats).map(([label, value]) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionTitle>
            {isAdmin ? "Recent opportunities" : "Latest opportunities"}
          </SectionTitle>
          <div className="mt-4 space-y-3">
            {opportunities.slice(0, 5).length === 0 ? (
              <EmptyState
                title="No opportunities yet"
                description="New opportunities posted by admins will appear here automatically."
              />
            ) : (
              opportunities.slice(0, 5).map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="rounded-2xl border border-primary/15 bg-white/50 p-4 transition hover:border-primary/30 hover:shadow-tm-glow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-tm-dark">
                        {opportunity.title}
                      </h3>
                      <p className="mt-1 text-sm text-tm-muted">
                        {opportunity.type} ·{" "}
                        {opportunity.location || "Remote / Hybrid"}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-tm-muted">
                      {formatDate(opportunity.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Announcements</SectionTitle>
            <div className="mt-4 space-y-3">
              {announcements.slice(0, 3).length === 0 ? (
                <p className="text-sm text-tm-muted">No announcements yet.</p>
              ) : (
                announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-primary/15 bg-white/50 p-4"
                  >
                    <h3 className="font-semibold text-tm-dark">
                      {announcement.title}
                    </h3>
                    <p className="mt-2 text-sm text-tm-muted">
                      {announcement.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {!isAdmin ? (
            <Card>
              <SectionTitle>Activity</SectionTitle>
              <div className="mt-4 space-y-3 text-sm text-tm-muted">
                <div className="rounded-2xl border border-primary/15 bg-white/50 p-4">
                  Pending connection requests:{" "}
                  <span className="font-semibold text-tm-dark">
                    {
                      requests.filter((request) => request.status === "pending")
                        .length
                    }
                  </span>
                </div>
                <div className="rounded-2xl border border-primary/15 bg-white/50 p-4">
                  Submitted applications:{" "}
                  <span className="font-semibold text-tm-dark">
                    {applications.length}
                  </span>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
