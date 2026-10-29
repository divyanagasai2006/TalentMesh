import { useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  FolderKanban,
  Network,
  Users,
} from "lucide-react";
import {
  Card,
  LoadingState,
  PageShell,
  SectionTitle,
  StatCard,
} from "../components/ui";
import { getPlatformAnalytics } from "../services/platformService";

function BarRow({ label, value, max }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-tm-dark">{label}</span>
        <span className="text-tm-muted">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPlatformAnalytics()
      .then((data) => {
        if (mounted) setAnalytics(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading analytics..." />;

  const statusEntries = Object.entries(analytics?.applicationsByStatus || {});
  const typeEntries = Object.entries(analytics?.opportunitiesByType || {});
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxType = Math.max(...typeEntries.map(([, v]) => v), 1);

  return (
    <PageShell
      title="Platform Analytics"
      subtitle="Real-time insights into student engagement, opportunities, and platform growth."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={analytics?.totalStudents || 0} icon={Users} />
        <StatCard
          label="Opportunities"
          value={analytics?.totalOpportunities || 0}
          icon={Briefcase}
        />
        <StatCard
          label="Connections"
          value={analytics?.totalConnections || 0}
          icon={Network}
        />
        <StatCard
          label="Active Projects"
          value={analytics?.totalProjects || 0}
          icon={FolderKanban}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle meta={<BarChart3 size={18} className="text-primary" />}>
            Applications by Status
          </SectionTitle>
          <div className="mt-6 space-y-4">
            {statusEntries.length === 0 ? (
              <p className="text-sm text-tm-muted">No application data yet.</p>
            ) : (
              statusEntries.map(([label, value]) => (
                <BarRow key={label} label={label} value={value} max={maxStatus} />
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle meta={<BarChart3 size={18} className="text-primary" />}>
            Opportunities by Type
          </SectionTitle>
          <div className="mt-6 space-y-4">
            {typeEntries.length === 0 ? (
              <p className="text-sm text-tm-muted">No opportunity data yet.</p>
            ) : (
              typeEntries.map(([label, value]) => (
                <BarRow key={label} label={label} value={value} max={maxType} />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle>Platform Summary</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Applications", analytics?.totalApplications],
            ["Announcements", analytics?.totalAnnouncements],
            ["Learning Resources", analytics?.totalResources],
            ["Skills in Catalog", analytics?.totalSkills],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-primary/15 bg-white/50 p-4 text-center"
            >
              <p className="text-sm text-tm-muted">{label}</p>
              <p className="mt-1 text-2xl font-bold tm-stat-value">{value || 0}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
