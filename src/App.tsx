import { Navigate, Route, Routes } from "react-router-dom";
import Storefront from "./pages/Storefront";
import ProductPage from "./pages/ProductPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/moto/:slug" element={<ProductPage />} />
      <Route path="/mastering" element={<AdminPage />} />
      <Route path="/admin" element={<Navigate to="/mastering" replace />} />
      <Route path="/electric" element={<Navigate to="/" replace />} />
      <Route path="/electric/moto/:slug" element={<Navigate to="/moto/:slug" replace />} />
      <Route path="/electric/mastering" element={<Navigate to="/mastering" replace />} />
      <Route path="/electric/admin" element={<Navigate to="/mastering" replace />} />
    </Routes>
  );
}
