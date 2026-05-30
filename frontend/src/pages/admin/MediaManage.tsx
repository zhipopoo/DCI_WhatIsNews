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
      if (res.code === 200) { setFiles(res.data.content); setTotalPages(res.data.totalPages); }
    }).catch(() => {});
  };

  useEffect(() => { fetchFiles(); }, [page]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const res = await uploadFile(file); if (res.code === 200) fetchFiles(); else alert(res.message); }
    catch { alert('Upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await deleteMediaFile(id);
    if (res.code === 200) { fetchFiles(); if (selectedFile?.id === id) setSelectedFile(null); }
    else alert(res.message);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <label className={`bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? 'Uploading...' : '+ Upload Image'}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} onClick={() => setSelectedFile(file)}
                className={`bg-white rounded-lg border overflow-hidden cursor-pointer transition-all ${selectedFile?.id === file.id ? 'border-primary-500 shadow-md ring-1 ring-primary-500' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={file.filePath} alt={file.originalName} className="w-full h-full object-cover" />
                  ) : <span className="text-3xl">📄</span>}
                </div>
                <div className="p-2.5">
                  <p className="text-xs truncate font-medium text-gray-700">{file.originalName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.fileSize)}</p>
                </div>
              </div>
            ))}
          </div>
          {files.length === 0 && <p className="text-center py-16 text-gray-400 text-sm">No files uploaded yet.</p>}

          {totalPages > 1 && (
            <div className="flex justify-center gap-1 mt-6">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-30">←</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-30">→</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-5 h-fit">
          {selectedFile ? (
            <div className="space-y-4">
              {selectedFile.mimeType?.startsWith('image/') && (
                <img src={selectedFile.filePath} alt={selectedFile.originalName} className="w-full rounded" />
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Name</p>
                <p className="text-sm font-medium text-gray-900 break-all">{selectedFile.originalName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Type</p>
                <p className="text-sm text-gray-600">{selectedFile.mimeType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Size</p>
                <p className="text-sm text-gray-600">{formatSize(selectedFile.fileSize)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">URL</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={selectedFile.filePath} className="text-xs bg-gray-50 px-2 py-1.5 rounded border border-gray-200 flex-1 text-gray-600" />
                  <button onClick={() => { navigator.clipboard.writeText(selectedFile.filePath); alert('Copied!'); }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0">Copy</button>
                </div>
              </div>
              <button onClick={() => handleDelete(selectedFile.id, selectedFile.originalName)}
                className="w-full bg-red-50 text-red-600 py-2 rounded text-sm font-medium hover:bg-red-100 transition-colors border border-red-100">Delete</button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">Select a file to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
