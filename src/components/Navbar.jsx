import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchCompanyData } from "../utils/auth";
import "./Navbar.css";

const Navbar = ({ onLogout, userName }) => {
  const location = useLocation();
  const [companyData, setCompanyData] = useState(null);
  const [logoError, setLogoError] = useState("");
  const [logoVersion, setLogoVersion] = useState(Date.now());

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

  return (
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
          </nav>
        </div>

        <div className="navbar-actions">
          <div className="user-info">
            <span className="welcome-text">Welcome,</span>
            <span className="user-name">{userName || "User"}</span>
          </div>

          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
