import { useCompany } from "./Layout";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

const Home = () => {
  const { companyData } = useCompany();
  const [statsVisible, setStatsVisible] = useState(false);

  // Animated counters
  const [projectCount, setProjectCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [experienceCount, setExperienceCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.querySelector(".stats-section");
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0 && !statsVisible) {
          setStatsVisible(true);
          // Animate counters
          animateCounter(setProjectCount, 20, 2000);
          animateCounter(setClientCount, 50, 2000);
          animateCounter(setExperienceCount, 3, 2000);
        }
      }

      // Add scroll animations for other sections
      const animateElements = document.querySelectorAll(".animate-on-scroll");
      animateElements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        if (
          elementRect.top < window.innerHeight - 100 &&
          elementRect.bottom > 0
        ) {
          element.classList.add("animated");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [statsVisible]);

  const animateCounter = (setter, target, duration) => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(start));
      }
    }, 16);
  };

  if (!companyData) {
    return (
      <div className="customer-loading-container">
        <div className="customer-loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="floating-elements">
          <div className="floating-element floating-1"></div>
          <div className="floating-element floating-2"></div>
          <div className="floating-element floating-3"></div>
          <div className="floating-element floating-4"></div>
          <div className="floating-element floating-5"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              We Create{" "}
              <span className="gradient-text">Digital Excellence</span>
            </h1>
            <div className="brand-meaning">
              <div className="tech-terminal">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="terminal-title">~/omninova --version</div>
                </div>
                <div className="terminal-content">
                  <div className="code-line">
                    <span className="prompt">$</span>
                    <span className="command">decode --name="OMNINOVA"</span>
                  </div>
                  <div className="output-line">
                    <span className="variable">omni</span>
                    <span className="operator">=</span>
                    <span className="string">
                      "full-stack + cross-platform"
                    </span>
                  </div>
                  <div className="output-line">
                    <span className="variable">nova</span>
                    <span className="operator">=</span>
                    <span className="string">"breakthrough + innovation"</span>
                  </div>
                  <div className="result-line">
                    <span className="comment">
                      // Complete Digital Solutions Framework
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/about" className="customer-btn customer-btn-primary">
                <span>Discover Our Story</span>
                <svg
                  className="btn-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                to="/projects"
                className="customer-btn customer-btn-secondary"
              >
                <span>View Portfolio</span>
                <svg
                  className="btn-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{projectCount}+</div>
            <div className="stat-label">Projects Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{clientCount}+</div>
            <div className="stat-label">Happy Clients</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{experienceCount}+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section animate-on-scroll">
        <div className="services-container">
          <h2 className="section-title">What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🎨</div>
              <h3>Web Design</h3>
              <p>Beautiful, responsive designs that captivate your audience</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💻</div>
              <h3>Development</h3>
              <p>Robust, scalable web applications built with modern tech</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🛠️</div>
              <h3>Maintenance</h3>
              <p>Ongoing support to keep your site running smoothly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section animate-on-scroll">
        <div className="tech-container">
          <h2 className="section-title">Our Technology Stack</h2>
          <p className="tech-subtitle">
            We use cutting-edge technologies to build amazing digital
            experiences
          </p>
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">⚛️</div>
              <h3>React</h3>
              <p>Modern frontend development</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🐘</div>
              <h3>PHP</h3>
              <p>Robust server-side scripting</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🐍</div>
              <h3>Python</h3>
              <p>Versatile programming language</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔷</div>
              <h3>.NET</h3>
              <p>Enterprise solutions</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🎨</div>
              <h3>Laravel</h3>
              <p>Elegant PHP framework</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔗</div>
              <h3>APIs</h3>
              <p>Seamless integrations</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">📱</div>
              <h3>Mobile</h3>
              <p>Responsive design</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">⚡</div>
              <h3>Performance</h3>
              <p>Lightning fast solutions</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔒</div>
              <h3>Security</h3>
              <p>Advanced protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section animate-on-scroll">
        <div className="cta-bg-elements">
          <div className="cta-circle cta-circle-1"></div>
          <div className="cta-circle cta-circle-2"></div>
          <div className="cta-circle cta-circle-3"></div>
        </div>
        <div className="cta-container">
          <div className="cta-badge">
            <span>🎯 Ready to Transform Your Business?</span>
          </div>
          <h2 className="cta-title">
            Let's Create Something{" "}
            <span className="gradient-text">Extraordinary</span>
          </h2>
          <p className="cta-subtitle">
            Join hundreds of satisfied clients who trust us with their digital
            presence. Let's build something amazing together.
          </p>
          <div className="cta-actions">
            <Link
              to="/about"
              className="customer-btn customer-btn-primary customer-btn-large"
            >
              <span>Start Your Project</span>
              <svg
                className="btn-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              to="/projects"
              className="customer-btn customer-btn-outline customer-btn-large"
            >
              <span>View Portfolio</span>
              <svg
                className="btn-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
