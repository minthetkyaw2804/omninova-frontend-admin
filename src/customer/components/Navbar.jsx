import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCompany } from "./Layout";
import "./Navbar.css";

const Navbar = () => {
  const { companyData } = useCompany();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!companyData) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="customer-navbar-logo" onClick={closeMobileMenu}>
          {companyData.logo_url ? (
            <img
              src={companyData.logo_url}
              alt={`${companyData.name} Logo`}
              className="customer-logo-image"
            />
          ) : (
            <div className="customer-logo-placeholder">
              <span className="customer-logo-text">
                {companyData.name.charAt(0)}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <Link
            to="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`navbar-link ${isActive("/about") ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            About Us
          </Link>
          <Link
            to="/blogs"
            className={`navbar-link ${isActive("/blogs") ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            Blogs
          </Link>
          <Link
            to="/projects"
            className={`navbar-link ${isActive("/projects") ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            Projects
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <Link
          to="/"
          className={`mobile-link ${isActive("/") ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`mobile-link ${isActive("/about") ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          About Us
        </Link>
        <Link
          to="/blogs"
          className={`mobile-link ${isActive("/blogs") ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          Blogs
        </Link>
        <Link
          to="/projects"
          className={`mobile-link ${isActive("/projects") ? "active" : ""}`}
          onClick={closeMobileMenu}
        >
          Projects
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
