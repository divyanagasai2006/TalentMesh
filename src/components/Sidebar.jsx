import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  FolderKanban,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authState";

const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/explore", label: "Explore", icon: Search },
  { to: "/student/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/student/applications", label: "Applications", icon: ShieldCheck },
  { to: "/student/connections", label: "Connections", icon: Network },
  { to: "/student/projects", label: "Projects", icon: FolderKanban },
  { to: "/student/announcements", label: "Announcements", icon: Megaphone },
  { to: "/student/resources", label: "Learning Resources", icon: BookOpen },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/messages", label: "Messages", icon: MessageSquare },
  { to: "/student/profile", label: "Profile", icon: UserCircle2 },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/applications", label: "Applications", icon: ShieldCheck },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Wrench },
  { to: "/admin/resources", label: "Content", icon: BookOpen },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/activity", label: "Activity", icon: Activity },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/profile", label: "Profile", icon: UserCircle2 },
];

export default function Sidebar({ open = false, onClose }) {
  const { user } = useAuth();
  const links = user?.role === "admin" ? adminLinks : studentLinks;

  const navContent = (
    <>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.35em] text-white shadow-tm-glow">
          <Sparkles size={14} />
          TalentMesh
        </div>
        <p className="mt-4 text-sm text-tm-muted">
          {user?.role === "admin" ? "Admin workspace" : "Student workspace"}
        </p>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "tm-nav-active"
                    : "text-tm-muted hover:bg-primary/5 hover:text-tm-dark"
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-primary/15 bg-white/60 p-6 backdrop-blur-xl lg:block">
        {navContent}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-primary/15 bg-white/95 p-6 shadow-tm-glow-lg backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-primary/20 p-2 text-tm-muted hover:bg-primary/5"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}
