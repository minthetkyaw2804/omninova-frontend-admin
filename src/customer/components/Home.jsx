import { useCompany } from "./Layout";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const { companyData } = useCompany();

  if (!companyData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo">
              {companyData.logo_url ? (
                <img
                  src={companyData.logo_url}
                  alt={`${companyData.name} Logo`}
                  className="hero-logo-image"
                />
              ) : (
                <div className="hero-logo-placeholder">
                  <span className="logo-text">
                    {companyData.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <p className="hero-subtitle">
              {companyData.about_us
                ? companyData.about_us.substring(0, 200) + "..."
                : "We are a dynamic web development company dedicated to creating exceptional digital experiences."}
            </p>
            <div className="hero-actions">
              <Link to="/about" className="btn btn-primary">
                Learn More
              </Link>
              <Link to="/projects" className="btn btn-secondary">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview-section">
        <div className="about-preview-container">
          <div className="about-preview-content">
            <h2 className="section-title">About Us</h2>
            <p className="about-description">
              {companyData.about_us ||
                "We are a dynamic web development company dedicated to creating exceptional digital experiences through innovative website design and development services."}
            </p>
            <Link to="/about" className="read-more-link">
              Read More <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Company Highlights */}
      <section className="highlights-section">
        <div className="highlights-container">
          <h2 className="section-title">Our Vision & Goals</h2>
          <div className="highlight-cards">
            <div className="highlight-card">
              <div className="card-header">
                <div className="icon-wrapper vision">
                  <svg
                    className="highlight-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path
                      fillRule="evenodd"
                      d="M.661 10.524a1.5 1.5 0 010-1.048C2.72 6.31 6.003 4.5 10 4.5c3.996 0 7.28 1.81 9.339 4.976a1.5 1.5 0 010 1.048C17.28 13.69 13.997 15.5 10 15.5c-3.996 0-7.28-1.81-9.339-4.976zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3>Our Vision</h3>
              </div>
              <p>
                {companyData.vision ||
                  "We envision a digital landscape where every business can access premium web solutions that elevate their brand and drive growth."}
              </p>
            </div>

            <div className="highlight-card">
              <div className="card-header">
                <div className="icon-wrapper mission">
                  <svg
                    className="highlight-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1.5a1 1 0 01-2 0V3a1 1 0 011-1zm-4 8a4 4 011 8 4 4 0 01-8 0 4 4 0 018 0zm-2.828 4.243a1 1 0 01-1.414-1.414L4.93 11.07a1 1 0 011.414 1.414l-1.414 1.414zm11.314 0a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414zM10 18a1 1 0 01-1 1h-1.5a1 1 0 010-2H9a1 1 0 011 1zm4-8a4 4 011 8 4 4 0 01-8 0 4 4 0 018 0zm2.828-4.243a1 1 0 011.414 1.414L15.07 12.07a1 1 0 01-1.414-1.414l1.414-1.414zM10 2a1 1 0 011 1v1.5a1 1 0 01-2 0V3a1 1 0 011-1zm-4 8a4 4 011 8 4 4 0 01-8 0 4 4 0 018 0zm-2.828 4.243a1 1 0 01-1.414-1.414L4.93 11.07a1 1 0 011.414 1.414l-1.414 1.414zm11.314 0a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414l1.414-1.414zM10 18a1 1 0 01-1 1h-1.5a1 1 0 010-2H9a1 1 0 011 1zm4-8a4 4 011 8 4 4 0 01-8 0 4 4 0 018 0zm2.828-4.243a1 1 0 011.414 1.414L15.07 12.07a1 1 0 01-1.414-1.414l1.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3>Our Goals</h3>
              </div>
              <p>
                {companyData.goal ||
                  "Our primary goal is to democratize professional web development by providing businesses of all sizes with access to high-quality, affordable website solutions."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">
            Let's build something amazing together.
          </p>
          <div className="cta-actions">
            <Link to="/about" className="btn btn-primary btn-large">
              Learn More About Us
            </Link>
            <Link to="/projects" className="btn btn-outline btn-large">
              View Our Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
