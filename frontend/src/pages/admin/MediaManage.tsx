import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listMediaFiles, uploadFile, deleteMediaFile, getMediaReferences } from '@/api/media';
import type { MediaFile } from '@/types';

export default function MediaManage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [references, setReferences] = useState<{ id: number; title: string }[]>([]);
  const [refMediaId, setRefMediaId] = useState<number | null>(null);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = () => {
    listMediaFiles(page, 15).then((res) => {
      if (res.code === 200) {
        setFiles(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
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
      if (res.code === 200) { setPage(0); fetchFiles(); } else alert(res.message);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await deleteMediaFile(id);
    if (res.code === 200) {
      fetchFiles();
      if (refMediaId === id) { setRefMediaId(null); setReferences([]); }
    } else alert(res.message);
  };

  const handleShowReferences = async (mediaId: number) => {
    if (refMediaId === mediaId) { setRefMediaId(null); setReferences([]); return; }
    setRefMediaId(mediaId);
    setLoadingRefs(true);
    try {
      const res = await getMediaReferences(mediaId);
      if (res.code === 200) setReferences(res.data);
    } catch { setReferences([]); }
    finally { setLoadingRefs(false); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const fileTypeIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return '🖼';
    if (mimeType?.startsWith('video/')) return '🎬';
    if (mimeType?.includes('pdf')) return '📕';
    return '📎';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <div className="flex items-center gap-3">
          <label className={`bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            {uploading ? 'Uploading...' : '+ Upload'}
            <input ref={fileInputRef} type="file" accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          <span className="text-xs text-gray-400">Max 2GB per file. For larger files, use chunked upload or object storage.</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">File</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Type</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Size</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Refs</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {files.map((file, idx) => (
                <>
                  <tr key={file.id} className={`hover:bg-gray-50 ${refMediaId === file.id ? 'bg-primary-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-400 text-xs">{page * 15 + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {file.mimeType?.startsWith('image/') ? (
                          <img src={file.filePath} alt={file.originalName} className="w-8 h-8 rounded object-cover shrink-0" />
                        ) : (
                          <span className="text-lg">{fileTypeIcon(file.mimeType)}</span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{file.originalName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px] hidden sm:block">{file.filePath}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{file.fileType}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-gray-500">{formatSize(file.fileSize)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleShowReferences(file.id)}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          refMediaId === file.id
                            ? 'bg-primary-600 text-white'
                            : 'text-primary-600 hover:bg-primary-50'
                        }`}>
                        {loadingRefs && refMediaId === file.id ? '...' : 'View'}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(file.filePath); alert('Copied!'); }}
                          className="text-xs text-gray-500 hover:text-primary-600 font-medium">Copy</button>
                        <button onClick={() => handleDelete(file.id, file.originalName)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium">Del</button>
                      </div>
                    </td>
                  </tr>
                  {/* References sub-row */}
                  {refMediaId === file.id && (
                    <tr key={`ref-${file.id}`}>
                      <td colSpan={7} className="px-4 py-3 bg-gray-50">
                        {references.length === 0 ? (
                          <span className="text-xs text-gray-400">No articles reference this file.</span>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 font-medium">Referenced by {references.length} article{references.length > 1 ? 's' : ''}:</span>
                            {references.map((ref) => (
                              <Link key={ref.id} to={`/admin/news/${ref.id}/edit`} className="block text-xs text-primary-600 hover:text-primary-700 hover:underline pl-2">
                                #{ref.id} — {ref.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {files.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No files uploaded yet.</p>}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">{totalElements} files total</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-30 hover:bg-gray-50">←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 3, totalPages - 7));
              const p = start + i;
              if (p >= totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-medium ${page === p ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-30 hover:bg-gray-50">→</button>
          </div>
        )}
      </div>
    </div>
  );
}
