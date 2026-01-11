import { Outlet, Navigate } from "react-router-dom";
import { useGlobalContext } from "./ContextProvider";

const PrivateRoutes = () => {

  const { auth, loading } = useGlobalContext();
  if (loading) return null;

  if(!auth) {
    return  <Navigate to="/"/>;
  }


  return  <Outlet /> 
};

export default PrivateRoutes;
