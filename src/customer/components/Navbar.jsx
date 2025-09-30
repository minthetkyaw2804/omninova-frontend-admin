import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCompany } from "./Layout";
import "./Navbar.css";

const Navbar = () => {
  const { companyData } = useCompany();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  const getSocialIcon = (platform) => {
    const platformLower = platform.toLowerCase();

    // Map platform names to Font Awesome icon classes
    const iconMap = {
      instagram: "fab fa-instagram",
      facebook: "fab fa-facebook",
      linkedin: "fab fa-linkedin",
      linkdein: "fab fa-linkedin",
      twitter: "fab fa-twitter",
      x: "fab fa-x-twitter",
      youtube: "fab fa-youtube",
      tiktok: "fab fa-tiktok",
      pinterest: "fab fa-pinterest",
      snapchat: "fab fa-snapchat",
      whatsapp: "fab fa-whatsapp",
      telegram: "fab fa-telegram",
      discord: "fab fa-discord",
      reddit: "fab fa-reddit",
      github: "fab fa-github",
      medium: "fab fa-medium",
      twitch: "fab fa-twitch",
      vimeo: "fab fa-vimeo",
    };

    // Get the icon class, fallback to generic link icon
    const iconClass = iconMap[platformLower] || "fas fa-link";

    return <i className={iconClass}></i>;
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse tracking for magnetic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!companyData) return null;

  return (
    <nav className={`customer-navbar ${isScrolled ? "customer-scrolled" : ""}`}>
      <div className="customer-navbar-container">
        {/* Logo */}
        <Link
          to="/home"
          className="customer-navbar-logo"
          onClick={closeMobileMenu}
        >
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
        <div className="customer-navbar-menu">
          <Link
            to="/home"
            className={`customer-navbar-link ${
              isActive("/home") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`customer-navbar-link ${
              isActive("/about") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            About Us
          </Link>
          <Link
            to="/blogs"
            className={`customer-navbar-link ${
              isActive("/blogs") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            Blogs
          </Link>
          <Link
            to="/projects"
            className={`customer-navbar-link ${
              isActive("/projects") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            Projects
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="customer-navbar-social">
          {companyData?.social_media?.map((social, index) => (
            <a
              key={index}
              href={social.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="customer-social-icon"
              aria-label={`Follow us on ${social.platform_name}`}
            >
              {getSocialIcon(social.platform_name)}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="customer-mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div
            className={`customer-hamburger ${isMobileMenuOpen ? "open" : ""}`}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`customer-mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <Link
          to="/home"
          className={`customer-mobile-link ${
            isActive("/home") ? "active" : ""
          }`}
          onClick={closeMobileMenu}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`customer-mobile-link ${
            isActive("/about") ? "active" : ""
          }`}
          onClick={closeMobileMenu}
        >
          About Us
        </Link>
        <Link
          to="/blogs"
          className={`customer-mobile-link ${
            isActive("/blogs") ? "active" : ""
          }`}
          onClick={closeMobileMenu}
        >
          Blogs
        </Link>
        <Link
          to="/projects"
          className={`customer-mobile-link ${
            isActive("/projects") ? "active" : ""
          }`}
          onClick={closeMobileMenu}
        >
          Projects
        </Link>

        {/* Mobile Social Media Icons */}
        <div className="customer-mobile-social">
          {companyData?.social_media?.map((social, index) => (
            <a
              key={index}
              href={social.page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="customer-mobile-social-icon"
              aria-label={`Follow us on ${social.platform_name}`}
            >
              {getSocialIcon(social.platform_name)}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
