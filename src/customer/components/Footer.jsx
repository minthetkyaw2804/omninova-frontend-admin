import { useCompany } from "./Layout";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const { companyData } = useCompany();
  const currentYear = new Date().getFullYear();

  if (!companyData) return null;

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

  return (
    <footer className="customer-footer">
      <div className="customer-footer-container">
        {/* Company Contacts */}
        <div className="customer-footer-section">
          <h3>Contact Us</h3>
          <div className="customer-contact-list">
            {companyData.contacts &&
              companyData.contacts.map((contact, index) => (
                <div key={index} className="customer-contact-item">
                  <span className="customer-contact-department">
                    {contact.department}
                  </span>
                  <span className="customer-contact-number">
                    {contact.phone_number}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="customer-footer-section">
          <h3>Follow Us</h3>
          <div className="customer-social-links">
            {companyData.social_media &&
              companyData.social_media.map((social, index) => (
                <a
                  key={index}
                  href={social.page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="customer-social-link"
                  aria-label={`Follow us on ${social.platform_name}`}
                >
                  {getSocialIcon(social.platform_name)}
                  <span>
                    {social.platform_name === "Linkdein"
                      ? "LinkedIn"
                      : social.platform_name}
                  </span>
                </a>
              ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="customer-footer-section">
          <h3>Quick Links</h3>
          <div className="customer-nav-links">
            <Link to="/home" className="customer-nav-link">
              Home
            </Link>
            <Link to="/about" className="customer-nav-link">
              About Us
            </Link>
            <Link to="/blogs" className="customer-nav-link">
              Blogs
            </Link>
            <Link to="/projects" className="customer-nav-link">
              Projects
            </Link>
          </div>
        </div>

        {/* Company Address */}
        <div className="customer-footer-section">
          <h3>Our Location</h3>
          <div className="customer-address-info">
            <p className="customer-address-text">{companyData.address}</p>
          </div>
          {companyData.logo_url && (
            <div className="customer-logo-container">
              <img
                src={companyData.logo_url}
                alt={`${companyData.name} Logo`}
                className="customer-footer-logo"
              />
              <p className="customer-company-text">Company Limited</p>
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="customer-footer-bottom">
        <p>
          © {currentYear} {companyData.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
