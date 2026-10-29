import React, { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/register";
import RoleSelection from "./auth/RoleSelection";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./context/authState";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Chart from "./pages/Chart";
import ChartList from "./pages/ChartList";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import ManageStudentsPage from "./pages/ManageStudentsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import SkillsManagementPage from "./pages/SkillsManagementPage";
import LearningResourcesPage from "./pages/LearningResourcesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import UserActivityPage from "./pages/UserActivityPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-tm-gradient px-6">
          <div className="tm-glass-strong w-full max-w-lg p-8">
            <h1 className="text-2xl font-bold text-red-600">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-tm-muted">
              {this.state.error?.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="tm-btn-primary mt-6 px-4 py-3"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tm-gradient text-sm font-medium text-tm-muted">
      Loading TalentMesh...
    </div>
  );
}

function PublicRoute({ children }) {
  const { isLoggedIn, loading, user } = useAuth();
  if (loading) return <FullPageLoader />;
  if (isLoggedIn) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }
  return children;
}

function ProtectedRoute({ children, allowedRole }) {
  const { isLoggedIn, loading, user } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <RoleSelection />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/explore"
          element={
            <ProtectedRoute allowedRole="student">
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/opportunities"
          element={
            <ProtectedRoute allowedRole="student">
              <OpportunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/connections"
          element={
            <ProtectedRoute allowedRole="student">
              <ConnectionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/projects"
          element={
            <ProtectedRoute allowedRole="student">
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRole="student">
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/messages"
          element={
            <ProtectedRoute allowedRole="student">
              <ChartList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/messages/:chatId"
          element={
            <ProtectedRoute allowedRole="student">
              <Chart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRole="student">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRole="student">
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resources"
          element={
            <ProtectedRoute allowedRole="student">
              <LearningResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/announcements"
          element={
            <ProtectedRoute allowedRole="student">
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRole="admin">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/opportunities"
          element={
            <ProtectedRoute allowedRole="admin">
              <OpportunitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute allowedRole="admin">
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <ProtectedRoute allowedRole="admin">
              <SkillsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute allowedRole="admin">
              <LearningResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute allowedRole="admin">
              <UserActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRole="admin">
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRole="admin">
              <ManageStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRole="admin">
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRole="admin">
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRole="admin">
              <ChartList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages/:chatId"
          element={
            <ProtectedRoute allowedRole="admin">
              <Chart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRole="admin">
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<FullPageLoader />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
