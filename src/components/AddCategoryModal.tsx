import { useState } from "react";
import type { CategoryResponse } from "../generated/models";
import { createCategory } from "../api/categories";
import "../styles/AddEntityModal.css";

interface AddCategoryModalProps {
  existingCategories: CategoryResponse[];
  onClose: () => void;
  onCreated: (category: CategoryResponse) => void;
}

export default function AddCategoryModal({ existingCategories, onClose, onCreated }: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const category = await createCategory({
        name: name.trim(),
        parentId: parentId !== "" ? Number(parentId) : undefined,
      });
      if (category) onCreated(category);
      onClose();
    } catch {
      setError("Failed to create category. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="aem-overlay" onClick={onClose}>
      <div className="aem-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-category-title">
        <h2 id="add-category-title" className="aem-title">Add Category</h2>

        {error && <p className="aem-error">{error}</p>}

        <form className="aem-form" onSubmit={handleSubmit}>
          <label className="aem-label">
            Name *
            <input className="aem-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>

          <label className="aem-label">
            Parent Category
            <select className="aem-input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— None —</option>
              {existingCategories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="aem-actions">
            <button type="button" className="aem-btn aem-btn--cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="aem-btn aem-btn--save" disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
