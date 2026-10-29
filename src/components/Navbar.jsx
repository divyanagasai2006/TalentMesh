import { Bell, LogOut, Menu, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authState";
import { subscribeNotifications } from "../services/platformService";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeNotifications(user.uid, (items) => {
      setUnreadCount(items.filter((item) => !item.read).length);
    });
    return () => unsubscribe?.();
  }, [user?.uid]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const notificationsPath =
    user?.role === "admin" ? "/admin/notifications" : "/student/notifications";

  return (
    <header className="sticky top-0 z-20 border-b border-primary/15 bg-white/70 px-4 py-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-2xl border border-primary/20 bg-white/80 p-2 text-primary transition hover:bg-primary/10 hover:shadow-tm-glow lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">
              <Sparkles size={12} />
              TalentMesh
            </p>
            <h2 className="text-lg font-semibold text-tm-dark">
              {user?.name ||
                user?.displayName ||
                user?.email ||
                "TalentMesh User"}
            </h2>
            <p className="text-sm text-tm-muted">
              {user?.role === "admin" ? "Admin" : "Student"} · {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(notificationsPath)}
            className="relative inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-white/80 px-4 py-2 text-sm font-semibold text-tm-dark transition hover:border-primary/40 hover:shadow-tm-glow"
          >
            <Bell size={16} className="text-primary" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-1 text-[10px] font-bold text-white shadow-tm-glow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl bg-tm-button px-4 py-2 text-sm font-semibold text-white shadow-tm-glow transition hover:scale-[1.02] hover:shadow-tm-glow-lg"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
