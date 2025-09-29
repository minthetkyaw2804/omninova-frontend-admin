import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./customer/components/Layout";
import Home from "./customer/components/Home";
import About from "./customer/components/About";
import Blogs from "./customer/components/Blogs";
import BlogDetails from "./customer/components/BlogDetails";
import Projects from "./customer/components/Projects";
import ProjectDetails from "./customer/components/ProjectDetails";
import Login from "./admin/components/Login";
import AdminProfile from "./admin/components/AdminProfile";
import Users from "./admin/components/Users";
import Company from "./admin/components/Company";
import AdminBlogs from "./admin/components/Blogs";
import ProjectTypes from "./admin/components/ProjectTypes";
import AdminProjects from "./admin/components/Projects";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import Footer from "./admin/components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { initializeAuth } from "./admin/utils/auth";
import "./App.css";

function App() {
  useEffect(() => {
    // Initialize authentication and token refresh on app load
    initializeAuth();
  }, []);

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        {/* Customer Routes - Root Level */}
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/blogs"
          element={
            <Layout>
              <Blogs />
            </Layout>
          }
        />
        <Route
          path="/blogs/:id"
          element={
            <Layout>
              <BlogDetails />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <Projects />
            </Layout>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <Layout>
              <ProjectDetails />
            </Layout>
          }
        />

        {/* Admin Routes - Under /admin/ */}
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
        <Route
          path="/admin/company"
          element={
            <ProtectedRoute>
              <Company />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <ProtectedRoute>
              <AdminBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/project-types"
          element={
            <ProtectedRoute>
              <ProjectTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute>
              <AdminProjects />
            </ProtectedRoute>
          }
        />

        {/* Default redirect to home page */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;
