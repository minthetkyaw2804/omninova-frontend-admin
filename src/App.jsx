import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./admin/components/Login";
import AdminProfile from "./admin/components/AdminProfile";
import Users from "./admin/components/Users";
import Company from "./admin/components/Company";
import Blogs from "./admin/components/Blogs";
import ProjectTypes from "./admin/components/ProjectTypes";
import Projects from "./admin/components/Projects";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import Footer from "./admin/components/Footer";
import { initializeAuth } from "./admin/utils/auth";
import "./App.css";

function App() {
  useEffect(() => {
    // Initialize authentication and token refresh on app load
    initializeAuth();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div>Welcome</div>
              <Footer />
            </>
          }
        />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/admin-profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        {/* Redirect old routes to new admin routes */}
        <Route
          path="/admin-profile"
          element={<Navigate to="/admin/admin-profile" replace />}
        />
        <Route
          path="/dashboard"
          element={<Navigate to="/admin/admin-profile" replace />}
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route
          path="/admin/company"
          element={
            <ProtectedRoute>
              <Company />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={<Navigate to="/admin/company" replace />}
        />
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          }
        />
        <Route path="/blogs" element={<Navigate to="/admin/blogs" replace />} />
        <Route
          path="/admin/project-types"
          element={
            <ProtectedRoute>
              <ProjectTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-types"
          element={<Navigate to="/admin/project-types" replace />}
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={<Navigate to="/admin/projects" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
