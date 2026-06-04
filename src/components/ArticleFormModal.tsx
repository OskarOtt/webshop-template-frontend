import { useEffect, useState } from "react";
import type { ArticleRequest, ArticleResponse } from "../generated/models";
import "../styles/ArticleFormModal.css";

interface ArticleFormModalProps {
  open: boolean;
  article: ArticleResponse | null;
  onClose: () => void;
  onSave: (data: ArticleRequest) => Promise<void>;
}

const EMPTY: ArticleRequest = {
  name: "",
  description: "",
  price: 0,
  stockQuantity: 0,
  category: "",
  imageUrl: "",
};

export default function ArticleFormModal({ open, article, onClose, onSave }: ArticleFormModalProps) {
  const [form, setForm] = useState<ArticleRequest>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        article
          ? {
              name: article.name ?? "",
              description: article.description ?? "",
              price: article.price ?? 0,
              stockQuantity: article.stockQuantity ?? 0,
              category: article.category ?? "",
              imageUrl: article.imageUrl ?? "",
            }
          : EMPTY,
      );
      setError(null);
    }
  }, [open, article]);

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stockQuantity" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch {
      setError("Failed to save article. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="afm-overlay" onClick={onClose}>
      <div className="afm-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="afm-title">
        <h2 id="afm-title" className="afm-title">
          {article ? "Edit Article" : "Add Article"}
        </h2>

        {error && <p className="afm-error">{error}</p>}

        <form className="afm-form" onSubmit={handleSubmit}>
          <label className="afm-label">
            Name
            <input className="afm-input" name="name" value={form.name ?? ""} onChange={handleChange} required />
          </label>

          <label className="afm-label">
            Description
            <textarea className="afm-input afm-textarea" name="description" value={form.description ?? ""} onChange={handleChange} rows={3} />
          </label>

          <div className="afm-row">
            <label className="afm-label">
              Price
              <input className="afm-input" name="price" type="number" min={0} step="0.01" value={form.price ?? 0} onChange={handleChange} required />
            </label>

            <label className="afm-label">
              Stock Quantity
              <input className="afm-input" name="stockQuantity" type="number" min={0} value={form.stockQuantity ?? 0} onChange={handleChange} required />
            </label>
          </div>

          <label className="afm-label">
            Category
            <input className="afm-input" name="category" value={form.category ?? ""} onChange={handleChange} />
          </label>

          <label className="afm-label">
            Image URL
            <input className="afm-input" name="imageUrl" type="url" value={form.imageUrl ?? ""} onChange={handleChange} placeholder="https://..." />
          </label>

          <div className="afm-actions">
            <button type="button" className="afm-btn afm-btn--cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="afm-btn afm-btn--save" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
