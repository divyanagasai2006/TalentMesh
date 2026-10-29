import { Navigate, Outlet } from "react-router-dom";

export default function RequireTalents() {
  const hasTalents = localStorage.getItem("userTalents");

  if (!hasTalents) {
    return <Navigate to="/interests" replace />;
  }

  return <Outlet />;
}
