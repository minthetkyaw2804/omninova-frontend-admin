import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  logoutUser,
  fetchProjectTypes,
  fetchProjectTypeById,
  createProjectType,
  updateProjectType,
  deleteProjectType,
  apiRequest,
} from "../utils/auth";
import { buildApiUrl } from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./ProjectTypes.css";

const ProjectTypes = () => {
  const navigate = useNavigate();
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjectTypes, setFilteredProjectTypes] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    type_name: "",
    description: ""
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectTypeToDelete, setProjectTypeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectTypeToEdit, setProjectTypeToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    type_name: "",
    description: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    const getCurrentUserProfile = async () => {
      try {
        const response = await apiRequest(buildApiUrl("/api/admin/profile"));
        if (response.ok) {
          const data = await response.json();
          setCurrentUserProfile(data.data);
        }
      } catch (error) {
        console.log("Could not fetch current user profile for navbar");
      }
    };

    const userData = getUser();
    if (userData) {
      getCurrentUserProfile();
    }

    loadProjectTypes();
  }, []);

  // Filter project types based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjectTypes(projectTypes);
    } else {
      const filtered = projectTypes.filter(
        (projectType) =>
          projectType.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projectType.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projectType.created_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projectType.updated_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projectType.id.toString().includes(searchTerm)
      );
      setFilteredProjectTypes(filtered);
    }
  }, [searchTerm, projectTypes]);

  const loadProjectTypes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchProjectTypes();

      console.log("Project Types API Response:", response);

      // Handle response structure
      let projectTypesData = response.data || response;
      if (Array.isArray(projectTypesData)) {
        setProjectTypes(projectTypesData);
        setFilteredProjectTypes(projectTypesData);
      } else {
        setProjectTypes([]);
        setFilteredProjectTypes([]);
        console.warn("Expected project types array, got:", projectTypesData);
      }
    } catch (error) {
      setError(error.message || "Failed to load project types");
      console.error("Failed to fetch project types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/admin/login");
    }
  };

  const handleViewDetails = async (projectTypeId) => {
    try {
      setModalLoading(true);
      setModalError("");
      setShowModal(true);

      const response = await fetchProjectTypeById(projectTypeId);
      console.log("Project Type details response:", response);

      // Handle response structure
      const projectTypeDetails = response.data || response;
      setSelectedProjectType(projectTypeDetails);
    } catch (error) {
      setModalError(error.message || "Failed to load project type details");
      console.error("Failed to fetch project type details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProjectType(null);
    setModalError("");
    setModalLoading(false);
  };

  const handleAddProjectType = () => {
    setShowAddModal(true);
    setAddFormData({
      type_name: "",
      description: ""
    });
    setAddErrors({});
    setSuccessMessage("");
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddFormData({
      type_name: "",
      description: ""
    });
    setAddErrors({});
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (addErrors[name]) {
      setAddErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!addFormData.type_name.trim()) {
      errors.type_name = "Type name is required";
    }

    if (!addFormData.description.trim()) {
      errors.description = "Description is required";
    }

    return errors;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    try {
      setAddLoading(true);
      setAddErrors({});

      const result = await createProjectType(addFormData);

      // Show success message
      setSuccessMessage(`Project type "${addFormData.type_name}" has been successfully created!`);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project types list
      await loadProjectTypes();

      // Close modal and reset form
      handleAddCancel();

    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setAddErrors(error.validationErrors);
      } else {
        setAddErrors({
          general: error.message || "Failed to add project type"
        });
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteClick = (projectType) => {
    setProjectTypeToDelete(projectType);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectTypeToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteProjectType(projectTypeToDelete.id);

      // Remove the deleted project type from the local state
      const updatedProjectTypes = projectTypes.filter(pt => pt.id !== projectTypeToDelete.id);
      setProjectTypes(updatedProjectTypes);

      // Close the delete modal
      setShowDeleteModal(false);
      setProjectTypeToDelete(null);

      // Show success message
      setSuccessMessage(`Project type "${projectTypeToDelete.type_name}" deleted successfully!`);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      alert("Failed to delete project type: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProjectTypeToDelete(null);
  };

  const handleEditClick = (projectType) => {
    setProjectTypeToEdit(projectType);
    setEditFormData({
      type_name: projectType.type_name || "",
      description: projectType.description || ""
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setProjectTypeToEdit(null);
    setEditFormData({
      type_name: "",
      description: ""
    });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.type_name.trim()) {
      errors.type_name = "Type name is required";
    }

    if (!editFormData.description.trim()) {
      errors.description = "Description is required";
    }

    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      setEditErrors({});

      const result = await updateProjectType(projectTypeToEdit.id, editFormData);

      // Show success message
      setSuccessMessage(`Project type "${editFormData.type_name}" updated successfully!`);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project types list
      await loadProjectTypes();

      // Close modal and reset form
      handleEditCancel();

    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setEditErrors(error.validationErrors);
      } else {
        setEditErrors({
          general: error.message || "Failed to update project type"
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-types-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="project-types-content">
          <div className="loading-card">
            <div className="spinner"></div>
            <h2>Loading Project Types...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-types-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="project-types-content">
          <div className="error-state">
            <h2>⚠️ Error Loading Project Types</h2>
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
    <div className="project-types-container">
      <Navbar
        onLogout={handleLogout}
        userName={currentUserProfile?.name || "Admin"}
      />

      <main className="project-types-content">
        <div className="project-types-header">
          <div className="header-info">
            <h1>Project Types Management</h1>
            <p>View and manage all project types</p>
          </div>
          <div className="header-actions">
            <div className="project-types-count">
              <span className="count-badge">
                {projectTypes.length} {projectTypes.length === 1 ? "Type" : "Types"}
              </span>
            </div>
            <button onClick={handleAddProjectType} className="add-project-type-btn">
              Add Project Type
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
              placeholder="Search project types by name, description, creator, or ID..."
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
              Found {filteredProjectTypes.length} of {projectTypes.length} project types
            </div>
          )}
        </div>

        {projectTypes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <h3>No Project Types Found</h3>
            <p>There are currently no project types in the system.</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="project-types-table">
                <thead>
                  <tr>
                    <th className="id-cell">ID</th>
                    <th>Type Name</th>
                    <th>Description</th>
                    <th>Created By</th>
                    <th>Created Date</th>
                    <th>Updated By</th>
                    <th>Updated Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjectTypes.map((projectType, index) => (
                    <tr
                      key={projectType.id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td className="id-cell">
                        <span className="id-number">{projectType.id}</span>
                      </td>
                      <td className="name-cell">
                        <span className="type-name">{projectType.type_name}</span>
                      </td>
                      <td className="description-cell">
                        <span className="description-text">
                          {projectType.description || "No description"}
                        </span>
                      </td>
                      <td className="created-by-cell">
                        <span className="created-by-text">{projectType.created_by}</span>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">{projectType.created_at}</span>
                      </td>
                      <td className="updated-by-cell">
                        <span className="updated-by-text">{projectType.updated_by}</span>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">{projectType.updated_at}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleViewDetails(projectType.id)}
                          className="action-btn view-btn"
                          title={`View details for ${projectType.type_name}`}
                        >
                          ℹ️
                        </button>
                        <button
                          onClick={() => handleEditClick(projectType)}
                          className="action-btn edit-btn"
                          title={`Edit ${projectType.type_name}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(projectType)}
                          className="action-btn delete-btn"
                          title={`Delete ${projectType.type_name}`}
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

      {/* Project Type Details Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Project Type Details</h2>
              <button onClick={closeModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {modalLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Loading project type details...</p>
                </div>
              ) : modalError ? (
                <div className="modal-error">
                  <h3>⚠️ Error</h3>
                  <p>{modalError}</p>
                  <button onClick={closeModal} className="error-close-btn">
                    Close
                  </button>
                </div>
              ) : selectedProjectType ? (
                <div className="project-type-details">
                  <div className="detail-header">
                    <div className="detail-title">
                      <h3>{selectedProjectType.type_name}</h3>
                      <span className="detail-badge">Project Type</span>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">🆔</span>
                        Type ID
                      </div>
                      <div className="detail-value">{selectedProjectType.id}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        Type Name
                      </div>
                      <div className="detail-value">{selectedProjectType.type_name}</div>
                    </div>

                    <div className="detail-item full-width">
                      <div className="detail-label">
                        <span className="detail-icon">📝</span>
                        Description
                      </div>
                      <div className="detail-value">
                        {selectedProjectType.description || "No description provided"}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">👤</span>
                        Created By
                      </div>
                      <div className="detail-value">{selectedProjectType.created_by}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">📅</span>
                        Created Date
                      </div>
                      <div className="detail-value">{selectedProjectType.created_at}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">✏️</span>
                        Updated By
                      </div>
                      <div className="detail-value">{selectedProjectType.updated_by}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">🔄</span>
                        Updated Date
                      </div>
                      <div className="detail-value">{selectedProjectType.updated_at}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {!modalLoading && !modalError && (
              <div className="modal-footer">
                <button onClick={closeModal} className="close-modal-btn">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Project Type Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-admin-modal">
            <div className="modal-header">
              <h2>Add New Project Type</h2>
              <button onClick={handleAddCancel} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {addErrors.general && (
                <div className="form-error general-error">
                  {addErrors.general}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="add-admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type_name">Type Name *</label>
                    <input
                      type="text"
                      id="type_name"
                      name="type_name"
                      value={addFormData.type_name}
                      onChange={handleAddFormChange}
                      placeholder="Enter project type name"
                      className={addErrors.type_name ? 'error' : ''}
                    />
                    {addErrors.type_name && Array.isArray(addErrors.type_name) ? (
                      <span className="form-error">{addErrors.type_name[0]}</span>
                    ) : addErrors.type_name ? (
                      <span className="form-error">{addErrors.type_name}</span>
                    ) : null}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={addFormData.description}
                      onChange={handleAddFormChange}
                      placeholder="Enter project type description"
                      rows="4"
                      className={addErrors.description ? 'error' : ''}
                    />
                    {addErrors.description && Array.isArray(addErrors.description) ? (
                      <span className="form-error">{addErrors.description[0]}</span>
                    ) : addErrors.description ? (
                      <span className="form-error">{addErrors.description}</span>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleAddCancel}
                className="cancel-btn"
                disabled={addLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="confirm-add-btn"
                disabled={addLoading}
                type="submit"
              >
                {addLoading ? "Adding..." : "Add Project Type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Type Modal */}
      {showEditModal && projectTypeToEdit && (
        <div className="modal-overlay">
          <div className="modal-content add-admin-modal">
            <div className="modal-header">
              <h2>Edit Project Type</h2>
              <button onClick={handleEditCancel} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {editErrors.general && (
                <div className="form-error general-error">
                  {editErrors.general}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="add-admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_type_name">Type Name *</label>
                    <input
                      type="text"
                      id="edit_type_name"
                      name="type_name"
                      value={editFormData.type_name}
                      onChange={handleEditFormChange}
                      placeholder="Enter project type name"
                      className={editErrors.type_name ? 'error' : ''}
                    />
                    {editErrors.type_name && Array.isArray(editErrors.type_name) ? (
                      <span className="form-error">{editErrors.type_name[0]}</span>
                    ) : editErrors.type_name ? (
                      <span className="form-error">{editErrors.type_name}</span>
                    ) : null}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="edit_description">Description *</label>
                    <textarea
                      id="edit_description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      placeholder="Enter project type description"
                      rows="4"
                      className={editErrors.description ? 'error' : ''}
                    />
                    {editErrors.description && Array.isArray(editErrors.description) ? (
                      <span className="form-error">{editErrors.description[0]}</span>
                    ) : editErrors.description ? (
                      <span className="form-error">{editErrors.description}</span>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleEditCancel}
                className="cancel-btn"
                disabled={editLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="confirm-edit-btn"
                disabled={editLoading}
                type="submit"
              >
                {editLoading ? "Updating..." : "Update Project Type"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectTypeToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
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
                  <h3>Are you sure you want to delete this project type?</h3>
                  <p>
                    You are about to permanently delete <strong>{projectTypeToDelete.type_name}</strong> (ID: {projectTypeToDelete.id}).
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

      <Footer />
    </div>
  );
};

export default ProjectTypes;