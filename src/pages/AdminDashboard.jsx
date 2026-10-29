import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SectionTitle,
  StatCard,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  formatDate,
  getAdminDashboardStats,
  subscribeAnnouncements,
  subscribeNotifications,
  subscribeOpportunities,
} from "../services/platformService";
import { seedPlatformDataIfEmpty } from "../services/seedService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let mounted = true;
    const clearSafety = withLoadingSafety(setLoading);

    const loadStats = async () => {
      try {
        await seedPlatformDataIfEmpty(user);
        const data = await getAdminDashboardStats();
        if (mounted) setStats(data);
      } catch (error) {
        console.error("[TalentMesh] Admin dashboard stats error:", error);
        if (mounted) {
          setStats({
            totalStudents: 0,
            totalPosts: 0,
            applicationsReceived: 0,
            activeProjects: 0,
          });
        }
      } finally {
        if (mounted) {
          clearSafety();
          setLoading(false);
        }
      }
    };

    loadStats();
    const unsubAnnouncements = subscribeAnnouncements(setAnnouncements);
    const unsubOpportunities = subscribeOpportunities(setOpportunities);
    const unsubNotifications = subscribeNotifications(user.uid, setNotifications);

    return () => {
      mounted = false;
      clearSafety();
      unsubAnnouncements?.();
      unsubOpportunities?.();
      unsubNotifications?.();
    };
  }, [user]);

  if (loading && !stats) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  const adminStats = [
    ["Total Students", stats?.totalStudents || 0],
    ["Total Posts", stats?.totalPosts || 0],
    ["Applications Received", stats?.applicationsReceived || 0],
    ["Active Projects", stats?.activeProjects || 0],
  ];

  const unread = notifications.filter((item) => !item.read).length;

  return (
    <PageShell
      title="Admin Dashboard"
      subtitle="Manage recruitment, opportunities, announcements, and student activity from one place."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map(([label, value]) => (
          <StatCard key={label} label={label} value={value} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionTitle
            meta={
              <PrimaryButton type="button" onClick={() => navigate("/admin/opportunities")}>
                Manage
              </PrimaryButton>
            }
          >
            Recent opportunities
          </SectionTitle>
          <div className="mt-4 space-y-3">
            {opportunities.slice(0, 5).length === 0 ? (
              <EmptyState
                title="No opportunities yet"
                description="Post internships, jobs, and events for students from Opportunities."
              />
            ) : (
              opportunities.slice(0, 5).map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="rounded-2xl border border-primary/15 bg-white/50 p-4 transition hover:border-primary/30 hover:shadow-tm-glow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-tm-dark">{opportunity.title}</h3>
                      <p className="mt-1 text-sm text-tm-muted">
                        {opportunity.type} · {opportunity.location || "Remote / Hybrid"}
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
            <SectionTitle
              meta={
                <button
                  type="button"
                  className="text-sm font-semibold text-primary"
                  onClick={() => navigate("/admin/announcements")}
                >
                  Manage
                </button>
              }
            >
              Announcements
            </SectionTitle>
            <div className="mt-4 space-y-3">
              {announcements.slice(0, 3).length === 0 ? (
                <p className="text-sm text-tm-muted">No announcements yet.</p>
              ) : (
                announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-primary/15 bg-white/50 p-4"
                  >
                    <h3 className="font-semibold text-tm-dark">{announcement.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-tm-muted">
                      {announcement.message}
                    </p>
                    <p className="mt-2 text-xs text-tm-muted">
                      {announcement.published === false ? "Draft" : "Published"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle
              meta={
                <button
                  type="button"
                  className="text-sm font-semibold text-primary"
                  onClick={() => navigate("/admin/notifications")}
                >
                  {unread} unread
                </button>
              }
            >
              Latest notifications
            </SectionTitle>
            <div className="mt-4 space-y-3">
              {notifications.slice(0, 4).length === 0 ? (
                <p className="text-sm text-tm-muted">No notifications yet.</p>
              ) : (
                notifications.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-primary/15 bg-white/50 p-4"
                  >
                    <h3 className="font-semibold text-tm-dark">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-tm-muted">{item.message}</p>
                    <p className="mt-2 text-xs text-tm-muted">
                      {formatDate(item.createdAt, { includeTime: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
