import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "./Layout";
import { fetchProjects, fetchProjectTypes } from "../utils/customerApi";
import "./Projects.css";

const Projects = () => {
  const navigate = useNavigate();
  const { companyData } = useCompany();
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Fetch projects and project types from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [projectsResult, typesResult] = await Promise.all([
          fetchProjects(),
          fetchProjectTypes()
        ]);

        if (projectsResult.data) {
          setProjects(projectsResult.data);
          setFilteredProjects(projectsResult.data);
        } else {
          setError("No projects data received");
        }

        if (typesResult.data) {
          setProjectTypes(typesResult.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter projects based on search term and selected type
  useEffect(() => {
    let filtered = projects;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "") {
      filtered = filtered.filter((project) =>
        project.project_type === selectedType
      );
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedType, projects]);

  // Trigger animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
  };

  const handleProjectExplore = (projectId) => {
    navigate(`/projects/${projectId}`);
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
    <div className="customer-projects-page">
      {/* Hero Section */}
      <section className="customer-projects-hero">
        <div className="customer-projects-hero-bg">
          <div className="customer-hero-grid-overlay"></div>
          <div className="customer-floating-elements">
            <div className="customer-code-element customer-code-1">
              <span className="customer-code-text">{`<div>`}</span>
            </div>
            <div className="customer-code-element customer-code-2">
              <span className="customer-code-text">{`function()`}</span>
            </div>
            <div className="customer-code-element customer-code-3">
              <span className="customer-code-text">{`{ }`}</span>
            </div>
            <div className="customer-code-element customer-code-4">
              <span className="customer-code-text">{`</>`}</span>
            </div>
            <div className="customer-code-element customer-code-5">
              <span className="customer-code-text">{`()`}</span>
            </div>
            <div className="customer-code-element customer-code-6">
              <span className="customer-code-text">{`=>`}</span>
            </div>
          </div>
        </div>
        <div className="customer-projects-hero-container">
          <div className={`customer-projects-hero-content ${isVisible ? 'customer-visible' : ''}`}>
            <h1 className="customer-projects-hero-title">
              Our <span className="customer-gradient-text">Portfolio</span>
            </h1>
            <p className="customer-projects-hero-subtitle">
              Showcasing our expertise through innovative digital solutions that drive success
            </p>
            <div className="customer-hero-stats">
              <div className="customer-stat-item">
                <span className="customer-stat-number">{projects.length}+</span>
                <span className="customer-stat-label">Projects</span>
              </div>
              <div className="customer-stat-item">
                <span className="customer-stat-number">{projectTypes.length}+</span>
                <span className="customer-stat-label">Categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="customer-projects-main">
        <div className="customer-projects-container">
          {/* Filters Section */}
          <div className="customer-projects-filters">
            <div className="customer-filters-bg-effect">
              <div className="customer-filter-particles">
                <div className="customer-particle customer-particle-1"></div>
                <div className="customer-particle customer-particle-2"></div>
                <div className="customer-particle customer-particle-3"></div>
                <div className="customer-particle customer-particle-4"></div>
                <div className="customer-particle customer-particle-5"></div>
              </div>
              <div className="customer-filter-glow-lines">
                <div className="customer-glow-line customer-line-1"></div>
                <div className="customer-glow-line customer-line-2"></div>
                <div className="customer-glow-line customer-line-3"></div>
              </div>
            </div>

            <div className="customer-filters-content">
              <div className="customer-filter-section customer-search-section">
                <div className="customer-filter-label">
                  <svg className="customer-filter-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L15.803 15.803M15.803 15.803A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Search Projects</span>
                </div>
                <div className="customer-search-container">
                  <div className="customer-search-wrapper">
                    <div className="customer-search-glow"></div>
                    <input
                      type="text"
                      placeholder="Find your next inspiration..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="customer-search-input"
                    />
                    <div className="customer-search-ripple"></div>
                  </div>
                </div>
              </div>

              <div className="customer-filter-section customer-type-section">
                <div className="customer-filter-label">
                  <svg className="customer-filter-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H21M9 1V6M15 1V6M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Filter by Type</span>
                </div>
                <div className="customer-filter-dropdown-container">
                  <div className="customer-filter-dropdown">
                    <select
                      value={selectedType}
                      onChange={handleTypeChange}
                      className="customer-filter-select"
                    >
                      <option value="">All Categories</option>
                      {projectTypes.map((type, index) => (
                        <option key={index} value={type.type_name}>
                          {type.type_name}
                        </option>
                      ))}
                    </select>
                    <div className="customer-select-arrow">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {(searchTerm || selectedType) && (
                <div className="customer-filter-section customer-clear-section">
                  <button className="customer-clear-filters-btn" onClick={clearFilters}>
                    <div className="customer-btn-bg-effect"></div>
                    <svg className="customer-clear-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Reset</span>
                    <div className="customer-btn-ripple"></div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="customer-projects-loading">
              <div className="customer-loading-spinner"></div>
              <p>Loading amazing projects...</p>
            </div>
          ) : error ? (
            <div className="customer-projects-error">
              <div className="customer-error-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button
                className="customer-retry-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="customer-projects-empty">
              {searchTerm || selectedType ? (
                <>
                  <div className="customer-empty-icon">🔍</div>
                  <h3>No projects found</h3>
                  <p>No projects match your search criteria. Try different keywords or filters.</p>
                  <button className="customer-clear-filters-btn" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <div className="customer-empty-icon">💼</div>
                  <h3>No projects available</h3>
                  <p>We're working on amazing projects. Check back soon!</p>
                </>
              )}
            </div>
          ) : (
            <div className="customer-projects-showcase">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="customer-project-item"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="customer-project-bg-effects">
                    <div className="customer-project-particles">
                      <div className="customer-p-particle customer-p1"></div>
                      <div className="customer-p-particle customer-p2"></div>
                      <div className="customer-p-particle customer-p3"></div>
                    </div>
                    <div className="customer-project-glow-effect"></div>
                    <div className="customer-project-scan-line"></div>
                  </div>

                  <div className="customer-project-visual">
                    <div className="customer-project-image-wrapper">
                      <div className="customer-image-border-effect">
                        <div className="customer-border-corner customer-tl"></div>
                        <div className="customer-border-corner customer-tr"></div>
                        <div className="customer-border-corner customer-bl"></div>
                        <div className="customer-border-corner customer-br"></div>
                      </div>
                      <img
                        src={project.thumbnail_url}
                        alt={project.name}
                        className="customer-project-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="customer-project-image-placeholder" style={{ display: 'none' }}>
                        <div className="customer-placeholder-icon">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="customer-image-overlay">
                        <div className="customer-tech-grid">
                          <div className="customer-grid-line customer-h1"></div>
                          <div className="customer-grid-line customer-h2"></div>
                          <div className="customer-grid-line customer-v1"></div>
                          <div className="customer-grid-line customer-v2"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="customer-project-info">
                    <div className="customer-project-header">
                      <div className="customer-project-type-indicator">
                        <div className="customer-type-dot"></div>
                        <span className="customer-project-type">{project.project_type}</span>
                      </div>
                      <h3 className="customer-project-title">
                        <span className="customer-title-text">{project.name}</span>
                        <div className="customer-title-underline"></div>
                      </h3>
                    </div>

                    <div className="customer-project-description">
                      <div dangerouslySetInnerHTML={{ __html: project.description }} />
                    </div>

                    <div className="customer-project-actions">
                      <button
                        className="customer-project-explore-btn"
                        onClick={() => handleProjectExplore(project.id)}
                      >
                        <div className="customer-btn-inner">
                          <div className="customer-btn-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Explore Project</span>
                          <div className="customer-btn-arrow">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M7 17l10-10M17 7H7m10 0v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div className="customer-btn-glow"></div>
                        <div className="customer-btn-ripple-effect"></div>
                      </button>

                      <div className="customer-project-stats">
                        <div className="customer-stat-indicator">
                          <div className="customer-indicator-dot customer-pulse"></div>
                          <span>Live</span>
                        </div>
                        <div className="customer-stat-line"></div>
                      </div>
                    </div>
                  </div>

                  <div className="customer-project-number">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
