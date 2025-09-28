import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "./Layout";
import { fetchBlogs } from "../utils/customerApi";
import "./Blogs.css";

const Blogs = () => {
  const navigate = useNavigate();
  const { companyData } = useCompany();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch blogs from API
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const result = await fetchBlogs();

        if (result.data) {
          setBlogs(result.data);
          setFilteredBlogs(result.data);
        } else {
          setError("No blogs data received");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Filter blogs based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.created_by.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReadMore = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const formatDate = (dateString) => {
    try {
      // Assuming the date format is DD-MM-YY
      const [day, month, year] = dateString.split('-');
      const fullYear = year.length === 2 ? `20${year}` : year;
      const date = new Date(`${fullYear}-${month}-${day}`);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  if (!companyData) {
    return (
      <div className="customer-blogs-loading-container">
        <div className="customer-blogs-loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="customer-customer-blogs-page">

      {/* Hero Section */}
      <div className="customer-blogs-hero">
        <div className="customer-blogs-hero-container">
          <h1 className="customer-blogs-hero-title">
            Tech <span className="customer-blogs-highlight">Insights</span> & Stories
          </h1>
          <p className="customer-blogs-hero-subtitle">
            Explore our latest thoughts on technology, development, and innovation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="customer-blogs-main-content">
        <div className="customer-blogs-container">
          {/* Search Section */}
          <div className="customer-blogs-search-section">
            <div className="customer-blogs-search-container">
              <div className="customer-blogs-search-wrapper">
                <svg className="customer-blogs-search-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L15.803 15.803M15.803 15.803A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search blogs by title or author..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="customer-blogs-search-input"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="customer-blogs-loading-section">
              <div className="customer-blogs-loading-spinner"></div>
              <p>Loading blogs...</p>
            </div>
          ) : error ? (
            <div className="customer-blogs-error-section">
              <div className="customer-blogs-error-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button
                className="customer-blogs-retry-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="customer-blogs-empty-section">
              {searchTerm ? (
                <>
                  <div className="customer-blogs-empty-icon">🔍</div>
                  <h3>No blogs found</h3>
                  <p>No blogs match your search criteria. Try different keywords.</p>
                </>
              ) : (
                <>
                  <div className="customer-blogs-empty-icon">📝</div>
                  <h3>No blogs available</h3>
                  <p>We're working on creating amazing content. Check back soon!</p>
                </>
              )}
            </div>
          ) : (
            <div className="customer-blogs-grid">
              {filteredBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="customer-blogs-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="customer-blogs-card-image-container">
                    <img
                      src={blog.thumbnail_image}
                      alt={blog.title}
                      className="customer-blogs-card-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="customer-blogs-card-image-placeholder" style={{ display: 'none' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="customer-blogs-card-content">
                    <div className="customer-blogs-card-header">
                      <h3 className="customer-blogs-card-title">{blog.title}</h3>

                      <div className="customer-blogs-card-meta">
                        <div className="customer-blogs-card-author">
                          <svg className="customer-blogs-author-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          <span>{blog.created_by}</span>
                        </div>

                        <div className="customer-blogs-card-date">
                          <svg className="customer-blogs-date-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                          </svg>
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="customer-blogs-card-footer">
                      <button
                        className="customer-blogs-read-more-btn"
                        onClick={() => handleReadMore(blog.id)}
                      >
                        <span>Read Full Article</span>
                        <svg className="customer-blogs-arrow-icon" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="customer-blogs-card-glow"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
