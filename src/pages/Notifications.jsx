import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
} from "../components/ui";
import { useAuth } from "../context/authState";
import {
  formatDate,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from "../services/platformService";
import { withLoadingSafety } from "../utils/subscriptionSafety";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  useEffect(() => {
    if (!user?.uid) return;
    const clearSafety = withLoadingSafety(setLoading);
    const unsubscribe = subscribeNotifications(user.uid, (items) => {
      clearSafety();
      setNotifications(items);
      setLoading(false);
    });
    return () => {
      clearSafety();
      unsubscribe?.();
    };
  }, [user?.uid]);

  if (loading) return <LoadingState label="Loading notifications..." />;

  return (
    <PageShell
      title="Notifications"
      subtitle="Realtime updates for connection requests, applications, opportunities, and messages."
      actions={
        unreadCount > 0 ? (
          <PrimaryButton
            type="button"
            onClick={() => markAllNotificationsRead(user.uid)}
          >
            Mark all as read
          </PrimaryButton>
        ) : null
      }
    >
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-tm-dark">
              Unread badge
            </h2>
            <p className="mt-1 text-sm text-tm-muted">
              You have {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}.
            </p>
          </div>
          <Badge tone={unreadCount > 0 ? "amber" : "green"}>
            {unreadCount} unread
          </Badge>
        </div>
      </Card>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When something important happens in TalentMesh, it will appear here instantly."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "opacity-70" : "border-primary/40 shadow-tm-glow"}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-tm-dark">
                      {notification.title}
                    </h3>
                    <Badge tone={notification.read ? "slate" : "blue"}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-tm-muted">
                    {notification.message}
                  </p>
                  <p className="mt-3 text-xs text-tm-muted">
                    {formatDate(notification.createdAt, { includeTime: true })}
                  </p>
                </div>
                {!notification.read ? (
                  <SecondaryButton
                    type="button"
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    Mark as read
                  </SecondaryButton>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
