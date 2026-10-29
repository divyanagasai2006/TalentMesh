import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  SectionTitle,
} from "../components/ui";
import { formatDate, subscribeUserActivity } from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

const actionLabels = {
  skill_created: "Skill Created",
  skill_deleted: "Skill Deleted",
  resource_created: "Resource Published",
  resource_deleted: "Resource Deleted",
  announcement_created: "Announcement Published",
  project_created: "Project Created",
  project_updated: "Project Updated",
  project_deleted: "Project Deleted",
  platform_seeded: "Platform Seeded",
  login: "Login",
  profile_updated: "Profile Updated",
};

export default function UserActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeUserActivity((items) => {
      clearSafety();
      setActivities(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, []);

  if (loading) return <LoadingState label="Loading activity..." />;

  return (
    <PageShell
      title="User Activity"
      subtitle="Monitor platform activity and user actions in realtime."
    >
      <Card>
        <SectionTitle meta={<Activity size={18} className="text-primary" />}>
          Recent Activity
        </SectionTitle>
        <p className="mt-2 text-sm text-tm-muted">
          Showing the latest {activities.length} platform events.
        </p>
      </Card>

      {activities.length === 0 ? (
        <EmptyState
          title="No activity recorded yet"
          description="User actions like skill management and content publishing will appear here."
        />
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-tm-dark">{activity.userName}</span>
                  <Badge tone={activity.userRole === "admin" ? "purple" : "cyan"}>
                    {activity.userRole}
                  </Badge>
                  <Badge tone="blue">
                    {actionLabels[activity.action] || activity.action}
                  </Badge>
                </div>
                {activity.details ? (
                  <p className="mt-2 text-sm text-tm-muted">{activity.details}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-xs text-tm-muted">
                {formatDate(activity.createdAt, { includeTime: true })}
              </p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
