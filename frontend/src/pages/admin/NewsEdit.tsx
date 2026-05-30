import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById, createNews, updateNews } from '@/api/news';
import { getAllCategories } from '@/api/category';
import { uploadFile } from '@/api/media';
import type { NewsFormData, Category } from '@/types';

export default function NewsEdit() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<NewsFormData>({
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    coverImage: '',
    categoryId: 1,
    tags: '',
    author: '',
    isPublished: false,
    isTop: false,
  });

  useEffect(() => {
    getAllCategories().then((res) => { if (res.code === 200) setCategories(res.data); }).catch(() => {});
    if (isEdit && id) {
      setLoading(true);
      getNewsById(Number(id))
        .then((res) => {
          if (res.code === 200) {
            const n = res.data;
            setForm({
              title: n.title,
              subtitle: n.subtitle || '',
              summary: n.summary || '',
              content: n.content,
              coverImage: n.coverImage || '',
              categoryId: n.categoryId,
              tags: n.tags || '',
              author: n.author,
              isPublished: n.isPublished,
              isTop: n.isTop,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (field: keyof NewsFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.code === 200) {
        handleChange('coverImage', res.data.filePath);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const res = isEdit
        ? await updateNews(Number(id), form)
        : await createNews(form);
      if (res.code === 200) {
        navigate('/admin/news');
      } else {
        alert(res.message);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Article' : 'New Article'}</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="input-field" placeholder="Article title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="input-field" placeholder="Optional subtitle" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.categoryId} onChange={(e) => handleChange('categoryId', Number(e.target.value))} className="input-field">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" value={form.author} onChange={(e) => handleChange('author', e.target.value)} className="input-field" placeholder="Author name" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => handleChange('tags', e.target.value)} className="input-field" placeholder="e.g. AI, Cloud, Machine Learning" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <textarea value={form.summary} onChange={(e) => handleChange('summary', e.target.value)} className="input-field" rows={3} placeholder="Short summary for cards and previews" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div className="flex items-center gap-4">
              <input type="text" value={form.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} className="input-field flex-1" placeholder="Image URL or upload" />
              <label className="btn-secondary cursor-pointer whitespace-nowrap">
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            {form.coverImage && (
              <img src={form.coverImage} alt="Preview" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">Content (HTML)</h2>
          <p className="text-xs text-gray-400">Enter HTML content. You can use a rich text editor or paste HTML directly.</p>
          <textarea
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="input-field font-mono text-sm"
            rows={20}
            placeholder="<h2>Article heading</h2><p>Article content...</p>"
          />
        </div>

        {/* Publishing options */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-lg">Publishing Options</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Publish immediately</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isTop} onChange={(e) => handleChange('isTop', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Pin to top</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
          <button type="button" onClick={() => navigate('/admin/news')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
