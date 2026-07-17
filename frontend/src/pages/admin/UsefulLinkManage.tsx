import { useState, useEffect } from 'react';
import { listAllUsefulLinks, createUsefulLink, updateUsefulLink, deleteUsefulLink } from '@/api/usefulLink';
import { smartUploadFile } from '@/utils/chunkedUpload';
import type { UsefulLink, UsefulLinkFormData } from '@/types';

const emptyForm: UsefulLinkFormData = {
  title: '',
  description: '',
  mediaFileId: undefined,
  sortOrder: 0,
  isActive: true,
};

export default function UsefulLinkManage() {
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UsefulLinkFormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchLinks = () => {
    setLoading(true);
    listAllUsefulLinks()
      .then((res) => {
        if (res.code === 200) setLinks(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      setUploadedFileName(file.name);
      setUploadProgress(0);
      try {
        const mediaFile = await smartUploadFile(file, {
          onProgress: (p) => setUploadProgress(p),
        });
        setForm((prev) => ({ ...prev, mediaFileId: mediaFile.id }));
        setUploadedFileName(mediaFile.originalName);
      } catch {
        alert('Upload failed');
        setUploadedFileName('');
      } finally {
        setUploading(false);
        setUploadProgress(0);
        input.remove();
      }
    };
    input.click();
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setUploadedFileName('');
    setUploadProgress(0);
  };

  const handleEdit = (link: UsefulLink) => {
    setEditingId(link.id);
    setForm({
      title: link.title,
      description: link.description || '',
      mediaFileId: link.mediaFileId,
      sortOrder: link.sortOrder,
      isActive: link.isActive,
    });
    setUploadedFileName(link.fileName || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }
    setSaving(true);
    try {
      const res = editingId
        ? await updateUsefulLink(editingId, form)
        : await createUsefulLink(form);
      if (res.code === 200) {
        resetForm();
        fetchLinks();
      } else {
        alert(res.message);
      }
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await deleteUsefulLink(id);
      if (res.code === 200) fetchLinks();
      else alert(res.message);
    } catch {
      alert('Delete failed');
    }
  };

  const handleToggleActive = async (link: UsefulLink) => {
    try {
      const res = await updateUsefulLink(link.id, { title: link.title, isActive: !link.isActive });
      if (res.code === 200) fetchLinks();
    } catch {
      alert('Toggle failed');
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Useful Links</h1>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">
          {editingId ? 'Edit Link' : 'Add New Link'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="Link title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="input-field"
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={uploading}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload File'}
              </button>
              {uploadedFileName && (
                <span className="text-sm text-gray-600 truncate max-w-xs">
                  {uploadedFileName}
                  {form.mediaFileId && <span className="text-green-600 ml-1">✓</span>}
                </span>
              )}
            </div>
            {uploading && (
              <div className="mt-2 w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                className="input-field"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-5 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Link' : 'Add Link'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">File</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Size</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Sort</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {links.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No useful links yet.</td>
              </tr>
            )}
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{link.title}</span>
                  {link.description && (
                    <span className="text-xs text-gray-400 block truncate max-w-xs">{link.description}</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {link.fileName ? (
                    <span className="text-sm text-gray-600 truncate max-w-[200px] block">{link.fileName}</span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-gray-500">{formatSize(link.fileSize) || '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleActive(link)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      link.isActive
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {link.isActive ? 'Active' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <span className="text-sm text-gray-500">{link.sortOrder}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {link.filePath && (
                      <a
                        href={link.filePath}
                        download={link.fileName}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    )}
                    <button onClick={() => handleEdit(link)} className="text-primary-600 hover:text-primary-700 text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(link.id, link.title)} className="text-red-500 hover:text-red-600 text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
