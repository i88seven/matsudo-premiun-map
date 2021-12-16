import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProductPage from "./components/pages/ProductPage";
import HomePage from "./components/pages/HomePage";

const App: React.VFC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/products" element={<ProductPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;