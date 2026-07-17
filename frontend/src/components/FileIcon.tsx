interface Props {
  fileName?: string;
  size?: number;
}

export default function FileIcon({ fileName, size = 24 }: Props) {
  const ext = fileName ? fileName.split('.').pop()?.toLowerCase() || '' : '';
  const scale = size / 32;

  // PDF — red document
  if (ext === 'pdf') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M7 2h11l8 8v18a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#FEF2F2"/>
      <path d="M18 2v8h8" fill="#FECACA"/>
      <path d="M18 2l8 8H18V2z" fill="#DC2626"/>
      <path d="M5 4a2 2 0 012-2h11l9 9v19a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" stroke="#DC2626" strokeWidth="0.8"/>
      <text x="16" y="23" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="bold" fill="#DC2626">PDF</text>
    </svg>
  );

  // Word — blue "W"
  if (ext === 'doc' || ext === 'docx') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="4" width="22" height="24" rx="3" fill="#2563EB"/>
      <rect x="5" y="4" width="22" height="24" rx="3" stroke="#1D4ED8" strokeWidth="0.5"/>
      <text x="16" y="25" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="bold" fill="white">W</text>
    </svg>
  );

  // Excel — green "X"
  if (ext === 'xls' || ext === 'xlsx') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="4" width="22" height="24" rx="3" fill="#16A34A"/>
      <rect x="5" y="4" width="22" height="24" rx="3" stroke="#15803D" strokeWidth="0.5"/>
      <text x="16" y="25" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="bold" fill="white">X</text>
    </svg>
  );

  // PowerPoint — orange "P"
  if (ext === 'ppt' || ext === 'pptx') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="4" width="22" height="24" rx="3" fill="#EA580C"/>
      <rect x="5" y="4" width="22" height="24" rx="3" stroke="#C2410C" strokeWidth="0.5"/>
      <text x="16" y="25" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="bold" fill="white">P</text>
    </svg>
  );

  // Archive
  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'gz') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="5" width="22" height="22" rx="2" fill="#F3E8FF"/>
      <rect x="7" y="3" width="18" height="4" rx="1" fill="#A855F7"/>
      <rect x="5" y="5" width="22" height="22" rx="2" stroke="#A855F7" strokeWidth="0.8"/>
      <rect x="9" y="10" width="14" height="2" rx="0.5" fill="#C084FC" opacity="0.5"/>
      <rect x="9" y="14" width="14" height="2" rx="0.5" fill="#C084FC" opacity="0.4"/>
      <rect x="9" y="18" width="14" height="2" rx="0.5" fill="#C084FC" opacity="0.5"/>
    </svg>
  );

  // Image
  if (['jpg','jpeg','png','gif','svg','webp','bmp'].includes(ext)) return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="5" width="24" height="22" rx="3" fill="#EEF2FF"/>
      <circle cx="12" cy="13" r="3" fill="#A5B4FC"/>
      <path d="M4 23l8-8 4 4 3-3 9 9" fill="#818CF8"/>
      <rect x="4" y="5" width="24" height="22" rx="3" stroke="#6366F1" strokeWidth="0.8"/>
    </svg>
  );

  // Video
  if (['mp4','mov','avi','webm','mkv','flv'].includes(ext)) return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="5" width="24" height="22" rx="3" fill="#FFF1F2"/>
      <circle cx="16" cy="16" r="7" fill="#F43F5E" opacity="0.85"/>
      <path d="M13.5 12.5l6 3.5-6 3.5V12.5z" fill="white"/>
      <rect x="4" y="5" width="24" height="22" rx="3" stroke="#F43F5E" strokeWidth="0.8"/>
    </svg>
  );

  // Audio
  if (['mp3','wav','flac','aac','ogg','wma'].includes(ext)) return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="24" height="24" rx="3" fill="#F5F3FF"/>
      <path d="M11 21V13l11-2v10" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="21" r="3" fill="#A78BFA"/>
      <circle cx="20" cy="21" r="3" fill="#A78BFA"/>
      <rect x="4" y="4" width="24" height="24" rx="3" stroke="#7C3AED" strokeWidth="0.8"/>
    </svg>
  );

  // TXT
  if (ext === 'txt') return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="2" width="22" height="28" rx="3" fill="#F3F4F6"/>
      <rect x="5" y="2" width="22" height="28" rx="3" stroke="#9CA3AF" strokeWidth="0.8"/>
      <line x1="10" y1="12" x2="22" y2="12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="16" x2="22" y2="16" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="20" x2="18" y2="20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  // Default generic document
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M7 2h11l8 8v18a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" fill="#F3F4F6"/>
      <path d="M18 2v8h8" fill="#E5E7EB"/>
      <path d="M18 2l8 8H18V2z" fill="#9CA3AF"/>
      <path d="M5 4a2 2 0 012-2h11l9 9v19a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" stroke="#9CA3AF" strokeWidth="0.8"/>
    </svg>
  );
}
