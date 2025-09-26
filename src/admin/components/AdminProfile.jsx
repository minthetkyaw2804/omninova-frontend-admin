import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getToken, logoutUser, apiRequest, updateProfile, changePassword } from "../utils/auth";
import { buildApiUrl, API_CONFIG } from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./AdminProfile.css";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const checkAuthentication = () => {
      const token = getToken();
      const userData = getUser();

      if (!token || !userData) {
        setAuthError(
          "You must be logged in to access this page. Please log in first."
        );
        setLoading(false);
        return;
      }

      setUser(userData);
      fetchProfile();
    };

    checkAuthentication();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(buildApiUrl("/api/admin/profile"));

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setAuthError("Your session has expired. Please log in again.");
          // The apiRequest function will already redirect to login for 401 errors
          return;
        } else if (response.status === 403) {
          setAuthError("You don't have permission to access this resource.");
        } else {
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        }
      }
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        setError(err.message || "Failed to load profile");
      }
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout API fails, still navigate to login
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        address: profile.address || ""
      });
      setEditErrors({});
      setSuccessMessage("");
      setShowEditModal(true);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
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
    
    // Validate form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    
    try {
      setEditLoading(true);
      setEditErrors({});
      
      const result = await updateProfile(editFormData);
      
      // Update the profile state with new data
      setProfile({
        ...profile,
        ...editFormData
      });
      
      // Show success message
      setSuccessMessage("Your profile has been successfully updated!");
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      // Close modal and reset form
      handleEditCancel();
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      
      // Handle validation errors from API
      if (error.validationErrors) {
        setEditErrors(error.validationErrors);
      } else {
        setEditErrors({
          general: error.message || "Failed to update profile"
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordFormData({
      old_password: "",
      new_password: "",
      confirm_password: ""
    });
    setPasswordErrors({});
    setSuccessMessage("");
    setShowPasswordModal(true);
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setPasswordFormData({
      old_password: "",
      new_password: "",
      confirm_password: ""
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
    
    if (!passwordFormData.old_password.trim()) {
      errors.old_password = "Current password is required";
    }
    
    if (!passwordFormData.new_password.trim()) {
      errors.new_password = "New password is required";
    } else if (passwordFormData.new_password.length < 8) {
      errors.new_password = "New password must be at least 8 characters";
    }
    
    if (!passwordFormData.confirm_password.trim()) {
      errors.confirm_password = "Please confirm your new password";
    } else if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }
    
    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    try {
      setPasswordLoading(true);
      setPasswordErrors({});
      
      // Only send old_password and new_password to API (not confirm_password)
      const apiData = {
        old_password: passwordFormData.old_password,
        new_password: passwordFormData.new_password
      };
      
      const result = await changePassword(apiData);
      
      // Show success message
      setSuccessMessage("Your password has been successfully changed!");
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      // Exit password change mode
      setShowPasswordModal(false);
      setPasswordFormData({
        old_password: "",
        new_password: "",
        confirm_password: ""
      });
      
    } catch (error) {
      console.error("Failed to change password:", error);
      
      // Handle incorrect password error specifically
      if (error.isIncorrectPassword) {
        setPasswordErrors({
          old_password: "Incorrect Password!"
        });
      } else if (error.validationErrors) {
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

  // Show authentication error if user is not logged in
  if (authError) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-content">
          <div className="error-state">
            <h2>🔒 Access Denied</h2>
            <p>{authError}</p>
            <button onClick={() => navigate("/admin/login")} className="retry-button">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication or fetching profile
  if (!user && loading) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-content">
          <div className="welcome-card loading">
            <div className="spinner"></div>
            <p>Please wait while we verify your access.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <Navbar
        onLogout={handleLogout}
        userName={profile?.name || "Admin"}
      />

      <main className="admin-profile-content">
        {loading ? (
          <div className="welcome-card loading">
            <div className="spinner"></div>
            <h2>Loading Profile...</h2>
          </div>
        ) : error ? (
          <div className="error-state">
            <h2>⚠️ Something went wrong</h2>
            <p>{error}</p>
            <button onClick={fetchProfile} className="retry-button">
              Try Again
            </button>
          </div>
        ) : profile ? (
          <>
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

            <div className="admin-profile-card">
              <div className="profile-header">
                <div className="profile-title">
                  <h2>Admin Profile</h2>
                  <p>Manage your administrative account information</p>
                </div>
                <div className="profile-actions">
                  <button 
                    onClick={handleEditProfile}
                    className="edit-profile-btn"
                    title="Edit Profile"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleChangePassword}
                    className="change-password-btn"
                    title="Change Password"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="profile-content">
                {false ? (
                  <div className="profile-section">
                    <h3>Edit Personal Information</h3>
                    
                    {editErrors.general && (
                      <div className="form-error general-error">
                        {editErrors.general}
                      </div>
                    )}
                    
                    <form onSubmit={handleEditSubmit} className="edit-profile-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="profile-name">Full Name *</label>
                          <input
                            type="text"
                            id="profile-name"
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
                          <label htmlFor="profile-email">Email Address *</label>
                          <input
                            type="email"
                            id="profile-email"
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
                          <label htmlFor="profile-phone">Phone Number *</label>
                          <input
                            type="text"
                            id="profile-phone"
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
                          <label htmlFor="profile-address">Address *</label>
                          <input
                            type="text"
                            id="profile-address"
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

                      <div className="form-actions">
                        <button 
                          type="button"
                          onClick={handleCancelEdit} 
                          className="cancel-btn"
                          disabled={editLoading}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="save-btn"
                          disabled={editLoading}
                        >
                          {editLoading ? "Updating..." : "Update Profile"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="profile-section">
                    <h3>Personal Information</h3>
                    <div className="profile-grid">
                      <div className="profile-item">
                        <strong>Admin ID</strong>
                        <span>{profile.id}</span>
                      </div>
                      <div className="profile-item">
                        <strong>Full Name</strong>
                        <span>{profile.name}</span>
                      </div>
                      <div className="profile-item">
                        <strong>Email Address</strong>
                        <span>{profile.email}</span>
                      </div>
                      <div className="profile-item">
                        <strong>Phone Number</strong>
                        <span>{profile.phone_number}</span>
                      </div>
                      <div className="profile-item">
                        <strong>Address</strong>
                        <span>{profile.address}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal-content password-modal">
              <div className="modal-header">
                <h2>Change Password</h2>
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
                  <div className="form-group">
                    <label htmlFor="modal-old-password">Current Password *</label>
                    <input
                      type="password"
                      id="modal-old-password"
                      name="old_password"
                      value={passwordFormData.old_password}
                      onChange={handlePasswordFormChange}
                      placeholder="Enter current password"
                      className={passwordErrors.old_password ? 'error' : ''}
                    />
                    {passwordErrors.old_password && (
                      <span className="form-error">{passwordErrors.old_password}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="modal-new-password">New Password *</label>
                      <input
                        type="password"
                        id="modal-new-password"
                        name="new_password"
                        value={passwordFormData.new_password}
                        onChange={handlePasswordFormChange}
                        placeholder="Enter new password (min 8 characters)"
                        className={passwordErrors.new_password ? 'error' : ''}
                      />
                      {passwordErrors.new_password && (
                        <span className="form-error">{passwordErrors.new_password}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="modal-confirm-password">Confirm New Password *</label>
                      <input
                        type="password"
                        id="modal-confirm-password"
                        name="confirm_password"
                        value={passwordFormData.confirm_password}
                        onChange={handlePasswordFormChange}
                        placeholder="Confirm new password"
                        className={passwordErrors.confirm_password ? 'error' : ''}
                      />
                      {passwordErrors.confirm_password && (
                        <span className="form-error">{passwordErrors.confirm_password}</span>
                      )}
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

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content add-admin-modal">
              <div className="modal-header">
                <h2>Edit Profile</h2>
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
                      <label htmlFor="edit-phone">Phone Number *</label>
                      <input
                        type="tel"
                        id="edit-phone"
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

                    <div className="form-group">
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
                  type="button" 
                  onClick={handleEditCancel}
                  className="cancel-add-btn"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={handleEditSubmit}
                  className="confirm-add-btn"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminProfile;