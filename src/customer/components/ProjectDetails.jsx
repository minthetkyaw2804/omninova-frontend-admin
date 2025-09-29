import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompany } from "./Layout";
import { fetchProjectDetails } from "../utils/customerApi";
import "./ProjectDetails.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companyData } = useCompany();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Fetch project details from API
  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        setLoading(true);
        const result = await fetchProjectDetails(id);

        if (result.data) {
          setProject(result.data);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProjectDetails();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/projects');
  };

  const nextImage = () => {
    if (project && project.highlight_features && project.highlight_features[currentFeatureIndex]?.images?.length > 1) {
      const currentFeature = project.highlight_features[currentFeatureIndex];
      setCurrentImageIndex((prev) =>
        prev === currentFeature.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (project && project.highlight_features && project.highlight_features[currentFeatureIndex]?.images?.length > 1) {
      const currentFeature = project.highlight_features[currentFeatureIndex];
      setCurrentImageIndex((prev) =>
        prev === 0 ? currentFeature.images.length - 1 : prev - 1
      );
    }
  };

  const selectFeature = (index) => {
    setCurrentFeatureIndex(index);
    setCurrentImageIndex(0);
  };

  const copyPageLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopyMessage(true);
        setTimeout(() => setShowCopyMessage(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          setShowCopyMessage(true);
          setTimeout(() => setShowCopyMessage(false), 2000);
        } catch (fallbackErr) {
          console.error('Failed to copy text: ', fallbackErr);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!companyData) {
    return (
      <div className="customer-project-details-loading-container">
        <div className="customer-project-details-loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="customer-project-details-loading-container">
        <div className="customer-project-details-loading-spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-project-details-error-container">
        <div className="customer-project-details-error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="customer-project-details-retry-btn" onClick={handleBackClick}>
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="customer-project-details-error-container">
        <div className="customer-project-details-error-icon">🔍</div>
        <h3>Project not found</h3>
        <p>The project you're looking for doesn't exist or has been removed.</p>
        <button className="customer-project-details-retry-btn" onClick={handleBackClick}>
          Back to Projects
        </button>
      </div>
    );
  }

  const currentFeature = project.highlight_features?.[currentFeatureIndex];
  const currentImage = currentFeature?.images?.[currentImageIndex];

  return (
    <div className="customer-project-details-page">
      {/* Navigation Header */}
      <div className="customer-project-details-nav">
        <div className="customer-project-details-nav-container">
          <button className="customer-project-details-back-btn" onClick={handleBackClick}>
            <div className="customer-back-btn-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Back to Projects</span>
          </button>

          <div className="customer-project-details-nav-actions">
            <button className="customer-project-details-copy-btn" onClick={copyPageLink}>
              <svg className="customer-copy-icon" viewBox="0 0 24 24" fill="none">
                <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.24264C20 6.97713 19.8946 6.72249 19.7071 6.53553L16.4645 3.29289C16.2775 3.10536 16.0229 3 15.7574 3H10C8.89543 3 8 3.89543 8 5Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 18V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V9C4 7.89543 4.89543 7 6 7H8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Share</span>
            </button>

            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="customer-project-details-demo-btn"
              >
                <svg className="customer-demo-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Copy Message */}
      {showCopyMessage && (
        <div className="customer-project-details-copy-message">
          <div className="customer-copy-message-content">
            <svg className="customer-copy-success-icon" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="customer-project-details-hero">
        <div className="customer-project-details-hero-bg">
          <div className="customer-project-hero-grid"></div>
          <div className="customer-project-hero-particles">
            <div className="customer-hero-particle customer-hero-p1"></div>
            <div className="customer-hero-particle customer-hero-p2"></div>
            <div className="customer-hero-particle customer-hero-p3"></div>
            <div className="customer-hero-particle customer-hero-p4"></div>
          </div>
        </div>

        <div className="customer-project-details-hero-container">
          <div className="customer-project-details-hero-content">
            <div className="customer-project-type-badge">
              <div className="customer-badge-glow"></div>
              <span>{project.project_type}</span>
            </div>

            <h1 className="customer-project-details-title">
              <span className="customer-title-main">{project.name}</span>
              <div className="customer-title-underline"></div>
            </h1>

            <p className="customer-project-details-description">
              {project.description}
            </p>

            <div className="customer-project-details-stats">
              <div className="customer-stat-item">
                <div className="customer-stat-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="customer-stat-info">
                  <span className="customer-stat-number">{project.highlight_features?.length || 0}</span>
                  <span className="customer-stat-label">Features</span>
                </div>
              </div>

              <div className="customer-stat-item">
                <div className="customer-stat-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8C20.9996 7.64928 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64928 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 4.21L12 6.81L16.5 4.21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 19.79V14.6L3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12L16.5 14.6V19.79" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 13.01V21.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="customer-stat-info">
                  <span className="customer-stat-number">Live</span>
                  <span className="customer-stat-label">Status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {project.highlight_features && project.highlight_features.length > 0 && (
        <section className="customer-project-details-features">
          <div className="customer-project-details-features-container">
            <div className="customer-features-header">
              <h2 className="customer-features-title">
                <span className="customer-features-title-text">Highlight Features</span>
                <div className="customer-features-title-line"></div>
              </h2>

              {project.highlight_features.length > 1 && (
                <div className="customer-features-tabs">
                  {project.highlight_features.map((feature, index) => (
                    <button
                      key={feature.id}
                      className={`customer-feature-tab ${index === currentFeatureIndex ? 'customer-active' : ''}`}
                      onClick={() => selectFeature(index)}
                    >
                      <div className="customer-tab-bg"></div>
                      <span>Feature {index + 1}</span>
                      {index === currentFeatureIndex && <div className="customer-tab-indicator"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentFeature && (
              <div className="customer-feature-showcase">
                <div className="customer-feature-content">
                  <div className="customer-feature-info">
                    <h3 className="customer-feature-title">{currentFeature.title}</h3>
                    <p className="customer-feature-description">{currentFeature.description}</p>
                  </div>

                  {currentFeature.images && currentFeature.images.length > 0 && (
                    <div className="customer-feature-gallery">
                      <div className="customer-gallery-container">
                        <div className="customer-gallery-main">
                          <div className="customer-image-wrapper">
                            <img
                              src={currentImage?.image_url}
                              alt={currentImage?.image_name}
                              className="customer-feature-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="customer-image-placeholder" style={{ display: 'none' }}>
                              <div className="customer-placeholder-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            </div>
                            <div className="customer-image-overlay">
                              <div className="customer-overlay-grid"></div>
                            </div>
                          </div>

                          {currentFeature.images.length > 1 && (
                            <>
                              <button className="customer-gallery-btn customer-prev-btn" onClick={prevImage}>
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button className="customer-gallery-btn customer-next-btn" onClick={nextImage}>
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </>
                          )}
                        </div>

                        {currentFeature.images.length > 1 && (
                          <div className="customer-gallery-indicators">
                            {currentFeature.images.map((_, index) => (
                              <button
                                key={index}
                                className={`customer-indicator ${index === currentImageIndex ? 'customer-active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                              >
                                <div className="customer-indicator-dot"></div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectDetails;