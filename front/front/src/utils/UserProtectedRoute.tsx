import { Outlet, Navigate } from "react-router-dom";
import { useGlobalContext } from "./ContextProvider";

const UserProtectedRoute = () => {
  const { user, auth, loading } = useGlobalContext();
  if (loading) return null;

  if (!auth) {
    return <Navigate to="/" />;
  }

  if (user === "normal") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
