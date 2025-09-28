import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompany } from "./Layout";
import "./BlogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companyData } = useCompany();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  // Fetch blog details from API
  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://162.84.221.21/api/customer/blogs/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
          setBlog(result.data);
        } else {
          setError("Blog not found");
        }
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError("Failed to load blog details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetails();
    }
  }, [id]);

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

  const handleBackClick = () => {
    navigate('/blogs');
  };

  const nextImage = () => {
    if (blog && blog.images && blog.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === blog.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (blog && blog.images && blog.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? blog.images.length - 1 : prev - 1
      );
    }
  };

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!companyData) {
    return (
      <div className="blog-details-loading-container">
        <div className="blog-details-loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="blog-details-loading-container">
        <div className="blog-details-loading-spinner"></div>
        <p>Loading blog details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-details-page">
        <div className="blog-details-error-container">
          <div className="blog-details-error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="blog-details-error-actions">
            <button
              className="blog-details-retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button
              className="blog-details-back-btn"
              onClick={handleBackClick}
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-details-page">
        <div className="blog-details-error-container">
          <div className="blog-details-error-icon">📝</div>
          <h2>Blog not found</h2>
          <p>The blog you're looking for doesn't exist or has been removed.</p>
          <button
            className="blog-details-back-btn"
            onClick={handleBackClick}
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-details-page">
      {/* Hero Section */}
      <div className="blog-details-hero">
        <div className="blog-details-hero-container">
          <button
            className="blog-details-back-button"
            onClick={handleBackClick}
            aria-label="Back to blogs"
          >
            <svg className="blog-details-back-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back to Blogs</span>
          </button>

          <div className="blog-details-hero-content">
            <h1 className="blog-details-hero-title">
              {blog.title}
            </h1>

            <div className="blog-details-hero-meta">
              <div className="blog-details-hero-author">
                <svg className="blog-details-author-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>By {blog.created_by}</span>
              </div>

              <div className="blog-details-hero-date">
                <svg className="blog-details-date-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                <span>Published {formatDate(blog.created_at)}</span>
              </div>

              {blog.updated_at !== blog.created_at && (
                <div className="blog-details-hero-updated">
                  <svg className="blog-details-updated-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                  </svg>
                  <span>Updated {formatDate(blog.updated_at)} by {blog.updated_by}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="blog-details-main-content">
        <div className="blog-details-container">
          <article className="blog-details-article">
            {/* Blog Images Swiper */}
            {blog.images && blog.images.length > 0 && (
              <div className="blog-details-images-section">
                <div className="blog-details-swiper-container">
                  <div className="blog-details-swiper-wrapper">
                    <div
                      className="blog-details-swiper-slide"
                      style={{
                        transform: `translateX(-${currentImageIndex * 100}%)`,
                      }}
                    >
                      {blog.images.map((image, index) => (
                        <div key={index} className="blog-details-image-container">
                          <img
                            src={image.image_url}
                            alt={`Blog image ${index + 1}`}
                            className="blog-details-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="blog-details-image-placeholder" style={{ display: 'none' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                            <span>Image unavailable</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation arrows - only show if more than 1 image */}
                  {blog.images.length > 1 && (
                    <>
                      <button
                        className="blog-details-swiper-button blog-details-swiper-button-prev"
                        onClick={prevImage}
                        aria-label="Previous image"
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M15 18L9 12L15 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className="blog-details-swiper-button blog-details-swiper-button-next"
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {/* Dots indicator */}
                      <div className="blog-details-swiper-pagination">
                        {blog.images.map((_, index) => (
                          <button
                            key={index}
                            className={`blog-details-swiper-dot ${
                              index === currentImageIndex ? 'active' : ''
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Blog Content */}
            <div className="blog-details-content-section">
              <div className="blog-details-content">
                <p>{blog.content}</p>
              </div>
            </div>

            {/* Article Footer */}
            <div className="blog-details-article-footer">
              <div className="blog-details-share">
                <span className="blog-details-share-label">Share this article:</span>
                <button
                  className="blog-details-copy-link-btn"
                  onClick={copyPageLink}
                  aria-label="Copy page link"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Copy Link</span>
                </button>

                {/* Copy success message */}
                {showCopyMessage && (
                  <div className="blog-details-copy-message">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Link copied!</span>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;