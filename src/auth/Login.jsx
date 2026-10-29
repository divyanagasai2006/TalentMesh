import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import StarBackground from "../components/StarBackground";
import { AuthCard } from "../components/ui";
import { useAuth } from "../context/authState";

const roleOptions = ["student", "admin"];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => `Login as ${formData.role === "admin" ? "Admin" : "Student"}`,
    [formData.role],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const profile = await login(formData.email, formData.password);
      const actualRole = (profile?.role || "student").toLowerCase();
      if (actualRole !== formData.role) {
        throw new Error(
          `This account is registered as ${actualRole}. Please select the correct role.`,
        );
      }
      navigate(
        actualRole === "admin" ? "/admin/dashboard" : "/student/dashboard",
      );
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-tm-gradient px-6 py-12">
      <StarBackground variant="subtle" />
      <AuthCard className="relative z-10 max-w-md">
        <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm font-medium text-tm-muted transition hover:text-primary"
          >
            ← Back to landing page
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h1 className="text-3xl font-bold text-tm-dark">{title}</h1>
          </div>
          <p className="mt-2 text-sm text-tm-muted">
            Access your TalentMesh workspace.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-tm-dark">
            <span>Role</span>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({ ...current, role }))
                  }
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    formData.role === role
                      ? "border-primary bg-gradient-to-r from-primary to-secondary text-white shadow-tm-glow"
                      : "border-primary/25 bg-white/70 text-tm-dark hover:border-primary/40 hover:shadow-tm-glow"
                  }`}
                >
                  {role === "admin" ? "Admin" : "Student"}
                </button>
              ))}
            </div>
          </label>

          <label className="block space-y-2 text-sm font-medium text-tm-dark">
            <span>Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
              className="tm-input"
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-tm-dark">
            <span>Password</span>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((current) => ({
                  ...current,
                  password: e.target.value,
                }))
              }
              className="tm-input"
              required
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="tm-btn-primary mt-6 w-full py-3"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-tm-muted">
          New to TalentMesh?{" "}
          <Link to="/register" className="font-semibold text-primary hover:text-secondary">
            Create an account
          </Link>
        </p>
        </form>
      </AuthCard>
    </div>
  );
}
