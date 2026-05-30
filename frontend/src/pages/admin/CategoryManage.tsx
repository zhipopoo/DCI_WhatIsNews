import { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/api/category';
import type { Category, CategoryFormData } from '@/types';

const emptyForm: CategoryFormData = { name: '', slug: '', description: '', sortOrder: 0 };

export default function CategoryManage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    getAllCategories().then((res) => { if (res.code === 200) setCategories(res.data); }).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowNew(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', sortOrder: cat.sortOrder });
    setEditingId(cat.id);
    setShowNew(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { alert('Name and slug required'); return; }
    setSaving(true);
    try {
      const res = editingId ? await updateCategory(editingId, form) : await createCategory(form);
      if (res.code === 200) { fetchAll(); resetForm(); }
      else alert(res.message);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await deleteCategory(id);
      if (res.code === 200) fetchAll();
      else alert(res.message);
    } catch { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button onClick={() => { resetForm(); setShowNew(true); }} className="btn-primary">+ New Category</button>
      </div>

      {/* New/Edit Form */}
      {showNew && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4">
          <h2 className="font-bold">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="url-friendly-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={resetForm} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Slug</th>
              <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Sort</th>
              <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Articles</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{cat.slug}</td>
                <td className="px-4 py-3 text-center hidden md:table-cell">{cat.sortOrder}</td>
                <td className="px-4 py-3 text-center hidden md:table-cell">{cat.newsCount ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(cat)} className="text-xs text-primary-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
