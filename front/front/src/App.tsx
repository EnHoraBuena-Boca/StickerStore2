import { useEffect } from "react";
import Menu from "./components/Menu.tsx";
import CardUpload from "./CardUpload.tsx";
import PackPage from "./PackPage.tsx";
import MyFolder from "./MyFolder.tsx";
import Trading from "./Trading.tsx";
import Factory from "./FactoryPage.tsx";
import Home from "./Home.tsx";
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoute.tsx";
import UserProtectedRoute from "./utils/UserProtectedRoute.tsx";
import TradingMenu from "./components/TradingMenu.tsx";
import MyCardsMenu from "./components/MyCardsMenu.tsx";
import PageWrapper from "./components/PageWrapper.tsx";

import "./App.css";

function App() {
  useEffect(() => {
    document.title = "SSL-Sticker-Store";
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-right">
          <Link to="/" className="site-title">
            SSL Sticker Store
          </Link>
          <MyCardsMenu />
          <TradingMenu />
        </div>
        <Menu />
      </header>
      <PageWrapper>
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route element={<UserProtectedRoute />}>
              <Route path="/CardUpload" element={<CardUpload />} />
            </Route>
            <Route path="/PackPage" element={<PackPage />} />
            <Route path="/MyFolder" element={<MyFolder />} />
            <Route path="/Trading" element={<Trading />} />
            <Route path="/Factory" element={<Factory />} />
          </Route>

          <Route path="/" element={<Home />} />
        </Routes>
      </PageWrapper>
    </div>
  );
}

export default App;
