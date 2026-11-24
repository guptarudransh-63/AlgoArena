import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemWorkspacePage from './pages/ProblemWorkspacePage';
import SubmissionsPage from './pages/SubmissionsPage';
import ProfilePage from './pages/ProfilePage';
import AdminProblemsPage from './pages/admin/AdminProblemsPage';
import AdminProblemEditPage from './pages/admin/AdminProblemEditPage';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Problem Explorer */}
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProblemsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Workspace (Distraction-Free IDE layout) */}
        <Route
          path="/problems/:slug"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProblemWorkspacePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Submissions History */}
        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SubmissionsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/problems"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminProblemsPage />
              </MainLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems/new"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminProblemEditPage />
              </MainLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems/:id/edit"
          element={
            <AdminRoute>
              <MainLayout>
                <AdminProblemEditPage />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
