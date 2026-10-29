import { motion } from "framer-motion";
import { ArrowRight, LogIn, Sparkles, UserPlus, Zap, Users, FolderKanban, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import StarBackground from "../components/StarBackground";

const features = [
  {
    icon: Zap,
    title: "Opportunities",
    copy: "Internships, jobs, hackathons, projects, and campus events in one place.",
  },
  {
    icon: Users,
    title: "Connections",
    copy: "Build trusted student networks with connection requests and mutual peers.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    copy: "Join collaborative workspaces and grow your portfolio through team projects.",
  },
  {
    icon: MessageSquare,
    title: "Realtime Chat",
    copy: "Message after accepted connections for safe, intentional networking.",
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-tm-gradient text-tm-dark">
      <StarBackground variant="full" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-2 text-sm text-tm-dark shadow-tm-glow backdrop-blur-xl">
            <Sparkles size={16} className="text-primary" />
            Professional campus networking and recruitment
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gradient-tm">
                TALENTMESH
              </p>
              <h1 className="mt-4 text-5xl font-black leading-tight text-tm-dark md:text-6xl lg:text-7xl">
                Connect.{" "}
                <span className="text-gradient-tm">Collaborate.</span> Grow.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-tm-muted">
                TalentMesh helps students discover opportunities, connect with
                peers, participate in projects, apply for internships, and build
                professional networks.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-tm-button px-6 py-4 font-semibold text-white shadow-tm-glow transition hover:scale-[1.02] hover:shadow-tm-glow-lg"
                >
                  Get Started
                  <ArrowRight size={18} />
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-white/70 px-6 py-4 font-semibold text-tm-dark backdrop-blur transition hover:border-primary/50 hover:shadow-tm-glow"
                >
                  <LogIn size={18} className="text-primary" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-secondary/40 bg-secondary/10 px-6 py-4 font-semibold text-tm-dark backdrop-blur transition hover:bg-secondary/20 hover:shadow-tm-glow"
                >
                  <UserPlus size={18} className="text-secondary" />
                  Register
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="tm-glass-strong p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map(({ icon: Icon, title, copy }) => (
                  <div
                    key={title}
                    className="group rounded-3xl border border-primary/15 bg-white/60 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-tm-glow"
                  >
                    <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary transition group-hover:bg-primary/20">
                      <Icon size={18} />
                    </div>
                    <h2 className="text-lg font-semibold text-tm-dark">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-tm-muted">{copy}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
