import { useState } from 'react';
import { updateSettings } from '@/api/settings';
import { useThemeStore } from '@/store/themeStore';
import { smartUploadFile } from '@/utils/chunkedUpload';
import { generateColorPalette } from '@/utils/colorUtils';

const shadeKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

export default function ThemeSettings() {
  const { logoUrl, primaryColor, setTheme } = useThemeStore();
  const [color, setColor] = useState(primaryColor);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewLogo, setPreviewLogo] = useState<string | null>(logoUrl);

  const palette = generateColorPalette(color);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await updateSettings({
        logoUrl: previewLogo ?? '',
        primaryColor: color,
      });
      if (res.code === 200) {
        setTheme(res.data);
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Error: ' + res.message);
      }
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const mediaFile = await smartUploadFile(file);
        setPreviewLogo(mediaFile.filePath);
      } catch {
        alert('Logo upload failed');
      } finally {
        setUploading(false);
        input.remove();
      }
    };
    input.click();
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(null);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Theme Settings</h1>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded text-sm font-medium ${
          message.includes('Error') || message.includes('failed')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Logo Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Logo</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload a custom logo image for the public site. Leave empty to use the default text logo.
          </p>

          {/* Current logo preview */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
            {previewLogo ? (
              <img src={previewLogo} alt="Custom logo" className="h-10 w-auto" />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DCI</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 tracking-tight">WhatIs</span>
                  <span className="text-lg font-bold text-primary-600 tracking-tight">New</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoUpload}
              disabled={uploading}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </button>
            {previewLogo && (
              <button
                onClick={handleRemoveLogo}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        {/* Color Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Primary Color</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose the brand color used for buttons, links, accents, and navigation.
          </p>

          <div className="flex items-center gap-4 mb-4">
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="w-12 h-12 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-field w-32"
              placeholder="#C7000B"
            />
            <button
              onClick={() => setColor('#C7000B')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset to default
            </button>
          </div>

          {/* Color palette preview */}
          <div className="flex rounded-lg overflow-hidden border border-gray-100">
            {shadeKeys.map((shade) => (
              <div
                key={shade}
                className="flex-1 h-12 relative group"
                style={{ backgroundColor: `rgb(${palette[shade]})` }}
                title={`primary-${shade}: rgb(${palette[shade]})`}
              >
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {shade}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-[10px] text-gray-400">
            <span>50 (lightest)</span>
            <span>600 (base)</span>
            <span>950 (darkest)</span>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2.5 rounded hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
