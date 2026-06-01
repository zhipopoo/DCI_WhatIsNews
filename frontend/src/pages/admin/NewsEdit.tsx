import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById, createNews, updateNews } from '@/api/news';
import { getAllCategories } from '@/api/category';
import { uploadFile } from '@/api/media';
import type { NewsFormData, Category } from '@/types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

export default function NewsEdit() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialContent, setInitialContent] = useState('');

  const [form, setForm] = useState<NewsFormData>({
    title: '', subtitle: '', summary: '', content: '', coverImage: '',
    categoryId: 1, tags: '', author: '', isPublished: false, isTop: false,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ allowBase64: false, inline: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary-600 underline' } }),
      Underline,
      Placeholder.configure({ placeholder: 'Write your article content...' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm((prev) => ({ ...prev, content: html }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Set editor content when article loads in edit mode
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    getAllCategories().then((res) => { if (res.code === 200) setCategories(res.data); }).catch(() => {});
    if (isEdit && id) {
      setLoading(true);
      getNewsById(Number(id)).then((res) => {
        if (res.code === 200) {
          const n = res.data;
          setForm({
            title: n.title, subtitle: n.subtitle || '', summary: n.summary || '',
            content: n.content, coverImage: n.coverImage || '', categoryId: n.categoryId,
            tags: n.tags || '', author: n.author, isPublished: n.isPublished, isTop: n.isTop,
          });
          setInitialContent(n.content || '');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (field: keyof NewsFormData, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const res = await uploadFile(file); if (res.code === 200) handleChange('coverImage', res.data.filePath); }
    catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  // Generic file upload helper
  const uploadAndGetUrl = async (file: File): Promise<string | null> => {
    try {
      const res = await uploadFile(file);
      if (res.code === 200) return res.data.filePath;
      return null;
    } catch { return null; }
  };

  // Image upload handler
  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const url = await uploadAndGetUrl(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  }, [editor]);

  // File attachment handler (PDF, video, etc.)
  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.mp4,.mov,.avi,.webm,.mp3';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const url = await uploadAndGetUrl(file);
      if (url) {
        const isVideo = file.type.startsWith('video/');
        if (isVideo) {
          // Insert video as HTML5 video tag
          editor.chain().focus().insertContent(
            `<div class="video-wrapper"><video controls src="${url}" style="max-width:100%;margin:1rem 0;"></video></div><p></p>`
          ).run();
        } else {
          // Insert as download link with file icon
          const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
          editor.chain().focus().insertContent(
            `<p><a href="${url}" download="${file.name}" class="file-attachment" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid #ddd;border-radius:6px;text-decoration:none;color:#333;background:#f9f9f9;margin:8px 0;">
              <span style="font-size:1.2em;">📎</span>
              <span><strong>${file.name}</strong><br><small style="color:#888;">${ext} · ${(file.size / 1024).toFixed(0)} KB · Click to download</small></span>
            </a></p><p></p>`
          ).run();
        }
      }
    };
    input.click();
  }, [editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { alert('Title and content are required'); return; }
    setSaving(true);
    try {
      const res = isEdit ? await updateNews(Number(id), form) : await createNews(form);
      if (res.code === 200) navigate('/admin/news'); else alert(res.message);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>;
  }

  const ToolbarButton = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) => (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded text-sm transition-colors ${active ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      {children}
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Article' : 'New Article'}</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Basic Information</h2>

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
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
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
            <div className="flex items-center gap-3">
              <input type="text" value={form.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} className="input-field flex-1" placeholder="Image URL or upload" />
              <label className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded text-sm cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            {form.coverImage && <img src={form.coverImage} alt="Preview" className="mt-2 h-32 object-cover rounded" />}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Content</h2>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 pb-3">
            {/* Heading */}
            <select
              onChange={(e) => {
                const level = Number(e.target.value);
                if (level === 0) editor?.chain().focus().setParagraph().run();
                else editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
              }}
              className="text-sm border border-gray-200 rounded p-1.5 bg-white text-gray-700"
            >
              <option value="0">Paragraph</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>

            <span className="w-px h-6 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold"><strong>B</strong></ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic"><em>I</em></ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} title="Underline"><span className="underline">U</span></ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough"><span className="line-through">S</span></ToolbarButton>

            <span className="w-px h-6 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet List">•≡</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered List">1≡</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">❝</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code">{'<>'}</ToolbarButton>

            <span className="w-px h-6 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">—</ToolbarButton>
            <ToolbarButton onClick={handleImageUpload} title="Insert Image">🖼</ToolbarButton>
            <ToolbarButton onClick={handleFileUpload} title="Attach File (PDF/Video)">📎</ToolbarButton>

            <span className="w-px h-6 bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => {
                const url = window.prompt('Link URL:');
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
              className={`p-1.5 rounded text-sm transition-colors ${editor?.isActive('link') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Insert Link"
            >🔗</button>
            <ToolbarButton onClick={() => editor?.chain().focus().unsetLink().run()} title="Remove Link" active={false}>✂</ToolbarButton>
          </div>

          {/* Editor area */}
          <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Publishing Options</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isTop} onChange={(e) => handleChange('isTop', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm text-gray-700">Pin to top</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2.5 rounded hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
          <button type="button" onClick={() => navigate('/admin/news')} className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded hover:bg-gray-50 transition-colors text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
