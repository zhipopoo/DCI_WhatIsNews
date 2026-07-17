import { useState, useEffect } from 'react';
import { getActiveUsefulLinks } from '@/api/usefulLink';
import type { UsefulLink } from '@/types';
import FileIcon from '@/components/FileIcon';

export default function Guidelines() {
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveUsefulLinks()
      .then((res) => {
        if (res.code === 200) setLinks(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-news mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DCI Guidelines</h1>
        <p className="text-gray-500">Downloadable resources and reference documents</p>
      </div>

      {links.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <span className="text-4xl mb-4 block">📂</span>
          <p className="text-gray-500 text-sm">No guidelines available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.filePath}
              download={link.fileName}
              className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start gap-3">
                <FileIcon fileName={link.fileName} size={32} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm leading-snug">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{link.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    {link.fileName && (
                      <span className="truncate max-w-[160px]">{link.fileName}</span>
                    )}
                    {link.fileSize && (
                      <span className="shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">{formatSize(link.fileSize)}</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
