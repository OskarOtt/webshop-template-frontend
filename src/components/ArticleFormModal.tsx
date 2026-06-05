import { useEffect, useState } from "react";
import type { ArticleRequest, ArticleResponse, BrandResponse, CategoryResponse } from "../generated/models";
import { getBrands } from "../api/brands";
import { getCategories } from "../api/categories";
import "../styles/ArticleFormModal.css";

interface ArticleFormModalProps {
  open: boolean;
  article: ArticleResponse | null;
  onClose: () => void;
  onSave: (data: ArticleRequest) => Promise<void>;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  brandId: string;
  images: string;
  sku: string;
  size: string;
  weight: string;
  color: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  brandId: "",
  images: "",
  sku: "",
  size: "",
  weight: "",
  color: "",
  tags: "",
};

function articleToForm(article: ArticleResponse): FormState {
  return {
    name: article.name ?? "",
    description: article.description ?? "",
    price: article.price != null ? String(article.price) : "",
    stockQuantity: article.stockQuantity != null ? String(article.stockQuantity) : "",
    categoryId: article.category?.id != null ? String(article.category.id) : "",
    brandId: article.brand?.id != null ? String(article.brand.id) : "",
    images: (article.images ?? []).join(", "),
    sku: article.sku ?? "",
    size: article.size ?? "",
    weight: article.weight != null ? String(article.weight) : "",
    color: article.color ?? "",
    tags: (article.tags ?? []).join(", "),
  };
}

function formToArticleRequest(form: FormState): ArticleRequest {
  const parseCsv = (val: string) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    name: form.name || undefined,
    description: form.description || undefined,
    price: form.price !== "" ? Number(form.price) : undefined,
    stockQuantity: form.stockQuantity !== "" ? parseInt(form.stockQuantity, 10) : undefined,
    categoryId: form.categoryId !== "" ? Number(form.categoryId) : undefined,
    brandId: form.brandId !== "" ? Number(form.brandId) : undefined,
    images: parseCsv(form.images).length > 0 ? parseCsv(form.images) : undefined,
    sku: form.sku || undefined,
    size: form.size || undefined,
    weight: form.weight !== "" ? Number(form.weight) : undefined,
    color: form.color || undefined,
    tags: parseCsv(form.tags).length > 0 ? parseCsv(form.tags) : undefined,
  };
}

export default function ArticleFormModal({ open, article, onClose, onSave }: ArticleFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(article ? articleToForm(article) : EMPTY_FORM);
    setError(null);

    setOptionsLoading(true);
    setOptionsError(null);
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brnds]) => {
        setCategories(cats ?? []);
        setBrands(brnds ?? []);
      })
      .catch(() => setOptionsError("Failed to load categories/brands."))
      .finally(() => setOptionsLoading(false));
  }, [open, article]);

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(formToArticleRequest(form));
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
        {optionsError && <p className="afm-error">{optionsError}</p>}

        <form className="afm-form" onSubmit={handleSubmit}>
          <label className="afm-label">
            Name
            <input className="afm-input" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="afm-label">
            Description
            <textarea className="afm-input afm-textarea" name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>

          <div className="afm-row">
            <label className="afm-label">
              Price
              <input className="afm-input" name="price" type="number" min={0} step="0.01" value={form.price} onChange={handleChange} required />
            </label>

            <label className="afm-label">
              Stock Quantity
              <input className="afm-input" name="stockQuantity" type="number" min={0} value={form.stockQuantity} onChange={handleChange} required />
            </label>
          </div>

          <div className="afm-row">
            <label className="afm-label">
              Category
              <select className="afm-input" name="categoryId" value={form.categoryId} onChange={handleChange} disabled={optionsLoading}>
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="afm-label">
              Brand
              <select className="afm-input" name="brandId" value={form.brandId} onChange={handleChange} disabled={optionsLoading}>
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="afm-label">
            Images
            <input className="afm-input" name="images" value={form.images} onChange={handleChange} placeholder="https://img1.com, https://img2.com" />
            <span className="afm-hint">Comma-separated URLs</span>
          </label>

          <div className="afm-row">
            <label className="afm-label">
              SKU
              <input className="afm-input" name="sku" value={form.sku} onChange={handleChange} />
            </label>

            <label className="afm-label">
              Size
              <input className="afm-input" name="size" value={form.size} onChange={handleChange} />
            </label>
          </div>

          <div className="afm-row">
            <label className="afm-label">
              Weight (kg)
              <input className="afm-input" name="weight" type="number" min={0} step="0.001" value={form.weight} onChange={handleChange} />
            </label>

            <label className="afm-label">
              Color
              <input className="afm-input" name="color" value={form.color} onChange={handleChange} />
            </label>
          </div>

          <label className="afm-label">
            Tags
            <input className="afm-input" name="tags" value={form.tags} onChange={handleChange} placeholder="electronics, sale, new" />
            <span className="afm-hint">Comma-separated tags</span>
          </label>

          <div className="afm-actions">
            <button type="button" className="afm-btn afm-btn--cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="afm-btn afm-btn--save" disabled={saving || optionsLoading}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
