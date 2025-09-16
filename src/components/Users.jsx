import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  logoutUser,
  getUser,
  apiRequest,
  fetchUserById,
  deleteUserById,
  registerAdmin,
  updateAdmin,
  changeUserPassword,
} from "../utils/auth";
import { buildApiUrl } from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Users.css";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    address: ""
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    password: "",
    password_confirmation: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const userData = getUser();
    setCurrentUser(userData);

    // Fetch current user profile for display name
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

    if (userData) {
      getCurrentUserProfile();
    }

    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toString().includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout API fails, still navigate to login
      navigate("/admin/login");
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      setModalLoading(true);
      setModalError("");
      setShowModal(true);

      const response = await fetchUserById(userId);
      console.log("User details response:", response);

      // Handle response structure
      const userDetails = response.data || response;
      setSelectedUser(userDetails);
    } catch (error) {
      setModalError(error.message || "Failed to load user details");
      console.error("Failed to fetch user details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalError("");
    setModalLoading(false);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchAllUsers();

      console.log("Users API Response:", response);

      // Handle response structure
      let usersData = response.data || response;
      if (Array.isArray(usersData)) {
        setUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        setUsers([]);
        setFilteredUsers([]);
        console.warn("Expected users array, got:", usersData);
      }
    } catch (error) {
      setError(error.message || "Failed to load users");
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteUserById(userToDelete.id);
      
      // Remove the deleted user from the local state
      const updatedUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Close the delete modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      // You could show an error message here
      alert("Failed to delete user: " + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleAddAdmin = () => {
    setShowAddModal(true);
    setAddErrors({});
    setSuccessMessage("");
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone_number: "",
      address: ""
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
    
    if (!addFormData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!addFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!addFormData.password) {
      errors.password = "Password is required";
    } else if (addFormData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (!addFormData.password_confirmation) {
      errors.password_confirmation = "Password confirmation is required";
    } else if (addFormData.password !== addFormData.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }
    
    if (!addFormData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    }
    
    if (!addFormData.address.trim()) {
      errors.address = "Address is required";
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
      
      const result = await registerAdmin(addFormData);
      
      // Show success message
      setSuccessMessage(`Admin "${addFormData.name}" has been successfully created!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      // Refresh the users list
      await loadUsers();
      
      // Close modal and reset form
      handleAddCancel();
      
    } catch (error) {
      console.error("Failed to add admin:", error);
      
      // Handle validation errors from API
      if (error.validationErrors) {
        setAddErrors(error.validationErrors);
      } else {
        setAddErrors({
          general: error.message || "Failed to add admin"
        });
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditAdmin = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || "",
      address: user.address || ""
    });
    setEditErrors({});
    setSuccessMessage("");
    setShowEditModal(true);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditFormData({
      name: "",
      email: "",
      phone_number: "",
      address: ""
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
    
    if (!editFormData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!editFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!editFormData.phone_number.trim()) {
      errors.phone_number = "Phone number is required";
    }
    
    if (!editFormData.address.trim()) {
      errors.address = "Address is required";
    }
    
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    // Validate form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    
    try {
      setEditLoading(true);
      setEditErrors({});
      
      const result = await updateAdmin(editingUser.id, editFormData);
      
      // Show success message
      setSuccessMessage(`Admin "${editFormData.name}" has been successfully updated!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      // Refresh the users list
      await loadUsers();
      
      // Close modal and reset form
      handleEditCancel();
      
    } catch (error) {
      console.error("Failed to update admin:", error);
      
      // Handle validation errors from API
      if (error.validationErrors) {
        setEditErrors(error.validationErrors);
      } else {
        setEditErrors({
          general: error.message || "Failed to update admin"
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangeUserPassword = (user) => {
    setChangingPasswordUser(user);
    setPasswordFormData({
      password: "",
      password_confirmation: ""
    });
    setPasswordErrors({});
    setSuccessMessage("");
    setShowPasswordModal(true);
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setChangingPasswordUser(null);
    setPasswordFormData({
      password: "",
      password_confirmation: ""
    });
    setPasswordErrors({});
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordFormData.password.trim()) {
      errors.password = "New password is required";
    } else if (passwordFormData.password.length < 8) {
      errors.password = "New password must be at least 8 characters";
    }
    
    if (!passwordFormData.password_confirmation.trim()) {
      errors.password_confirmation = "Please confirm the new password";
    } else if (passwordFormData.password !== passwordFormData.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }
    
    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!changingPasswordUser) return;
    
    // Validate form
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordErrors({});
      
      const result = await changeUserPassword(changingPasswordUser.id, passwordFormData);
      
      // Show success message
      setSuccessMessage(`Password for "${changingPasswordUser.name}" has been successfully changed!`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      // Close modal and reset form
      setShowPasswordModal(false);
      setChangingPasswordUser(null);
      setPasswordFormData({
        password: "",
        password_confirmation: ""
      });
      
    } catch (error) {
      console.error("Failed to change user password:", error);
      
      // Handle validation errors from API
      if (error.validationErrors) {
        setPasswordErrors(error.validationErrors);
      } else {
        setPasswordErrors({
          general: error.message || "Failed to change password"
        });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="users-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="users-content">
          <div className="loading-card">
            <div className="spinner"></div>
            <h2>Loading Users...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="users-content">
          <div className="error-state">
            <h2>⚠️ Error Loading Users</h2>
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
    <div className="users-container">
      <Navbar
        onLogout={handleLogout}
        userName={currentUserProfile?.name || "Admin"}
      />

      <main className="users-content">
        <div className="users-header">
          <div className="header-info">
            <h1>Admin Management</h1>
            <p>View and manage all administrator accounts</p>
          </div>
          <div className="header-actions">
            <div className="users-count">
              <span className="count-badge">
                {users.length} {users.length === 1 ? "Admin" : "Admins"}
              </span>
            </div>
            <button onClick={handleAddAdmin} className="add-admin-btn">
              Add Admin
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
              placeholder="Search admins by name, email, phone, address, or ID..."
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
              Found {filteredUsers.length} of {users.length} admins
            </div>
          )}
        </div>

        {users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>No Admins Found</h3>
            <p>There are currently no administrators in the system.</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td className="id-cell">
                        <span className="id-number">{user.id}</span>
                      </td>
                      <td className="name-cell">
                        <span className="user-name">{user.name}</span>
                      </td>
                      <td className="email-cell">
                        <span className="email-text">{user.email}</span>
                      </td>
                      <td className="phone-cell">
                        <span className="phone-text">
                          {user.phone_number || "Not provided"}
                        </span>
                      </td>
                      <td className="address-cell">
                        <span className="address-text">
                          {user.address || "Not provided"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleViewDetails(user.id)}
                          className="action-btn view-btn"
                          title={`View details for ${user.name}`}
                        >
                          ℹ️
                        </button>
                        <button
                          onClick={() => handleEditAdmin(user)}
                          className="action-btn edit-btn"
                          title={`Edit ${user.name}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleChangeUserPassword(user)}
                          className="action-btn password-btn"
                          title={`Change password for ${user.name}`}
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="action-btn delete-btn"
                          title={`Delete ${user.name}`}
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

      {/* Admin Details Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Details</h2>
              <button onClick={closeModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {modalLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Loading admin details...</p>
                </div>
              ) : modalError ? (
                <div className="modal-error">
                  <h3>⚠️ Error</h3>
                  <p>{modalError}</p>
                  <button onClick={closeModal} className="error-close-btn">
                    Close
                  </button>
                </div>
              ) : selectedUser ? (
                <div className="admin-details">
                  <div className="detail-header">
                    <div className="detail-title">
                      <h3>{selectedUser.name}</h3>
                      <span className="detail-badge">Administrator</span>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">🆔</span>
                        Admin ID
                      </div>
                      <div className="detail-value">{selectedUser.id}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        Full Name
                      </div>
                      <div className="detail-value">{selectedUser.name}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">📧</span>
                        Email Address
                      </div>
                      <div className="detail-value">{selectedUser.email}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <span className="detail-icon">📱</span>
                        Phone Number
                      </div>
                      <div className="detail-value">
                        {selectedUser.phone_number || "Not provided"}
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <div className="detail-label">
                        <span className="detail-icon">📍</span>
                        Address
                      </div>
                      <div className="detail-value">
                        {selectedUser.address || "Not provided"}
                      </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
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
                  <h3>Are you sure you want to delete this admin?</h3>
                  <p>
                    You are about to permanently delete <strong>{userToDelete.name}</strong> (ID: {userToDelete.id}).
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

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-admin-modal">
            <div className="modal-header">
              <h2>Add New Admin</h2>
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
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddFormChange}
                      placeholder="Enter full name"
                      className={addErrors.name ? 'error' : ''}
                    />
                    {addErrors.name && Array.isArray(addErrors.name) ? (
                      <span className="form-error">{addErrors.name[0]}</span>
                    ) : addErrors.name ? (
                      <span className="form-error">{addErrors.name}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={addFormData.email}
                      onChange={handleAddFormChange}
                      placeholder="Enter email address"
                      className={addErrors.email ? 'error' : ''}
                    />
                    {addErrors.email && Array.isArray(addErrors.email) ? (
                      <span className="form-error">{addErrors.email[0]}</span>
                    ) : addErrors.email ? (
                      <span className="form-error">{addErrors.email}</span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={addFormData.password}
                      onChange={handleAddFormChange}
                      placeholder="Enter password"
                      className={addErrors.password ? 'error' : ''}
                    />
                    {addErrors.password && Array.isArray(addErrors.password) ? (
                      <span className="form-error">{addErrors.password[0]}</span>
                    ) : addErrors.password ? (
                      <span className="form-error">{addErrors.password}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password_confirmation">Confirm Password *</label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={addFormData.password_confirmation}
                      onChange={handleAddFormChange}
                      placeholder="Confirm password"
                      className={addErrors.password_confirmation ? 'error' : ''}
                    />
                    {addErrors.password_confirmation && Array.isArray(addErrors.password_confirmation) ? (
                      <span className="form-error">{addErrors.password_confirmation[0]}</span>
                    ) : addErrors.password_confirmation ? (
                      <span className="form-error">{addErrors.password_confirmation}</span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone_number">Phone Number *</label>
                    <input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      value={addFormData.phone_number}
                      onChange={handleAddFormChange}
                      placeholder="Enter phone number"
                      className={addErrors.phone_number ? 'error' : ''}
                    />
                    {addErrors.phone_number && Array.isArray(addErrors.phone_number) ? (
                      <span className="form-error">{addErrors.phone_number[0]}</span>
                    ) : addErrors.phone_number ? (
                      <span className="form-error">{addErrors.phone_number}</span>
                    ) : null}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={addFormData.address}
                      onChange={handleAddFormChange}
                      placeholder="Enter address"
                      className={addErrors.address ? 'error' : ''}
                    />
                    {addErrors.address && Array.isArray(addErrors.address) ? (
                      <span className="form-error">{addErrors.address[0]}</span>
                    ) : addErrors.address ? (
                      <span className="form-error">{addErrors.address}</span>
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
                {addLoading ? "Adding..." : "Add Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content add-admin-modal">
            <div className="modal-header">
              <h2>Edit Admin</h2>
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
                    <label htmlFor="edit-name">Full Name *</label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      placeholder="Enter full name"
                      className={editErrors.name ? 'error' : ''}
                    />
                    {editErrors.name && Array.isArray(editErrors.name) ? (
                      <span className="form-error">{editErrors.name[0]}</span>
                    ) : editErrors.name ? (
                      <span className="form-error">{editErrors.name}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-email">Email Address *</label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      placeholder="Enter email address"
                      className={editErrors.email ? 'error' : ''}
                    />
                    {editErrors.email && Array.isArray(editErrors.email) ? (
                      <span className="form-error">{editErrors.email[0]}</span>
                    ) : editErrors.email ? (
                      <span className="form-error">{editErrors.email}</span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-phone_number">Phone Number *</label>
                    <input
                      type="text"
                      id="edit-phone_number"
                      name="phone_number"
                      value={editFormData.phone_number}
                      onChange={handleEditFormChange}
                      placeholder="Enter phone number"
                      className={editErrors.phone_number ? 'error' : ''}
                    />
                    {editErrors.phone_number && Array.isArray(editErrors.phone_number) ? (
                      <span className="form-error">{editErrors.phone_number[0]}</span>
                    ) : editErrors.phone_number ? (
                      <span className="form-error">{editErrors.phone_number}</span>
                    ) : null}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="edit-address">Address *</label>
                    <input
                      type="text"
                      id="edit-address"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      placeholder="Enter address"
                      className={editErrors.address ? 'error' : ''}
                    />
                    {editErrors.address && Array.isArray(editErrors.address) ? (
                      <span className="form-error">{editErrors.address[0]}</span>
                    ) : editErrors.address ? (
                      <span className="form-error">{editErrors.address}</span>
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
                className="confirm-add-btn"
                disabled={editLoading}
                type="submit"
              >
                {editLoading ? "Updating..." : "Update Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change User Password Modal */}
      {showPasswordModal && changingPasswordUser && (
        <div className="modal-overlay">
          <div className="modal-content password-modal">
            <div className="modal-header">
              <h2>Change Password for {changingPasswordUser.name}</h2>
              <button onClick={handleCancelPasswordChange} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {passwordErrors.general && (
                <div className="form-error general-error">
                  {passwordErrors.general}
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit} className="change-password-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="user-password">New Password *</label>
                    <input
                      type="password"
                      id="user-password"
                      name="password"
                      value={passwordFormData.password}
                      onChange={handlePasswordFormChange}
                      placeholder="Enter new password (min 8 characters)"
                      className={passwordErrors.password ? 'error' : ''}
                    />
                    {passwordErrors.password && Array.isArray(passwordErrors.password) ? (
                      <span className="form-error">{passwordErrors.password[0]}</span>
                    ) : passwordErrors.password ? (
                      <span className="form-error">{passwordErrors.password}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="user-password-confirmation">Confirm New Password *</label>
                    <input
                      type="password"
                      id="user-password-confirmation"
                      name="password_confirmation"
                      value={passwordFormData.password_confirmation}
                      onChange={handlePasswordFormChange}
                      placeholder="Confirm new password"
                      className={passwordErrors.password_confirmation ? 'error' : ''}
                    />
                    {passwordErrors.password_confirmation && Array.isArray(passwordErrors.password_confirmation) ? (
                      <span className="form-error">{passwordErrors.password_confirmation[0]}</span>
                    ) : passwordErrors.password_confirmation ? (
                      <span className="form-error">{passwordErrors.password_confirmation}</span>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                onClick={handleCancelPasswordChange} 
                className="cancel-btn"
                disabled={passwordLoading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                onClick={handlePasswordSubmit} 
                className="confirm-add-btn"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Users;
