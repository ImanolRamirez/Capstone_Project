import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {

  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  if (authenticated === null) {
    return null;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace/>;
  }

  return children;
}

export default ProtectedRoute;