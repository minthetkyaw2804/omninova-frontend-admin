import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  logoutUser,
  fetchBlogs,
  fetchBlogById,
  createBlog,
  updateBlog,
  addBlogImages,
  deleteBlogImage,
  deleteBlogById,
  apiRequest,
} from "../utils/auth";
import { buildApiUrl } from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Blogs.css";

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogLoading, setBlogLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    content: "",
    images: [],
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [showAddImagesModal, setShowAddImagesModal] = useState(false);
  const [blogToAddImages, setBlogToAddImages] = useState(null);
  const [addImagesData, setAddImagesData] = useState([]);
  const [addImagesLoading, setAddImagesLoading] = useState(false);
  const [addImagesErrors, setAddImagesErrors] = useState({});
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteImageLoading, setDeleteImageLoading] = useState(false);

  useEffect(() => {
    const getCurrentUserProfile = async () => {
      try {
        const response = await apiRequest(buildApiUrl("/api/admin/profile"));
        if (response.ok) {
          const data = await response.json();
          setCurrentUserProfile(data.data);
        }
      } catch {
        console.log("Could not fetch current user profile for navbar");
      }
    };

    const userData = getUser();
    if (userData) {
      getCurrentUserProfile();
    }

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchBlogs();
        setBlogs(response.data || []);
        setFilteredBlogs(response.data || []);
      } catch (error) {
        setError(error.message || "Failed to load blogs");
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  // Filter blogs based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.created_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.updated_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.id.toString().includes(searchTerm)
      );
      setFilteredBlogs(filtered);
    }
  }, [searchTerm, blogs]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/admin/login");
    }
  };

  const handleViewBlog = async (blogId) => {
    try {
      setBlogLoading(true);
      const response = await fetchBlogById(blogId);
      setSelectedBlog(response.data);
      setShowBlogModal(true);
    } catch (error) {
      console.error("Failed to fetch blog details:", error);
      setError("Failed to load blog details");
    } finally {
      setBlogLoading(false);
    }
  };

  const closeBlogModal = () => {
    setShowBlogModal(false);
    setSelectedBlog(null);
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteBlogById(blogToDelete.id);

      // Remove the deleted blog from the local state
      const updatedBlogs = blogs.filter((b) => b.id !== blogToDelete.id);
      setBlogs(updatedBlogs);

      // Close the delete modal
      setShowDeleteModal(false);
      setBlogToDelete(null);

      // Show success message
      setSuccessMessage("Blog deleted successfully!");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error("Failed to delete blog:", error);
      alert("Failed to delete blog: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAddFormData({ title: "", content: "", images: [] });
    setAddFormErrors({});
    setSuccessMessage("");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddFormData({ title: "", content: "", images: [] });
    setAddFormErrors({});
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (addFormErrors[name]) {
      setAddFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate image files
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      setAddFormErrors((prev) => ({
        ...prev,
        images: "Please select only image files",
      }));
      e.target.value = "";
      return;
    }

    setAddFormData((prev) => ({
      ...prev,
      images: files,
    }));

    // Clear error
    if (addFormErrors.images) {
      setAddFormErrors((prev) => ({
        ...prev,
        images: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!addFormData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!addFormData.content.trim()) {
      errors.content = "Content is required";
    }

    if (addFormData.images.length === 0) {
      errors.images = "At least one image is required";
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setAddLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", addFormData.title.trim());
      formData.append("content", addFormData.content.trim());

      // Add all images
      addFormData.images.forEach((image, index) => {
        formData.append("images[]", image);
      });

      await createBlog(formData);

      // Close modal
      closeAddModal();

      // Show success message
      setSuccessMessage("Blog created successfully!");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Reload blogs list
      const response = await fetchBlogs();
      setBlogs(response.data || []);
    } catch (error) {
      console.error("Failed to create blog:", error);

      if (error.validationErrors) {
        setAddFormErrors(error.validationErrors);
      } else {
        setAddFormErrors({
          general: error.message || "Failed to create blog. Please try again.",
        });
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditBlog = (blog) => {
    setBlogToEdit(blog);
    setEditFormData({
      title: blog.title || "",
      content: blog.content || "",
    });
    setEditErrors({});
    setShowEditModal(true);
    setShowBlogModal(false); // Close the details modal
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!editFormData.content.trim()) {
      errors.content = "Content is required";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setEditLoading(true);

    try {
      const data = await updateBlog(blogToEdit.id, {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
      });

      // Close modal
      setShowEditModal(false);
      setBlogToEdit(null);
      setEditFormData({ title: "", content: "" });
      setEditErrors({});

      // Show success message
      setSuccessMessage(data.message || "Blog updated successfully!");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Reload blogs list
      const blogsResponse = await fetchBlogs();
      setBlogs(blogsResponse.data || []);
    } catch (error) {
      console.error("Failed to update blog:", error);

      if (error.validationErrors) {
        setEditErrors(error.validationErrors);
      } else {
        setEditErrors({
          general: error.message || "Failed to update blog. Please try again.",
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setBlogToEdit(null);
    setEditFormData({ title: "", content: "" });
    setEditErrors({});
    // Go back to blog details instead of main list
    if (selectedBlog) {
      setShowBlogModal(true);
    }
  };

  const handleAddImages = (blog) => {
    setBlogToAddImages(blog);
    setAddImagesData([]);
    setAddImagesErrors({});
    setShowAddImagesModal(true);
    setShowBlogModal(false); // Close the details modal
  };

  const handleAddImagesChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate image files
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      setAddImagesErrors({
        images: "Please select only image files",
      });
      e.target.value = "";
      return;
    }

    setAddImagesData(files);

    // Clear error
    if (addImagesErrors.images) {
      setAddImagesErrors({});
    }
  };

  const validateAddImagesForm = () => {
    const errors = {};

    if (addImagesData.length === 0) {
      errors.images = "At least one image is required";
    }

    setAddImagesErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddImagesSubmit = async (e) => {
    e.preventDefault();

    if (!validateAddImagesForm()) {
      return;
    }

    setAddImagesLoading(true);

    try {
      const data = await addBlogImages(blogToAddImages.id, addImagesData);

      // Close modal
      setShowAddImagesModal(false);
      setBlogToAddImages(null);
      setAddImagesData([]);
      setAddImagesErrors({});

      // Show success message
      setSuccessMessage(data.message || "Images added successfully!");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Reload blog details if we have a selected blog
      if (selectedBlog && selectedBlog.id === blogToAddImages.id) {
        const updatedBlog = await fetchBlogById(blogToAddImages.id);
        setSelectedBlog(updatedBlog.data);
      }

      // Reload blogs list
      const blogsResponse = await fetchBlogs();
      setBlogs(blogsResponse.data || []);
    } catch (error) {
      console.error("Failed to add images:", error);

      if (error.validationErrors) {
        setAddImagesErrors(error.validationErrors);
      } else {
        setAddImagesErrors({
          general: error.message || "Failed to add images. Please try again.",
        });
      }
    } finally {
      setAddImagesLoading(false);
    }
  };

  const closeAddImagesModal = () => {
    setShowAddImagesModal(false);
    setBlogToAddImages(null);
    setAddImagesData([]);
    setAddImagesErrors({});
    // Go back to blog details instead of main list
    if (selectedBlog) {
      setShowBlogModal(true);
    }
  };

  const handleDeleteImageClick = (image) => {
    setImageToDelete(image);
    setShowDeleteImageModal(true);
  };

  const handleDeleteImageConfirm = async () => {
    if (!imageToDelete) return;

    try {
      setDeleteImageLoading(true);
      const data = await deleteBlogImage(imageToDelete.id);

      // Close the delete modal
      setShowDeleteImageModal(false);
      setImageToDelete(null);

      // Show success message
      setSuccessMessage(data.message || "Image deleted successfully!");

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Reload blog details if we have a selected blog
      if (selectedBlog) {
        const updatedBlog = await fetchBlogById(selectedBlog.id);
        setSelectedBlog(updatedBlog.data);
      }

      // Reload blogs list
      const blogsResponse = await fetchBlogs();
      setBlogs(blogsResponse.data || []);
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image: " + error.message);
    } finally {
      setDeleteImageLoading(false);
    }
  };

  const handleDeleteImageCancel = () => {
    setShowDeleteImageModal(false);
    setImageToDelete(null);
  };

  const renderContent = (content) => {
    if (!content) return "No content available";

    // Basic content rendering - you can enhance this for markdown/HTML
    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    return (
      <div className="blog-content">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="blog-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="blogs-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="blogs-content">
          <div className="loading-card">
            <div className="spinner"></div>
            <h2>Loading Blogs...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="blogs-content">
          <div className="error-state">
            <h2>⚠️ Error Loading Blogs</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="blogs-container">
      <Navbar
        onLogout={handleLogout}
        userName={currentUserProfile?.name || "Admin"}
      />

      <main className="blogs-content">
        <div className="blogs-header">
          <div className="header-info">
            <h1>Blog Management</h1>
            <p>Manage and view all blog posts</p>
          </div>
          <div className="header-actions">
            <div className="blogs-count">
              <span className="count-badge">
                {blogs.length} {blogs.length === 1 ? "Blog" : "Blogs"}
              </span>
            </div>
            <button onClick={openAddModal} className="add-blog-btn">
              Add New Blog
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span className="success-text">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="success-close-btn"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="table-controls">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search blogs by title, content, author, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-search"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="search-results">
              Found {filteredBlogs.length} of {blogs.length} blogs
            </div>
          )}
        </div>

        {blogs.length === 0 ? (
          <div className="no-blogs-state">
            <div className="no-blogs-icon">📝</div>
            <h3>No Blogs Found</h3>
            <p>There are no blog posts available at the moment.</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="blogs-table">
                <thead>
                  <tr>
                    <th className="id-cell">ID</th>
                    <th>Title</th>
                    <th>Content</th>
                    <th>Created By</th>
                    <th>Created Date</th>
                    <th>Updated By</th>
                    <th>Updated Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog, index) => (
                    <tr
                      key={blog.id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td className="id-cell">
                        <span className="id-number">#{blog.id}</span>
                      </td>
                      <td className="title-cell">
                        <span className="blog-title">{blog.title}</span>
                      </td>
                      <td className="content-cell">
                        {blog.content
                          ? blog.content.split(" ").length > 4
                            ? blog.content.split(" ").slice(0, 4).join(" ") +
                              "..."
                            : blog.content
                          : "No content"}
                      </td>
                      <td className="created-by-cell">
                        <span className="created-by-text">
                          {blog.created_by}
                        </span>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">{blog.created_at}</span>
                      </td>
                      <td className="updated-by-cell">
                        <span className="updated-by-text">
                          {blog.updated_by}
                        </span>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">{blog.updated_at}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleViewBlog(blog.id)}
                          className="action-btn view-btn"
                          disabled={blogLoading}
                          title="View Details"
                        >
                          ℹ️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(blog)}
                          className="action-btn delete-btn"
                          title={`Delete ${blog.title}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Blog Detail Modal */}
      {showBlogModal && selectedBlog && (
        <div className="modal-overlay">
          <div
            className="modal-content blog-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Blog Details</h2>
              <button onClick={closeBlogModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {blogLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Loading blog details...</p>
                </div>
              ) : selectedBlog ? (
                <div className="blog-details">
                  <div className="detail-header">
                    <div className="detail-avatar">
                      <span className="avatar-icon">📝</span>
                    </div>
                    <div className="detail-title">
                      <h3>{selectedBlog.title}</h3>
                      <div className="detail-badges">
                        <span className="detail-badge id-badge">
                          ID: {selectedBlog.id}
                        </span>
                        <span className="detail-badge">Blog Post</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-grid">
                    {/* Title and Content Combined */}
                    <div className="detail-item full-width title-content-card">
                      <div className="card-header">
                        <h3 className="card-title">Blog Information</h3>
                        <button
                          onClick={() => handleEditBlog(selectedBlog)}
                          className="edit-blog-btn"
                          title="Edit Blog"
                        >
                          Edit Details
                        </button>
                      </div>
                      <div className="title-content-info">
                        <div className="title-section">
                          <span className="content-label">Title:</span>
                          <div className="title-text">{selectedBlog.title}</div>
                        </div>

                        <div className="content-section">
                          <span className="content-label">Content:</span>
                          <div className="content-text">
                            {selectedBlog.content || "No content available"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <div className="detail-label">
                        <span className="detail-icon">🖼️</span>
                        Images{" "}
                        {selectedBlog.images && selectedBlog.images.length > 0
                          ? `(${selectedBlog.images.length})`
                          : "(0)"}
                        <button
                          onClick={() => handleAddImages(selectedBlog)}
                          className="add-images-btn"
                          title="Add Images"
                        >
                          Add Images
                        </button>
                      </div>
                      <div className="detail-value">
                        {selectedBlog.images &&
                        selectedBlog.images.length > 0 ? (
                          <div className="images-gallery">
                            {selectedBlog.images.map((image) => (
                              <div key={image.id} className="gallery-item">
                                <div className="image-container">
                                  <img
                                    src={image.image_url}
                                    alt={image.image_name}
                                    className="gallery-image"
                                  />
                                  <button
                                    onClick={() =>
                                      handleDeleteImageClick(image)
                                    }
                                    className="delete-image-btn"
                                    title="Delete Image"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <p className="gallery-image-name">
                                  {image.image_name}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-images-text">No images available</p>
                        )}
                      </div>
                    </div>

                    {/* Dashboard Info Card - Bottom */}
                    <div className="detail-item full-width dashboard-info-card">
                      <div className="dashboard-grid">
                        <div className="dashboard-stat">
                          <div className="stat-header">
                            <span className="stat-label">Created</span>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">
                              {selectedBlog.created_by}
                            </div>
                            <div className="stat-meta">
                              {selectedBlog.created_at}
                            </div>
                          </div>
                        </div>

                        <div className="dashboard-stat">
                          <div className="stat-header">
                            <span className="stat-label">Last Updated</span>
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">
                              {selectedBlog.updated_by}
                            </div>
                            <div className="stat-meta">
                              {selectedBlog.updated_at}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button onClick={closeBlogModal} className="close-modal-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={handleDeleteCancel} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <span>⚠️</span>
                </div>
                <div className="delete-message">
                  <h3>Are you sure you want to delete this blog?</h3>
                  <p>
                    You are about to permanently delete{" "}
                    <strong>{blogToDelete.title}</strong> (ID: {blogToDelete.id}
                    ).
                  </p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleDeleteCancel}
                className="cancel-btn"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="confirm-delete-btn"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Blog Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div
            className="modal-content add-blog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add New Blog</h2>
              <button onClick={closeAddModal} className="modal-close">
                ×
              </button>
            </div>

            <form onSubmit={handleAddBlog}>
              <div className="modal-body">
                {addFormErrors.general && (
                  <div className="form-error general-error">
                    {addFormErrors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="title">Blog Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={addFormData.title}
                    onChange={handleAddFormChange}
                    className={addFormErrors.title ? "error" : ""}
                    placeholder="Enter blog title"
                    maxLength="255"
                  />
                  {addFormErrors.title && (
                    <span className="form-error">{addFormErrors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="content">Blog Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={addFormData.content}
                    onChange={handleAddFormChange}
                    className={addFormErrors.content ? "error" : ""}
                    placeholder="Enter blog content"
                    rows="8"
                  />
                  {addFormErrors.content && (
                    <span className="form-error">{addFormErrors.content}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="images">Blog Images</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="images"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className={addFormErrors.images ? "error" : ""}
                    />
                    <div className="file-upload-info">
                      <p>Select multiple image files (JPG, PNG, GIF, etc.)</p>
                      {addFormData.images.length > 0 && (
                        <p className="selected-files">
                          {addFormData.images.length} file
                          {addFormData.images.length > 1 ? "s" : ""} selected
                        </p>
                      )}
                    </div>
                  </div>
                  {addFormErrors.images && (
                    <span className="form-error">{addFormErrors.images}</span>
                  )}
                </div>

                {addFormData.images.length > 0 && (
                  <div className="image-preview-section">
                    <h4>Selected Images:</h4>
                    <div className="image-preview-grid">
                      {Array.from(addFormData.images).map((file, index) => (
                        <div key={index} className="preview-item">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="preview-thumbnail"
                          />
                          <p className="preview-name">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="btn-secondary"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addLoading}
                >
                  {addLoading ? "Creating..." : "Create Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {showEditModal && blogToEdit && (
        <div className="modal-overlay">
          <div
            className="modal-content edit-blog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Blog</h2>
              <button onClick={closeEditModal} className="modal-close">
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {editErrors.general && (
                  <div className="form-error general-error">
                    {editErrors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="edit_title">Blog Title *</label>
                  <input
                    type="text"
                    id="edit_title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    className={editErrors.title ? "error" : ""}
                    placeholder="Enter blog title"
                    maxLength="255"
                  />
                  {editErrors.title && (
                    <span className="form-error">{editErrors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit_content">Blog Content *</label>
                  <textarea
                    id="edit_content"
                    name="content"
                    value={editFormData.content}
                    onChange={handleEditFormChange}
                    className={editErrors.content ? "error" : ""}
                    placeholder="Enter blog content"
                    rows="8"
                  />
                  {editErrors.content && (
                    <span className="form-error">{editErrors.content}</span>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-secondary"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? "Updating..." : "Update Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Images Modal */}
      {showAddImagesModal && blogToAddImages && (
        <div className="modal-overlay">
          <div
            className="modal-content add-images-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add Images to Blog</h2>
              <button onClick={closeAddImagesModal} className="modal-close">
                ×
              </button>
            </div>

            <form onSubmit={handleAddImagesSubmit}>
              <div className="modal-body">
                <div className="blog-info">
                  <h4>Blog: {blogToAddImages.title}</h4>
                  <p>ID: {blogToAddImages.id}</p>
                </div>

                {addImagesErrors.general && (
                  <div className="form-error general-error">
                    {addImagesErrors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="blog_images">Select Images *</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="blog_images"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleAddImagesChange}
                      className={addImagesErrors.images ? "error" : ""}
                    />
                    <div className="file-upload-info">
                      <p>Select multiple image files (JPG, PNG, GIF, etc.)</p>
                      {addImagesData.length > 0 && (
                        <p className="selected-files">
                          {addImagesData.length} file
                          {addImagesData.length > 1 ? "s" : ""} selected
                        </p>
                      )}
                    </div>
                  </div>
                  {addImagesErrors.images && (
                    <span className="form-error">{addImagesErrors.images}</span>
                  )}
                </div>

                {addImagesData.length > 0 && (
                  <div className="image-preview-section">
                    <h4>Selected Images:</h4>
                    <div className="image-preview-grid">
                      {Array.from(addImagesData).map((file, index) => (
                        <div key={index} className="preview-item">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="preview-thumbnail"
                          />
                          <p className="preview-name">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeAddImagesModal}
                  className="btn-secondary"
                  disabled={addImagesLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addImagesLoading}
                >
                  {addImagesLoading ? "Adding Images..." : "Add Images"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation Modal */}
      {showDeleteImageModal && imageToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete Image</h2>
              <button
                onClick={handleDeleteImageCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <span>🖼️</span>
                </div>
                <div className="delete-message">
                  <h3>Are you sure you want to delete this image?</h3>
                  <p>
                    You are about to permanently delete{" "}
                    <strong>{imageToDelete.image_name}</strong>.
                  </p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleDeleteImageCancel}
                className="cancel-btn"
                disabled={deleteImageLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteImageConfirm}
                className="confirm-delete-btn"
                disabled={deleteImageLoading}
              >
                {deleteImageLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Blogs;
