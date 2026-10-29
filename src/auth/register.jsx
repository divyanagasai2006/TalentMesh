import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import StarBackground from "../components/StarBackground";
import { AuthCard } from "../components/ui";
import { useAuth } from "../context/authState";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(formData.email, formData.password, {
        role: "student",
        name: formData.name,
      });
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-tm-gradient px-6 py-12">
      <StarBackground variant="subtle" />
      <AuthCard className="relative z-10 max-w-lg">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm font-medium text-tm-muted transition hover:text-primary"
          >
            ← Back to landing page
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h1 className="text-3xl font-bold text-tm-dark">
              Create your account
            </h1>
          </div>
          <p className="mt-2 text-sm text-tm-muted">
            Join TalentMesh as a student and start building your network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-tm-dark">
            <span>Full name</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((current) => ({ ...current, name: e.target.value }))
              }
              className="tm-input"
              required
            />
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

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-tm-muted">
            <span className="font-semibold text-tm-dark">Student registration</span>
            <p className="mt-1">
              Admin accounts are created by platform administrators. If you need
              admin access, please contact your institution.
            </p>
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="tm-btn-primary w-full py-3"
          >
            {loading ? "Creating account..." : "Register as Student"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-tm-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-secondary">
            Login
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
