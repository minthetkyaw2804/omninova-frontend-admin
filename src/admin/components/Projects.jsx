import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser,
  logoutUser,
  fetchProjects,
  createProject,
  fetchProjectTypes,
  fetchProjectDetails,
  updateProjectDetails,
  updateProjectThumbnail,
  createProjectFeature,
  updateProjectFeatureDetails,
  addProjectFeatureImages,
  deleteProjectFeatureImage,
  deleteProjectFeature,
  deleteProject,
  apiRequest,
} from "../utils/auth";
import { buildApiUrl } from "../config/api";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Projects.css";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectTypes, setProjectTypes] = useState([]);
  const [addFormData, setAddFormData] = useState({
    name: "",
    project_type_id: "",
    description: "",
    demo_url: "",
    thumbnail: null,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addErrors, setAddErrors] = useState({});

  // View Details Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit Project Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    project_type_id: "",
    description: "",
    demo_url: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Thumbnail replacement states
  const [showThumbnailReplace, setShowThumbnailReplace] = useState(false);
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");

  // Project Features states
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showFeatureDetailsModal, setShowFeatureDetailsModal] = useState(false);
  const [viewingFeature, setViewingFeature] = useState(null);
  const [featureFormData, setFeatureFormData] = useState({
    title: "",
    description: "",
    images: [],
  });
  const [featureLoading, setFeatureLoading] = useState(false);
  const [featureErrors, setFeatureErrors] = useState({});

  // Edit Feature states
  const [showEditFeatureModal, setShowEditFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [editFeatureFormData, setEditFeatureFormData] = useState({
    title: "",
    description: "",
  });
  const [editFeatureLoading, setEditFeatureLoading] = useState(false);
  const [editFeatureErrors, setEditFeatureErrors] = useState({});

  // Feature Image Management states
  const [showAddImagesModal, setShowAddImagesModal] = useState(false);
  const [newFeatureImages, setNewFeatureImages] = useState([]);
  const [addImagesLoading, setAddImagesLoading] = useState(false);
  const [addImagesErrors, setAddImagesErrors] = useState({});
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteImageLoading, setDeleteImageLoading] = useState(false);

  // Delete Feature states
  const [showDeleteFeatureModal, setShowDeleteFeatureModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState(null);
  const [deleteFeatureLoading, setDeleteFeatureLoading] = useState(false);

  // Delete Project states
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false);

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

    loadProjects();
    loadProjectTypes();
  }, []);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.project_type
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.created_by
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.updated_by
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.id.toString().includes(searchTerm)
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchProjects();

      console.log("Projects API Response:", response);

      // Handle response structure
      let projectsData = response.data || response;
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } else {
        setProjects([]);
        setFilteredProjects([]);
        console.warn("Expected projects array, got:", projectsData);
      }
    } catch (error) {
      setError(error.message || "Failed to load projects");
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTypes = async () => {
    try {
      const response = await fetchProjectTypes();
      console.log("Project Types for dropdown:", response);

      let projectTypesData = response.data || response;
      if (Array.isArray(projectTypesData)) {
        setProjectTypes(projectTypesData);
      } else {
        setProjectTypes([]);
        console.warn("Expected project types array, got:", projectTypesData);
      }
    } catch (error) {
      console.error("Failed to fetch project types:", error);
      setProjectTypes([]);
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

  const handleAddProject = () => {
    setShowAddModal(true);
    setAddFormData({
      name: "",
      project_type_id: "",
      description: "",
      demo_url: "",
      thumbnail: null,
    });
    setAddErrors({});
    setSuccessMessage("");
  };

  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddFormData({
      name: "",
      project_type_id: "",
      description: "",
      demo_url: "",
      thumbnail: null,
    });
    setAddErrors({});
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (addErrors[name]) {
      setAddErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        setAddErrors((prev) => ({
          ...prev,
          thumbnail:
            "Please select a valid image file (JPEG, PNG, JPG, GIF, SVG)",
        }));
        e.target.value = "";
        return;
      }

      // Validate file size (optional - you can set a limit)
      const maxSize = 2 * 1024 * 1024; // 2MB (2048KB)
      if (file.size > maxSize) {
        setAddErrors((prev) => ({
          ...prev,
          thumbnail: "File size must be less than 2MB",
        }));
        e.target.value = "";
        return;
      }

      setAddFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));

      // Clear error
      if (addErrors.thumbnail) {
        setAddErrors((prev) => ({
          ...prev,
          thumbnail: null,
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!addFormData.name.trim()) {
      errors.name = "Project name is required";
    }

    if (!addFormData.project_type_id) {
      errors.project_type_id = "Project type is required";
    }

    if (!addFormData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!addFormData.demo_url.trim()) {
      errors.demo_url = "Demo URL is required";
    } else {
      // More flexible URL validation
      const urlPattern =
        /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/;
      if (!urlPattern.test(addFormData.demo_url.trim())) {
        errors.demo_url =
          "Please enter a valid URL (e.g., https://example.com or example.com)";
      }
    }

    if (!addFormData.thumbnail) {
      errors.thumbnail = "Thumbnail image is required";
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

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", addFormData.name.trim());
      formData.append("project_type_id", addFormData.project_type_id);
      formData.append("description", addFormData.description.trim());
      formData.append("demo_url", addFormData.demo_url.trim());
      formData.append("thumbnail", addFormData.thumbnail);

      const result = await createProject(formData);

      // Show success message
      setSuccessMessage(
        `Project "${addFormData.name}" has been successfully created!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the projects list
      await loadProjects();

      // Close modal and reset form
      handleAddCancel();
    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setAddErrors(error.validationErrors);
      } else {
        setAddErrors({
          general: error.message || "Failed to add project",
        });
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Action handlers for table buttons
  const handleViewDetails = async (projectId) => {
    try {
      setViewLoading(true);
      setShowViewModal(true);
      setViewingProject(null);

      const projectDetails = await fetchProjectDetails(projectId);

      // Handle response structure
      let projectData = projectDetails.data || projectDetails;
      setViewingProject(projectData);
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      setSuccessMessage(""); // Clear any success message
      setError("Failed to load project details. Please try again.");
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setEditFormData({
      name: project.name || "",
      project_type_id: project.project_type_id || "",
      description: project.description || "",
      demo_url: project.demo_url || "",
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingProject(null);
    setEditFormData({
      name: "",
      project_type_id: "",
      description: "",
      demo_url: "",
    });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (editErrors[name]) {
      setEditErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.name.trim()) {
      errors.name = "Project name is required";
    }

    if (!editFormData.project_type_id) {
      errors.project_type_id = "Project type is required";
    }

    if (!editFormData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!editFormData.demo_url.trim()) {
      errors.demo_url = "Demo URL is required";
    } else {
      // More flexible URL validation
      const urlPattern =
        /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/;
      if (!urlPattern.test(editFormData.demo_url.trim())) {
        errors.demo_url =
          "Please enter a valid URL (e.g., https://example.com or example.com)";
      }
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

      const updateData = {
        name: editFormData.name.trim(),
        project_type_id: parseInt(editFormData.project_type_id),
        description: editFormData.description.trim(),
        demo_url: editFormData.demo_url.trim(),
      };

      await updateProjectDetails(editingProject.id, updateData);

      // Show success message
      setSuccessMessage(
        `Project "${editFormData.name}" has been successfully updated!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the projects list
      await loadProjects();

      // Update the viewing project data if still viewing
      if (viewingProject && viewingProject.id === editingProject.id) {
        const updatedProject = await fetchProjectDetails(editingProject.id);
        let projectData = updatedProject.data || updatedProject;
        setViewingProject(projectData);
      }

      // Close edit modal
      handleEditCancel();
    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setEditErrors(error.validationErrors);
      } else {
        setEditErrors({
          general: error.message || "Failed to update project",
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteProjectModal(true);
  };

  // Thumbnail replacement handlers
  const handleThumbnailReplace = () => {
    setShowThumbnailReplace(true);
    setNewThumbnail(null);
    setThumbnailError("");
  };

  const handleThumbnailCancel = () => {
    setShowThumbnailReplace(false);
    setNewThumbnail(null);
    setThumbnailError("");
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        setThumbnailError(
          "Please select a valid image file (JPEG, PNG, JPG, GIF, SVG)"
        );
        e.target.value = "";
        return;
      }

      // Validate file size
      const maxSize = 2 * 1024 * 1024; // 2MB (2048KB)
      if (file.size > maxSize) {
        setThumbnailError("File size must be less than 2MB");
        e.target.value = "";
        return;
      }

      setNewThumbnail(file);
      setThumbnailError("");
    }
  };

  const handleThumbnailSubmit = async () => {
    if (!newThumbnail) {
      setThumbnailError("Please select an image file");
      return;
    }

    if (!viewingProject) {
      setThumbnailError("No project selected");
      return;
    }

    try {
      setThumbnailLoading(true);
      setThumbnailError("");

      await updateProjectThumbnail(viewingProject.id, newThumbnail);

      // Show success message
      setSuccessMessage(
        `Thumbnail for "${viewingProject.name}" has been successfully updated!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project details to show new thumbnail
      const updatedProject = await fetchProjectDetails(viewingProject.id);
      let projectData = updatedProject.data || updatedProject;
      setViewingProject(projectData);

      // Refresh the projects list
      await loadProjects();

      // Close thumbnail replacement form
      handleThumbnailCancel();
    } catch (error) {
      setThumbnailError(error.message || "Failed to update thumbnail");
    } finally {
      setThumbnailLoading(false);
    }
  };

  // Project Features handlers
  const handleAddFeature = () => {
    setShowAddFeatureModal(true);
    setFeatureFormData({
      title: "",
      description: "",
      images: [],
    });
    setFeatureErrors({});
  };

  const handleAddFeatureCancel = () => {
    setShowAddFeatureModal(false);
    setFeatureFormData({
      title: "",
      description: "",
      images: [],
    });
    setFeatureErrors({});
  };

  const handleFeatureFormChange = (e) => {
    const { name, value } = e.target;
    setFeatureFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (featureErrors[name]) {
      setFeatureErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFeatureImagesChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setFeatureErrors((prev) => ({
        ...prev,
        images:
          "Please select only valid image files (JPEG, PNG, JPG, GIF, SVG)",
      }));
      e.target.value = "";
      return;
    }

    // Validate file sizes
    const maxSize = 2 * 1024 * 1024; // 2MB per file (2048KB)
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setFeatureErrors((prev) => ({
        ...prev,
        images: "Each file must be less than 2MB",
      }));
      e.target.value = "";
      return;
    }

    setFeatureFormData((prev) => ({
      ...prev,
      images: files,
    }));

    // Clear error
    if (featureErrors.images) {
      setFeatureErrors((prev) => ({
        ...prev,
        images: null,
      }));
    }
  };

  const validateFeatureForm = () => {
    const errors = {};

    if (!featureFormData.title.trim()) {
      errors.title = "Feature title is required";
    }

    if (!featureFormData.description.trim()) {
      errors.description = "Feature description is required";
    }

    if (!featureFormData.images || featureFormData.images.length === 0) {
      errors.images = "At least one image is required";
    }

    return errors;
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateFeatureForm();
    if (Object.keys(errors).length > 0) {
      setFeatureErrors(errors);
      return;
    }

    if (!viewingProject) {
      setFeatureErrors({
        general: "No project selected",
      });
      return;
    }

    try {
      setFeatureLoading(true);
      setFeatureErrors({});

      const featureData = {
        title: featureFormData.title.trim(),
        description: featureFormData.description.trim(),
        images: featureFormData.images,
      };

      await createProjectFeature(viewingProject.id, featureData);

      // Show success message
      setSuccessMessage(
        `Feature "${featureFormData.title}" has been successfully added!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project details to show new feature
      const updatedProject = await fetchProjectDetails(viewingProject.id);
      let projectData = updatedProject.data || updatedProject;
      setViewingProject(projectData);

      // Refresh the projects list
      await loadProjects();

      // Close modal and reset form
      handleAddFeatureCancel();
    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setFeatureErrors(error.validationErrors);
      } else {
        setFeatureErrors({
          general: error.message || "Failed to add feature",
        });
      }
    } finally {
      setFeatureLoading(false);
    }
  };

  const handleViewFeatureDetails = (feature) => {
    setViewingFeature(feature);
    setShowFeatureDetailsModal(true);
  };

  // Edit Feature handlers
  const handleEditFeatureClick = (feature) => {
    setEditingFeature(feature);
    setEditFeatureFormData({
      title: feature.title || "",
      description: feature.description || "",
    });
    setEditFeatureErrors({});
    setShowEditFeatureModal(true);
  };

  const handleEditFeatureCancel = () => {
    setShowEditFeatureModal(false);
    setEditingFeature(null);
    setEditFeatureFormData({
      title: "",
      description: "",
    });
    setEditFeatureErrors({});
  };

  const handleEditFeatureFormChange = (e) => {
    const { name, value } = e.target;
    setEditFeatureFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (editFeatureErrors[name]) {
      setEditFeatureErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateEditFeatureForm = () => {
    const errors = {};

    if (!editFeatureFormData.title.trim()) {
      errors.title = "Feature title is required";
    }

    if (!editFeatureFormData.description.trim()) {
      errors.description = "Feature description is required";
    }

    return errors;
  };

  const handleEditFeatureSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateEditFeatureForm();
    if (Object.keys(errors).length > 0) {
      setEditFeatureErrors(errors);
      return;
    }

    if (!editingFeature) {
      setEditFeatureErrors({
        general: "No feature selected",
      });
      return;
    }

    try {
      setEditFeatureLoading(true);
      setEditFeatureErrors({});

      const updateData = {
        title: editFeatureFormData.title.trim(),
        description: editFeatureFormData.description.trim(),
      };

      // Update feature details
      await updateProjectFeatureDetails(editingFeature.id, updateData);

      // Show success message
      setSuccessMessage(
        `Feature "${editFeatureFormData.title}" has been successfully updated!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project details to show updated feature
      const updatedProject = await fetchProjectDetails(viewingProject.id);
      let projectData = updatedProject.data || updatedProject;
      setViewingProject(projectData);

      // Update the viewing feature data
      const updatedFeature = projectData.project_features.find(
        (f) => f.id === editingFeature.id
      );
      if (updatedFeature) {
        setViewingFeature(updatedFeature);
      }

      // Refresh the projects list
      await loadProjects();

      // Close edit modal
      handleEditFeatureCancel();
    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setEditFeatureErrors(error.validationErrors);
      } else {
        setEditFeatureErrors({
          general: error.message || "Failed to update feature",
        });
      }
    } finally {
      setEditFeatureLoading(false);
    }
  };

  // Feature Image Management handlers
  const handleAddFeatureImages = (feature) => {
    setEditingFeature(feature);
    setShowAddImagesModal(true);
    setNewFeatureImages([]);
    setAddImagesErrors({});
  };

  const handleAddImagesCancel = () => {
    setShowAddImagesModal(false);
    setEditingFeature(null);
    setNewFeatureImages([]);
    setAddImagesErrors({});
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/svg+xml",
    ];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setAddImagesErrors({
        images:
          "Please select only valid image files (JPEG, PNG, JPG, GIF, SVG)",
      });
      e.target.value = "";
      return;
    }

    // Validate file sizes
    const maxSize = 2 * 1024 * 1024; // 2MB per file (2048KB)
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setAddImagesErrors({
        images: "Each file must be less than 2MB",
      });
      e.target.value = "";
      return;
    }

    setNewFeatureImages(files);
    setAddImagesErrors({});
  };

  const handleAddImagesSubmit = async (e) => {
    e.preventDefault();

    if (!newFeatureImages || newFeatureImages.length === 0) {
      setAddImagesErrors({
        images: "Please select at least one image",
      });
      return;
    }

    if (!editingFeature) {
      setAddImagesErrors({
        general: "No feature selected",
      });
      return;
    }

    try {
      setAddImagesLoading(true);
      setAddImagesErrors({});

      await addProjectFeatureImages(editingFeature.id, newFeatureImages);

      // Show success message
      setSuccessMessage(
        `${newFeatureImages.length} image(s) have been successfully added to the feature!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project details to show new images
      const updatedProject = await fetchProjectDetails(viewingProject.id);
      let projectData = updatedProject.data || updatedProject;
      setViewingProject(projectData);

      // Update the viewing feature data
      const updatedFeature = projectData.project_features.find(
        (f) => f.id === editingFeature.id
      );
      if (updatedFeature) {
        setViewingFeature(updatedFeature);
      }

      // Refresh the projects list
      await loadProjects();

      // Close modal
      handleAddImagesCancel();
    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        setAddImagesErrors(error.validationErrors);
      } else {
        setAddImagesErrors({
          general: error.message || "Failed to add images",
        });
      }
    } finally {
      setAddImagesLoading(false);
    }
  };

  const handleDeleteFeatureImage = (image) => {
    setImageToDelete(image);
    setShowDeleteImageModal(true);
  };

  const handleDeleteImageConfirm = async () => {
    if (!imageToDelete) return;

    try {
      setDeleteImageLoading(true);
      await deleteProjectFeatureImage(imageToDelete.id);

      // Close the delete modal
      setShowDeleteImageModal(false);
      setImageToDelete(null);

      // Show success message
      setSuccessMessage(
        `Image "${imageToDelete.image_name}" has been successfully deleted!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project details to show updated feature
      const updatedProject = await fetchProjectDetails(viewingProject.id);
      let projectData = updatedProject.data || updatedProject;
      setViewingProject(projectData);

      // Update the viewing feature data if still viewing the same feature
      if (viewingFeature) {
        const updatedFeature = projectData.project_features.find(
          (f) => f.id === viewingFeature.id
        );
        if (updatedFeature) {
          setViewingFeature(updatedFeature);
        }
      }

      // Refresh the projects list
      await loadProjects();
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

  // Delete Feature handlers
  const handleDeleteFeatureClick = (feature) => {
    setFeatureToDelete(feature);
    setShowDeleteFeatureModal(true);
  };

  const handleDeleteFeatureConfirm = async () => {
    if (!featureToDelete) return;

    try {
      setDeleteFeatureLoading(true);
      await deleteProjectFeature(featureToDelete.id);

      // Close the delete modal
      setShowDeleteFeatureModal(false);
      setFeatureToDelete(null);

      // Show success message
      setSuccessMessage(
        `Feature "${featureToDelete.title}" has been successfully deleted!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Refresh the project details to show updated features
      const updatedProject = await fetchProjectDetails(viewingProject.id);
      let projectData = updatedProject.data || updatedProject;
      setViewingProject(projectData);

      // Close feature details modal if we were viewing the deleted feature
      if (viewingFeature && viewingFeature.id === featureToDelete.id) {
        setShowFeatureDetailsModal(false);
        setViewingFeature(null);
      }

      // Refresh the projects list
      await loadProjects();
    } catch (error) {
      console.error("Failed to delete feature:", error);
      alert("Failed to delete feature: " + error.message);
    } finally {
      setDeleteFeatureLoading(false);
    }
  };

  const handleDeleteFeatureCancel = () => {
    setShowDeleteFeatureModal(false);
    setFeatureToDelete(null);
  };

  // Delete Project handlers
  const handleDeleteProjectConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setDeleteProjectLoading(true);
      await deleteProject(projectToDelete.id);

      // Close the delete modal
      setShowDeleteProjectModal(false);
      setProjectToDelete(null);

      // Show success message
      setSuccessMessage(
        `Project "${projectToDelete.name}" has been successfully deleted!`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Close view modal if we were viewing the deleted project
      if (viewingProject && viewingProject.id === projectToDelete.id) {
        setShowViewModal(false);
        setViewingProject(null);
      }

      // Refresh the projects list
      await loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project: " + error.message);
    } finally {
      setDeleteProjectLoading(false);
    }
  };

  const handleDeleteProjectCancel = () => {
    setShowDeleteProjectModal(false);
    setProjectToDelete(null);
  };

  if (loading) {
    return (
      <div className="projects-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="projects-content">
          <div className="loading-card">
            <div className="spinner"></div>
            <h2>Loading Projects...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-container">
        <Navbar
          onLogout={handleLogout}
          userName={currentUserProfile?.name || "Admin"}
        />
        <main className="projects-content">
          <div className="error-state">
            <h2>⚠️ Error Loading Projects</h2>
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
    <div className="projects-container">
      <Navbar
        onLogout={handleLogout}
        userName={currentUserProfile?.name || "Admin"}
      />

      <main className="projects-content">
        <div className="projects-header">
          <div className="header-info">
            <h1>Projects Management</h1>
            <p>View and manage all projects</p>
          </div>
          <div className="header-actions">
            <div className="projects-count">
              <span className="count-badge">
                {projects.length}{" "}
                {projects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>
            <button onClick={handleAddProject} className="add-project-btn">
              Add Project
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
              placeholder="Search projects by name, type, creator, or ID..."
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
              Found {filteredProjects.length} of {projects.length} projects
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <h3>No Projects Found</h3>
            <p>There are currently no projects in the system.</p>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th className="id-cell">ID</th>
                    <th>Project Name</th>
                    <th>Type</th>
                    <th>Created By</th>
                    <th>Created Date</th>
                    <th>Updated By</th>
                    <th>Updated Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr
                      key={project.id}
                      className={index % 2 === 0 ? "even" : "odd"}
                    >
                      <td className="id-cell">
                        <span className="id-number">#{project.id}</span>
                      </td>
                      <td className="name-cell">
                        <span className="project-name">{project.name}</span>
                      </td>
                      <td className="type-cell">
                        <span className="project-type">
                          {project.project_type || "N/A"}
                        </span>
                      </td>
                      <td className="created-by-cell">
                        <span className="created-by-text">
                          {project.created_by}
                        </span>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">{project.created_at}</span>
                      </td>
                      <td className="updated-by-cell">
                        <span className="updated-by-text">
                          {project.updated_by}
                        </span>
                      </td>
                      <td className="date-cell">
                        <span className="date-text">{project.updated_at}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleViewDetails(project.id)}
                          className="action-btn view-btn"
                          title={`View details for ${project.name}`}
                        >
                          ℹ️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(project)}
                          className="action-btn delete-btn"
                          title={`Delete ${project.name}`}
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

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-project-modal">
            <div className="modal-header">
              <h2>Add New Project</h2>
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

              <form onSubmit={handleAddSubmit} className="add-project-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Project Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddFormChange}
                      placeholder="Enter project name"
                      className={addErrors.name ? "error" : ""}
                    />
                    {addErrors.name && Array.isArray(addErrors.name) ? (
                      <span className="form-error">{addErrors.name[0]}</span>
                    ) : addErrors.name ? (
                      <span className="form-error">{addErrors.name}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="project_type_id">Project Type *</label>
                    <select
                      id="project_type_id"
                      name="project_type_id"
                      value={addFormData.project_type_id}
                      onChange={handleAddFormChange}
                      className={addErrors.project_type_id ? "error" : ""}
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.type_name}
                        </option>
                      ))}
                    </select>
                    {addErrors.project_type_id &&
                    Array.isArray(addErrors.project_type_id) ? (
                      <span className="form-error">
                        {addErrors.project_type_id[0]}
                      </span>
                    ) : addErrors.project_type_id ? (
                      <span className="form-error">
                        {addErrors.project_type_id}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={addFormData.description}
                      onChange={handleAddFormChange}
                      placeholder="Enter project description"
                      rows="4"
                      className={addErrors.description ? "error" : ""}
                    />
                    {addErrors.description &&
                    Array.isArray(addErrors.description) ? (
                      <span className="form-error">
                        {addErrors.description[0]}
                      </span>
                    ) : addErrors.description ? (
                      <span className="form-error">
                        {addErrors.description}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="demo_url">Demo URL *</label>
                    <input
                      type="url"
                      id="demo_url"
                      name="demo_url"
                      value={addFormData.demo_url}
                      onChange={handleAddFormChange}
                      placeholder="https://example.com"
                      className={addErrors.demo_url ? "error" : ""}
                    />
                    {addErrors.demo_url && Array.isArray(addErrors.demo_url) ? (
                      <span className="form-error">
                        {addErrors.demo_url[0]}
                      </span>
                    ) : addErrors.demo_url ? (
                      <span className="form-error">{addErrors.demo_url}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="thumbnail">Thumbnail Image *</label>
                    <input
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={handleThumbnailChange}
                      className={addErrors.thumbnail ? "error" : ""}
                    />
                    <div className="file-info">
                      <small>
                        Supported formats: JPEG, PNG, JPG, GIF, SVG (Max: 2MB)
                      </small>
                    </div>
                    {addErrors.thumbnail &&
                    Array.isArray(addErrors.thumbnail) ? (
                      <span className="form-error">
                        {addErrors.thumbnail[0]}
                      </span>
                    ) : addErrors.thumbnail ? (
                      <span className="form-error">{addErrors.thumbnail}</span>
                    ) : null}
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {addFormData.thumbnail && (
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Thumbnail Preview</label>
                      <div className="thumbnail-preview">
                        <img
                          src={URL.createObjectURL(addFormData.thumbnail)}
                          alt="Thumbnail preview"
                          className="preview-image"
                        />
                        <p className="preview-name">
                          {addFormData.thumbnail.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                {addLoading ? "Adding..." : "Add Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Project Details Modal */}
      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal-content view-project-modal">
            <div className="modal-header">
              <h2>Project Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {viewLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading project details...</p>
                </div>
              ) : viewingProject ? (
                <div className="project-details">
                  {/* Basic Project Information */}
                  <div className="detail-section">
                    <div className="section-header">
                      <h3>Basic Information</h3>
                      <button
                        onClick={() => handleEditClick(viewingProject)}
                        className="edit-project-btn"
                        title="Edit project details"
                      >
                        Edit Project
                      </button>
                    </div>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Project ID:</label>
                        <span>{viewingProject.id}</span>
                      </div>
                      <div className="detail-item">
                        <label>Project Name:</label>
                        <span>{viewingProject.name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Project Type:</label>
                        <span>{viewingProject.project_type || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Demo URL:</label>
                        {viewingProject.demo_url ? (
                          <a
                            href={viewingProject.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="demo-link"
                          >
                            {viewingProject.demo_url}
                          </a>
                        ) : (
                          <span className="empty-text">No demo URL</span>
                        )}
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <label>Description:</label>
                      <div className="description-content">
                        {viewingProject.description || (
                          <span className="empty-text">
                            No description provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="detail-section">
                    <div className="section-header">
                      <h3>Thumbnail</h3>
                      <button
                        onClick={handleThumbnailReplace}
                        className="replace-thumbnail-btn"
                        title="Replace thumbnail"
                      >
                        Replace Thumbnail
                      </button>
                    </div>

                    {viewingProject.thumbnail_url ? (
                      <div className="thumbnail-display">
                        <img
                          src={viewingProject.thumbnail_url}
                          alt={viewingProject.name}
                          className="project-thumbnail-large"
                        />
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <span className="empty-text">
                          No thumbnail available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Features */}
                  <div className="detail-section">
                    <div className="section-header">
                      <h3>Project Features</h3>
                      <button
                        onClick={handleAddFeature}
                        className="add-feature-btn"
                        title="Add new feature"
                      >
                        Add Feature
                      </button>
                    </div>

                    {viewingProject.project_features &&
                    viewingProject.project_features.length > 0 ? (
                      <div className="features-table-container">
                        <table className="features-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Title</th>
                              <th>Description</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingProject.project_features.map(
                              (feature, index) => (
                                <tr
                                  key={feature.id}
                                  className={index % 2 === 0 ? "even" : "odd"}
                                >
                                  <td>#{feature.id}</td>
                                  <td className="feature-title">
                                    {feature.title}
                                  </td>
                                  <td className="feature-desc">
                                    {feature.description.length > 50
                                      ? `${feature.description.substring(
                                          0,
                                          50
                                        )}...`
                                      : feature.description}
                                  </td>
                                  <td>
                                    <button
                                      onClick={() =>
                                        handleViewFeatureDetails(feature)
                                      }
                                      className="action-btn view-btn"
                                      title={`View details for ${feature.title}`}
                                    >
                                      ℹ️
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteFeatureClick(feature)
                                      }
                                      className="action-btn delete-btn"
                                      title={`Delete ${feature.title}`}
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <span className="empty-text">
                          No features available for this project
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Creation/Update Information */}
                  <div className="detail-section">
                    <h3>Project History</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Created By:</label>
                        <span>{viewingProject.created_by}</span>
                      </div>
                      <div className="detail-item">
                        <label>Created Date:</label>
                        <span>{viewingProject.created_at}</span>
                      </div>
                      <div className="detail-item">
                        <label>Updated By:</label>
                        <span>{viewingProject.updated_by}</span>
                      </div>
                      <div className="detail-item">
                        <label>Updated Date:</label>
                        <span>{viewingProject.updated_at}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="error-state">
                  <p>Failed to load project details</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowViewModal(false)}
                className="cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content edit-project-modal">
            <div className="modal-header">
              <h2>Edit Project</h2>
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

              <form onSubmit={handleEditSubmit} className="edit-project-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit_name">Project Name *</label>
                    <input
                      type="text"
                      id="edit_name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      placeholder="Enter project name"
                      className={editErrors.name ? "error" : ""}
                    />
                    {editErrors.name && Array.isArray(editErrors.name) ? (
                      <span className="form-error">{editErrors.name[0]}</span>
                    ) : editErrors.name ? (
                      <span className="form-error">{editErrors.name}</span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit_project_type_id">Project Type *</label>
                    <select
                      id="edit_project_type_id"
                      name="project_type_id"
                      value={editFormData.project_type_id}
                      onChange={handleEditFormChange}
                      className={editErrors.project_type_id ? "error" : ""}
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.type_name}
                        </option>
                      ))}
                    </select>
                    {editErrors.project_type_id &&
                    Array.isArray(editErrors.project_type_id) ? (
                      <span className="form-error">
                        {editErrors.project_type_id[0]}
                      </span>
                    ) : editErrors.project_type_id ? (
                      <span className="form-error">
                        {editErrors.project_type_id}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="edit_description">Description *</label>
                    <textarea
                      id="edit_description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditFormChange}
                      placeholder="Enter project description"
                      rows="4"
                      className={editErrors.description ? "error" : ""}
                    />
                    {editErrors.description &&
                    Array.isArray(editErrors.description) ? (
                      <span className="form-error">
                        {editErrors.description[0]}
                      </span>
                    ) : editErrors.description ? (
                      <span className="form-error">
                        {editErrors.description}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="edit_demo_url">Demo URL *</label>
                    <input
                      type="url"
                      id="edit_demo_url"
                      name="demo_url"
                      value={editFormData.demo_url}
                      onChange={handleEditFormChange}
                      placeholder="https://example.com"
                      className={editErrors.demo_url ? "error" : ""}
                    />
                    {editErrors.demo_url &&
                    Array.isArray(editErrors.demo_url) ? (
                      <span className="form-error">
                        {editErrors.demo_url[0]}
                      </span>
                    ) : editErrors.demo_url ? (
                      <span className="form-error">{editErrors.demo_url}</span>
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
                {editLoading ? "Updating..." : "Update Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Feature Modal */}
      {showAddFeatureModal && (
        <div className="modal-overlay">
          <div className="modal-content add-feature-modal">
            <div className="modal-header">
              <h2>Add New Feature</h2>
              <button
                onClick={handleAddFeatureCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {featureErrors.general && (
                <div className="form-error general-error">
                  {featureErrors.general}
                </div>
              )}

              <form onSubmit={handleFeatureSubmit} className="add-feature-form">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="feature_title">Feature Title *</label>
                    <input
                      type="text"
                      id="feature_title"
                      name="title"
                      value={featureFormData.title}
                      onChange={handleFeatureFormChange}
                      placeholder="Enter feature title"
                      className={featureErrors.title ? "error" : ""}
                    />
                    {featureErrors.title &&
                    Array.isArray(featureErrors.title) ? (
                      <span className="form-error">
                        {featureErrors.title[0]}
                      </span>
                    ) : featureErrors.title ? (
                      <span className="form-error">{featureErrors.title}</span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="feature_description">
                      Feature Description *
                    </label>
                    <textarea
                      id="feature_description"
                      name="description"
                      value={featureFormData.description}
                      onChange={handleFeatureFormChange}
                      placeholder="Enter feature description"
                      rows="4"
                      className={featureErrors.description ? "error" : ""}
                    />
                    {featureErrors.description &&
                    Array.isArray(featureErrors.description) ? (
                      <span className="form-error">
                        {featureErrors.description[0]}
                      </span>
                    ) : featureErrors.description ? (
                      <span className="form-error">
                        {featureErrors.description}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="feature_images">Feature Images *</label>
                    <input
                      type="file"
                      id="feature_images"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={handleFeatureImagesChange}
                      multiple
                      className={featureErrors.images ? "error" : ""}
                    />
                    <div className="file-info">
                      <small>
                        Supported formats: JPEG, PNG, JPG, GIF, SVG (Max: 2MB
                        each). You can select multiple images.
                      </small>
                    </div>
                    {featureErrors.images &&
                    Array.isArray(featureErrors.images) ? (
                      <span className="form-error">
                        {featureErrors.images[0]}
                      </span>
                    ) : featureErrors.images ? (
                      <span className="form-error">{featureErrors.images}</span>
                    ) : null}
                  </div>
                </div>

                {/* Images Preview */}
                {featureFormData.images &&
                  featureFormData.images.length > 0 && (
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label>
                          Images Preview ({featureFormData.images.length}{" "}
                          selected)
                        </label>
                        <div className="images-preview-grid">
                          {Array.from(featureFormData.images).map(
                            (image, index) => (
                              <div key={index} className="image-preview-item">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Preview ${index + 1}`}
                                  className="preview-image"
                                />
                                <p className="preview-name">{image.name}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </form>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleAddFeatureCancel}
                className="cancel-btn"
                disabled={featureLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleFeatureSubmit}
                className="confirm-add-btn"
                disabled={featureLoading}
                type="submit"
              >
                {featureLoading ? "Adding..." : "Add Feature"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Details Modal */}
      {showFeatureDetailsModal && viewingFeature && (
        <div className="modal-overlay">
          <div className="modal-content feature-details-modal">
            <div className="modal-header">
              <h2>Feature Details</h2>
              <button
                onClick={() => setShowFeatureDetailsModal(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="feature-details">
                {/* Feature Information */}
                <div className="detail-section">
                  <div className="section-header">
                    <h3>Feature Information</h3>
                    <button
                      onClick={() => handleEditFeatureClick(viewingFeature)}
                      className="edit-feature-btn"
                      title="Edit feature details"
                    >
                      Edit Feature
                    </button>
                  </div>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Feature ID:</label>
                      <span>{viewingFeature.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>Title:</label>
                      <span>{viewingFeature.title}</span>
                    </div>
                  </div>

                  <div className="detail-item full-width">
                    <label>Description:</label>
                    <div className="description-content">
                      {viewingFeature.description || (
                        <span className="empty-text">
                          No description provided
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feature Images */}
                <div className="detail-section">
                  <div className="section-header">
                    <h3>Feature Images</h3>
                    <button
                      onClick={() => handleAddFeatureImages(viewingFeature)}
                      className="add-images-btn"
                      title="Add images to feature"
                    >
                      Add Images
                    </button>
                  </div>
                  {viewingFeature.images && viewingFeature.images.length > 0 ? (
                    <div className="images-grid">
                      {viewingFeature.images.map((image) => (
                        <div key={image.id} className="image-item">
                          <img
                            src={image.image_url}
                            alt={image.image_name}
                            className="feature-image"
                          />
                          <button
                            onClick={() => handleDeleteFeatureImage(image)}
                            className="delete-image-x-btn"
                            title={`Delete ${image.image_name}`}
                          >
                            ✕
                          </button>
                          <span className="image-name">{image.image_name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <span className="empty-text">
                        No images for this feature
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowFeatureDetailsModal(false)}
                className="cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Feature Modal */}
      {showEditFeatureModal && editingFeature && (
        <div className="modal-overlay">
          <div className="modal-content edit-feature-modal">
            <div className="modal-header">
              <h2>Edit Feature</h2>
              <button
                onClick={handleEditFeatureCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {editFeatureErrors.general && (
                <div className="form-error general-error">
                  {editFeatureErrors.general}
                </div>
              )}

              {/* Feature Details Form */}
              <form
                onSubmit={handleEditFeatureSubmit}
                className="edit-feature-form"
              >
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="edit_feature_title">Feature Title *</label>
                    <input
                      type="text"
                      id="edit_feature_title"
                      name="title"
                      value={editFeatureFormData.title}
                      onChange={handleEditFeatureFormChange}
                      placeholder="Enter feature title"
                      className={editFeatureErrors.title ? "error" : ""}
                    />
                    {editFeatureErrors.title &&
                    Array.isArray(editFeatureErrors.title) ? (
                      <span className="form-error">
                        {editFeatureErrors.title[0]}
                      </span>
                    ) : editFeatureErrors.title ? (
                      <span className="form-error">
                        {editFeatureErrors.title}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="edit_feature_description">
                      Feature Description *
                    </label>
                    <textarea
                      id="edit_feature_description"
                      name="description"
                      value={editFeatureFormData.description}
                      onChange={handleEditFeatureFormChange}
                      placeholder="Enter feature description"
                      rows="4"
                      className={editFeatureErrors.description ? "error" : ""}
                    />
                    {editFeatureErrors.description &&
                    Array.isArray(editFeatureErrors.description) ? (
                      <span className="form-error">
                        {editFeatureErrors.description[0]}
                      </span>
                    ) : editFeatureErrors.description ? (
                      <span className="form-error">
                        {editFeatureErrors.description}
                      </span>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleEditFeatureCancel}
                className="cancel-btn"
                disabled={editFeatureLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleEditFeatureSubmit}
                className="confirm-add-btn"
                disabled={editFeatureLoading}
                type="submit"
              >
                {editFeatureLoading ? "Updating..." : "Update Feature"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Images Modal */}
      {showAddImagesModal && editingFeature && (
        <div className="modal-overlay">
          <div className="modal-content add-images-modal">
            <div className="modal-header">
              <h2>Add Images to Feature</h2>
              <button
                onClick={handleAddImagesCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {addImagesErrors.general && (
                <div className="form-error general-error">
                  {addImagesErrors.general}
                </div>
              )}

              <div className="feature-info">
                <p>
                  <strong>Feature:</strong> {editingFeature.title}
                </p>
              </div>

              <form
                onSubmit={handleAddImagesSubmit}
                className="add-images-form"
              >
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="new_images">Select Images *</label>
                    <input
                      type="file"
                      id="new_images"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={handleNewImagesChange}
                      multiple
                      className={addImagesErrors.images ? "error" : ""}
                    />
                    <div className="file-info">
                      <small>
                        Supported formats: JPEG, PNG, JPG, GIF, SVG (Max: 2MB
                        each). You can select multiple images.
                      </small>
                    </div>
                    {addImagesErrors.images &&
                    Array.isArray(addImagesErrors.images) ? (
                      <span className="form-error">
                        {addImagesErrors.images[0]}
                      </span>
                    ) : addImagesErrors.images ? (
                      <span className="form-error">
                        {addImagesErrors.images}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Images Preview */}
                {newFeatureImages && newFeatureImages.length > 0 && (
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>
                        Images Preview ({newFeatureImages.length} selected)
                      </label>
                      <div className="images-preview-grid">
                        {Array.from(newFeatureImages).map((image, index) => (
                          <div key={index} className="image-preview-item">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="preview-image"
                            />
                            <p className="preview-name">{image.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleAddImagesCancel}
                className="cancel-btn"
                disabled={addImagesLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImagesSubmit}
                className="confirm-add-btn"
                disabled={
                  addImagesLoading ||
                  !newFeatureImages ||
                  newFeatureImages.length === 0
                }
                type="submit"
              >
                {addImagesLoading ? "Adding..." : "Add Images"}
              </button>
            </div>
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

      {/* Delete Feature Confirmation Modal */}
      {showDeleteFeatureModal && featureToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete Feature</h2>
              <button
                onClick={handleDeleteFeatureCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <span>⚙️</span>
                </div>
                <div className="delete-message">
                  <h3>Are you sure you want to delete this feature?</h3>
                  <p>
                    You are about to permanently delete{" "}
                    <strong>{featureToDelete.title}</strong>.
                  </p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleDeleteFeatureCancel}
                className="cancel-btn"
                disabled={deleteFeatureLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFeatureConfirm}
                className="confirm-delete-btn"
                disabled={deleteFeatureLoading}
              >
                {deleteFeatureLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteProjectModal && projectToDelete && (
        <div className="modal-overlay">
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete Project</h2>
              <button
                onClick={handleDeleteProjectCancel}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-confirmation">
                <div className="delete-icon">
                  <span>📁</span>
                </div>
                <div className="delete-message">
                  <h3>Are you sure you want to delete this project?</h3>
                  <p>
                    You are about to permanently delete{" "}
                    <strong>{projectToDelete.name}</strong>.
                  </p>
                  <p>
                    This action cannot be undone and will also delete all
                    associated features and images.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleDeleteProjectCancel}
                className="cancel-btn"
                disabled={deleteProjectLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProjectConfirm}
                className="confirm-delete-btn"
                disabled={deleteProjectLoading}
              >
                {deleteProjectLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Thumbnail Modal */}
      {showThumbnailReplace && (
        <div className="modal-overlay">
          <div className="modal-content replace-thumbnail-modal">
            <div className="modal-header">
              <h2>Replace Thumbnail</h2>
              <button onClick={handleThumbnailCancel} className="modal-close">
                ×
              </button>
            </div>

            <div className="modal-body">
              {thumbnailError && (
                <div className="form-error">{thumbnailError}</div>
              )}

              <div className="form-group">
                <label htmlFor="new_thumbnail">New Thumbnail Image *</label>
                <input
                  type="file"
                  id="new_thumbnail"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                  onChange={handleThumbnailFileChange}
                  className={thumbnailError ? "error" : ""}
                />
                <div className="file-info">
                  <small>
                    Supported formats: JPEG, PNG, JPG, GIF, SVG (Max: 2MB)
                  </small>
                </div>
              </div>

              {/* Thumbnail Preview */}
              {newThumbnail && (
                <div className="form-group">
                  <label>New Thumbnail Preview</label>
                  <div className="thumbnail-preview">
                    <img
                      src={URL.createObjectURL(newThumbnail)}
                      alt="New thumbnail preview"
                      className="preview-image"
                    />
                    <p className="preview-name">{newThumbnail.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={handleThumbnailCancel}
                className="btn-secondary"
                disabled={thumbnailLoading}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleThumbnailSubmit}
                className="confirm-add-btn"
                disabled={thumbnailLoading || !newThumbnail}
                type="button"
              >
                {thumbnailLoading ? "Updating..." : "Update Thumbnail"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Projects;
