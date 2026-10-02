import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-wide">
          Loading...
        </p>
      </div>
    );
  }

  // If user is authenticated with a valid token, direct them to create todo page
  if (user) {
    return <Navigate to="/add" replace />;
  }

  return children;
};

export default PublicRoute;
