import { useState, useEffect, useRef } from 'react';
import { listMediaFiles, uploadFile, deleteMediaFile } from '@/api/media';
import type { MediaFile } from '@/types';

export default function MediaManage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = () => {
    listMediaFiles(page, 20).then((res) => {
      if (res.code === 200) {
        setFiles(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    }).catch(() => {});
  };

  useEffect(() => { fetchFiles(); }, [page]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.code === 200) {
        fetchFiles();
      } else {
        alert(res.message);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await deleteMediaFile(id);
    if (res.code === 200) {
      fetchFiles();
      if (selectedFile?.id === id) setSelectedFile(null);
    } else {
      alert(res.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('URL copied!'));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <label className={`btn-primary cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? 'Uploading...' : '+ Upload Image'}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border-2 transition-colors ${selectedFile?.id === file.id ? 'border-primary-500' : 'border-transparent hover:border-gray-200'}`}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={file.filePath} alt={file.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📄</span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs truncate font-medium">{file.originalName}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.fileSize)}</p>
                </div>
              </div>
            ))}
          </div>
          {files.length === 0 && <p className="text-center py-8 text-gray-400">No files uploaded yet.</p>}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-30">←</button>
              <span className="px-3 py-1 text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded disabled:opacity-30">→</button>
            </div>
          )}
        </div>

        {/* Detail sidebar */}
        <div className="bg-white rounded-xl shadow-sm p-4 h-fit">
          {selectedFile ? (
            <div className="space-y-3">
              {selectedFile.mimeType?.startsWith('image/') && (
                <img src={selectedFile.filePath} alt={selectedFile.originalName} className="w-full rounded" />
              )}
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm font-medium break-all">{selectedFile.originalName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Type</p>
                <p className="text-sm">{selectedFile.mimeType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Size</p>
                <p className="text-sm">{formatSize(selectedFile.fileSize)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">URL</p>
                <div className="flex items-center gap-2 mt-1">
                  <input readOnly value={selectedFile.filePath} className="text-xs bg-gray-50 px-2 py-1 rounded flex-1" />
                  <button onClick={() => copyToClipboard(selectedFile.filePath)} className="text-xs text-primary-600 hover:underline shrink-0">Copy</button>
                </div>
              </div>
              <button onClick={() => handleDelete(selectedFile.id, selectedFile.originalName)} className="btn-danger w-full text-sm">Delete</button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Select a file to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
