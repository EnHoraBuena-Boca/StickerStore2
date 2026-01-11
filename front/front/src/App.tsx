import { useEffect, useState } from "react";
import Menu from "./Menu.tsx";
import CardUpload from "./CardUpload.tsx";
import PackPage from "./PackPage.tsx";
import MyFolder from "./MyFolder.tsx";

import Home from "./Home.tsx";
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoute.tsx";
import UserProtectedRoute from "./utils/UserProtectedRoute.tsx";

import "./App.css";

function App() {

  useEffect(() => {
    document.title = "SSL-Sticker-Store";
  }, []);

  return (
    <>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route element={<UserProtectedRoute />}>
            <Route path="/CardUpload" element={<CardUpload />} />
          </Route>
          <Route path="/PackPage" element={<PackPage />} />
          <Route path="/MyFolder" element={<MyFolder />} />
        </Route>

        <Route path="/" element={<Home />} />
      </Routes>

      <header className="site-header">
        <Link to="/" className="Title">
          SSL Sticker Store
        </Link>
        <Menu />
      </header>
    </>
  );
}

export default App;
