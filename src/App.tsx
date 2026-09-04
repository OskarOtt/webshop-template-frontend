import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import { UIProvider, useUI } from "./context/UIContext";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AdminArticlesPage from "./pages/AdminArticlesPage";
import AdminArticleFormPage from "./pages/AdminArticleFormPage";
import ArticlePage from "./pages/ArticlePage";
import CartPage from "./pages/CartPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";

function AppShell() {
  const { loginModalOpen, closeLoginModal } = useUI();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/admin/articles" element={<AdminArticlesPage />} />
        <Route path="/admin/articles/new" element={<AdminArticleFormPage />} />
        <Route path="/admin/articles/:id/edit" element={<AdminArticleFormPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
      </Routes>
      <LoginModal open={loginModalOpen} onClose={closeLoginModal} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AppShell />
      </UIProvider>
    </BrowserRouter>
  );
}

export default App;
