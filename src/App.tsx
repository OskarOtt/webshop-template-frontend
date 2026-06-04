import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AdminArticlesPage from "./pages/AdminArticlesPage";
import ArticlePage from "./pages/ArticlePage";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/articles" element={<AdminArticlesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
