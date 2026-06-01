import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById, createNews, updateNews } from '@/api/news';
import { getAllCategories } from '@/api/category';
import { uploadFile } from '@/api/media';
import type { NewsFormData, Category } from '@/types';
import { useEditor, EditorContent, Node } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

// Custom TipTap Video node extension
const VideoNode = Node.create({
  name: 'videoNode',
  group: 'block',
  atom: true,
  addAttributes() { return { src: { default: null }, controls: { default: 'true' }, style: { default: 'max-width:100%;width:100%;border-radius:6px;' } }; },
  parseHTML() { return [{ tag: 'video' }]; },
  renderHTML({ HTMLAttributes }: any) { return ['video', { controls: true, preload: 'metadata', ...HTMLAttributes }]; },
});

// Custom TipTap Audio node extension
const AudioNode = Node.create({
  name: 'audioNode',
  group: 'block',
  atom: true,
  addAttributes() { return { src: { default: null }, controls: { default: 'true' }, style: { default: 'width:100%;' } }; },
  parseHTML() { return [{ tag: 'audio' }]; },
  renderHTML({ HTMLAttributes }: any) { return ['audio', { controls: true, preload: 'metadata', ...HTMLAttributes }]; },
});

// Allow wrapper div for video styling
const WrapperDiv = Node.create({
  name: 'wrapperDiv',
  group: 'block',
  content: 'block+',
  addAttributes() { return { class: { default: '' }, style: { default: '' } }; },
  parseHTML() { return [{ tag: 'div.video-wrapper' }, { tag: 'div.file-attachment' }]; },
  renderHTML({ HTMLAttributes }: any) { return ['div', HTMLAttributes, 0]; },
});

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
      VideoNode,
      AudioNode,
      WrapperDiv,
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

  // Generic file upload helper (returns URL on success)
  const uploadAndGetUrl = async (file: File): Promise<string | null> => {
    try {
      const res = await uploadFile(file);
      if (res.code === 200) return res.data.filePath;
      alert('Upload failed: ' + (res.message || 'Unknown error'));
      return null;
    } catch (e: any) {
      alert('Upload failed: ' + (e?.message || 'Network error'));
      return null;
    }
  };

  // Trigger file picker and upload
  const pickAndUpload = useCallback((accept: string, onDone: (url: string, file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const url = await uploadAndGetUrl(file);
      if (url) onDone(url, file);
      input.remove();
    };
    // Handle cancel (no file selected)
    input.oncancel = () => input.remove();
    input.click();
  }, [editor]);

  // Image upload
  const handleImageUpload = useCallback(() => {
    pickAndUpload('image/*', (url) => {
      editor?.chain().focus().setImage({ src: url }).run();
    });
  }, [editor, pickAndUpload]);

  // File/Video upload
  const handleFileUpload = useCallback(() => {
    pickAndUpload('.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.mp4,.mov,.avi,.webm,.mkv,.mp3', (url, file) => {
      if (file.type.startsWith('video/')) {
        editor?.chain().focus().insertContent({
          type: 'paragraph',
          content: [
            { type: 'text', text: `🎬 ${file.name}`, marks: [{ type: 'bold' }] },
          ],
        }).run();
        editor?.chain().focus().insertContent(
          `<div class="video-wrapper" style="margin:12px 0;"><video controls preload="metadata" src="${url}" style="max-width:100%;width:100%;border-radius:6px;" title="${file.name}"></video></div><p></p>`
        ).run();
      } else if (file.type.startsWith('audio/')) {
        editor?.chain().focus().insertContent(
          `<div style="margin:12px 0;"><audio controls preload="metadata" src="${url}" style="width:100%;" title="${file.name}"></audio></div><p></p>`
        ).run();
      } else {
        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const sizeStr = file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
        editor?.chain().focus().insertContent(
          `<p style="margin:12px 0;"><a href="${url}" download="${file.name}" style="display:inline-flex;align-items:center;gap:10px;padding:10px 16px;border:1px solid #ddd;border-radius:8px;text-decoration:none;color:#333;background:#f9f9f9;">
            <span style="font-size:1.5em;">📎</span>
            <span><strong style="color:#111;">${file.name}</strong><br><small style="color:#888;">${ext} · ${sizeStr} · Click to download</small></span>
          </a></p><p></p>`
        ).run();
      }
    });
  }, [editor, pickAndUpload]);

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
