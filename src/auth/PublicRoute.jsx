import { Navigate, Outlet } from "react-router-dom";

export default function PublicRoute() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    const hasTalents = localStorage.getItem("userTalents");
    return <Navigate to={hasTalents ? "/dashboard" : "/interests"} replace />;
  }

  return <Outlet />;
}
