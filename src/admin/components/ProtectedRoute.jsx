import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const user = getUser();
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setIsChecking(false);
        // Redirect to login after a brief moment to show the error
        setTimeout(() => {
          navigate("/admin/login", { replace: true });
        }, 3000);
        return;
      }
      
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-content">
          <div className="welcome-card loading">
            <div className="spinner"></div>
            <h2>Verifying Access...</h2>
            <p>Please wait while we check your authentication.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-content">
          <div className="error-state">
            <h2>🔒 Authentication Required</h2>
            <p>You must be logged in to access this page. Redirecting to login...</p>
            <button onClick={() => navigate("/admin/login")} className="retry-button">
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;