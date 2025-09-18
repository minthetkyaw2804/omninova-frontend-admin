import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchCompanyData } from "../utils/auth";
import "./Navbar.css";

const Navbar = ({ onLogout, userName }) => {
  const location = useLocation();
  const [companyData, setCompanyData] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [logoVersion, setLogoVersion] = useState(Date.now());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await fetchCompanyData();

        // Handle different possible response structures
        let companyInfo = response;
        if (response.data) {
          companyInfo = response.data;
        }

        setCompanyData(companyInfo);
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      }
    };

    const handleLogoUpdate = (event) => {
      setLogoVersion(event.detail.version);
    };

    loadCompanyData();
    window.addEventListener('logoUpdated', handleLogoUpdate);
    
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  const handleLogoError = () => {
    setLogoError("Logo failed to load");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            {logoError ? (
              <div className="logo-placeholder error">
                <span className="logo-fallback">[LOGO]</span>
                <span style={{ fontSize: "8px", color: "red" }}>Error</span>
              </div>
            ) : (
              <div className="logo-container">
                <img
                  src={`http://162.84.221.21/images/company/company_logo.png?v=${logoVersion}`}
                  alt="Company Logo"
                  className="navbar-logo"
                  onError={handleLogoError}
                />
              </div>
            )}

            <div className="brand-info">
              <h1 className="brand-title">Dashboard</h1>
              {companyData?.company_name && (
                <span className="company-name">{companyData.company_name}</span>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-center">
            <nav className="navbar-nav">
              <Link
                to="/admin/admin-profile"
                className={`nav-link ${
                  location.pathname === "/admin/admin-profile" ? "active" : ""
                }`}
              >
                Profile
              </Link>
              <Link
                to="/admin/users"
                className={`nav-link ${
                  location.pathname === "/admin/users" ? "active" : ""
                }`}
              >
                Admins
              </Link>
              <Link
                to="/admin/company"
                className={`nav-link ${
                  location.pathname === "/admin/company" ? "active" : ""
                }`}
              >
                Company
              </Link>
              <Link
                to="/admin/blogs"
                className={`nav-link ${
                  location.pathname === "/admin/blogs" ? "active" : ""
                }`}
              >
                Blogs
              </Link>
              <Link
                to="/admin/project-types"
                className={`nav-link ${
                  location.pathname === "/admin/project-types" ? "active" : ""
                }`}
              >
                Project Types
              </Link>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions">
            <div className="user-info">
              <span className="welcome-text">Welcome,</span>
              <span className="user-name">{userName || "User"}</span>
            </div>

            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="mobile-menu-toggle">
            <button
              className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
        {/* Close Button */}
        <button
          className="mobile-menu-close"
          onClick={closeMobileMenu}
          aria-label="Close mobile menu"
        >
          ✕
        </button>

        <div className="mobile-menu-content">
          {/* Mobile User Info */}
          <div className="mobile-user-info">
            <span className="mobile-welcome-text">Welcome,</span>
            <span className="mobile-user-name">{userName || "User"}</span>
          </div>

          {/* Mobile Navigation */}
          <nav className="mobile-nav">
            <Link
              to="/admin/admin-profile"
              className={`mobile-nav-link ${
                location.pathname === "/admin/admin-profile" ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-nav-icon">👤</span>
              Profile
            </Link>
            <Link
              to="/admin/users"
              className={`mobile-nav-link ${
                location.pathname === "/admin/users" ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-nav-icon">👥</span>
              Admins
            </Link>
            <Link
              to="/admin/company"
              className={`mobile-nav-link ${
                location.pathname === "/admin/company" ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-nav-icon">🏢</span>
              Company
            </Link>
            <Link
              to="/admin/blogs"
              className={`mobile-nav-link ${
                location.pathname === "/admin/blogs" ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-nav-icon">📝</span>
              Blogs
            </Link>
            <Link
              to="/admin/project-types"
              className={`mobile-nav-link ${
                location.pathname === "/admin/project-types" ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-nav-icon">📁</span>
              Project Types
            </Link>
          </nav>

          {/* Mobile Logout */}
          <div className="mobile-actions">
            <button
              onClick={() => {
                onLogout();
                closeMobileMenu();
              }}
              className="mobile-logout-btn"
            >
              <span className="mobile-logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={closeMobileMenu}
        ></div>
      )}
    </>
  );
};

export default Navbar;
