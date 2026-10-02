import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CreateTodos from "./pages/CreateTodos";
import TodosList from "./pages/TodosList";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
      <Routes>
        {/* Entry page: Unauthenticated users render Login. Authenticated users with valid token redirect to /add */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />

        {/* Protected Routes: Must be authenticated */}
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <CreateTodos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={<Navigate to="/add" replace />}
        />

        <Route
          path="/todolist"
          element={
            <ProtectedRoute>
              <TodosList />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
