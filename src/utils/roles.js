export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
};

export function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();
  if (value === "admin" || value === "administrator") return ROLES.ADMIN;
  return ROLES.STUDENT;
}

export function isAdminRole(role) {
  return normalizeRole(role) === ROLES.ADMIN;
}

export function dashboardPath(role) {
  return isAdminRole(role) ? "/admin/dashboard" : "/student/dashboard";
}
