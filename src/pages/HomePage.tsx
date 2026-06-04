import { useEffect, useState } from "react";
import { getArticles } from "../api/articles";
import type { ArticleResponse } from "../generated/models";
import ProductCard from "../components/ProductCard";
import "../styles/HomePage.css";

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArticles()
      .then((data) => setArticles(data ?? []))
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="home-page">
      <h1 className="home-page__title">Our Products</h1>

      {loading && <p className="home-page__status">Loading…</p>}
      {error && <p className="home-page__status home-page__status--error">{error}</p>}

      {!loading && !error && articles.length === 0 && (
        <p className="home-page__status">No products available yet.</p>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="home-page__grid">
          {articles.map((article) => (
            <ProductCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
