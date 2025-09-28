import { useCompany } from "./Layout";
import { useState, useEffect } from "react";
import "./About.css";

const About = () => {
  const { companyData } = useCompany();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".about-animate");
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add("about-animated");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on initial load

    // Trigger hero animation
    setTimeout(() => setIsVisible(true), 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!companyData) {
    return (
      <div className="customer-loading-container">
        <div className="customer-loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-grid-bg"></div>
        <div className="floating-cubes">
          <div className="cube"></div>
          <div className="cube"></div>
          <div className="cube"></div>
          <div className="cube"></div>
        </div>
        <div className="about-hero-container">
          <div className={`about-hero-content ${isVisible ? 'visible' : ''}`}>
            <span className="about-badge">About Us</span>
            <h1 className="about-hero-title">
              Transforming Ideas Into <br />
              <span className="gradient-text">Digital Reality</span>
            </h1>
            <p className="about-hero-subtitle">
              We are {companyData.name} - where innovation meets expertise to create exceptional digital experiences
            </p>
            <div className="tech-stats">
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section about-animate">
        <div className="about-container">
          <div className="about-content-card professional-tech">
            <div className="tech-grid-overlay"></div>
            <div className="content-header">
              <div className="header-decoration professional">
                <div className="decoration-line"></div>
                <div className="decoration-dot"></div>
                <div className="decoration-line"></div>
              </div>
              <h2 className="about-section-title">Who We Are</h2>
            </div>
            <div className="about-text-wrapper">
              <div className="quote-mark">"</div>
              <p className="about-description">{companyData.about_us}</p>
            </div>
            <div className="professional-accents">
              <div className="accent-line accent-top"></div>
              <div className="accent-line accent-bottom"></div>
              <div className="data-points">
                <div className="data-point dp-1"></div>
                <div className="data-point dp-2"></div>
                <div className="data-point dp-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="vision-bg-elements">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="liquid-shape" style={{top: '20%', left: '80%'}}></div>
          <div className="liquid-shape" style={{bottom: '30%', right: '85%', animationDelay: '3s'}}></div>
        </div>
        <div className="vision-container">
          <div className="vision-content about-animate tilt-3d">
            <div className="vision-header">
              <div className="vision-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="vision-title">Our Vision</h2>
              <div className="vision-subtitle">Where we see ourselves in the future</div>
            </div>
            <div className="vision-text-container">
              <div className="vision-decorative-line"></div>
              <p className="vision-text">{companyData.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="goal-section">
        <div className="goal-bg-pattern">
          <div className="pattern-grid"></div>
          <div className="pattern-dots"></div>
        </div>
        <div className="floating-cubes">
          <div className="cube"></div>
          <div className="cube"></div>
        </div>
        <div className="goal-container">
          <div className="goal-content about-animate tilt-3d">
            <div className="goal-layout">
              <div className="goal-text-side">
                <div className="goal-header">
                  <span className="goal-badge">Mission</span>
                  <h2 className="goal-title">Our Mission</h2>
                  <p className="goal-subtitle">The driving force behind everything we do</p>
                </div>
                <div className="goal-text-wrapper">
                  <p className="goal-text">{companyData.goal}</p>
                  <div className="goal-highlight-bar"></div>
                </div>
              </div>
              <div className="goal-visual-side">
                <div className="goal-visual-container">
                  <div className="goal-icon-main">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="goal-orbit-rings">
                    <div className="orbit-ring ring-1"></div>
                    <div className="orbit-ring ring-2"></div>
                    <div className="orbit-ring ring-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta-section about-animate">
        <div className="cta-background">
          <div className="cta-grid"></div>
          <div className="cta-gradient"></div>
        </div>
        <div className="about-cta-container">
          <div className="cta-content">
            <h2 className="about-cta-title">Ready to Build Something Amazing?</h2>
            <p className="about-cta-subtitle">
              Let's turn your vision into reality with innovative solutions tailored to your needs
            </p>
            <div className="about-cta-buttons">
              <button className="customer-btn customer-btn-primary">
                <span>Start Your Project</span>
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className="customer-btn customer-btn-secondary">
                <span>View Our Work</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
