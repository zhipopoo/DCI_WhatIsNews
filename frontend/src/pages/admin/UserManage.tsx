import { useState, useEffect } from 'react';
import { listUsers, createUser, updateUser, deleteUser, changeMyPassword } from '@/api/user';
import type { AdminUser, CreateUserRequest } from '@/types';

const emptyForm: CreateUserRequest = { username: '', password: '', displayName: '', email: '', isActive: true };

export default function UserManage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Create/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateUserRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Change password modal
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const fetchUsers = () => {
    listUsers(page, 15).then((res) => {
      if (res.code === 200) {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    }).catch(() => {});
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (u: AdminUser) => {
    setForm({ username: u.username, displayName: u.displayName || '', email: u.email || '', isActive: u.isActive, password: '' });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.username.trim()) { alert('Username required'); return; }
    if (!editingId && !form.password) { alert('Password required for new user'); return; }
    setSaving(true);
    try {
      const res = editingId ? await updateUser(editingId, form) : await createUser(form);
      if (res.code === 200) { fetchUsers(); resetForm(); } else alert(res.message);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Delete user "${username}"?`)) return;
    try {
      const res = await deleteUser(id);
      if (res.code === 200) fetchUsers(); else alert(res.message);
    } catch { alert('Delete failed'); }
  };

  const handleChangePwd = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { alert('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    setPwdSaving(true);
    try {
      const res = await changeMyPassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
      if (res.code === 200) {
        alert('Password changed successfully');
        setShowPwdModal(false);
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else alert(res.message);
    } catch { alert('Failed to change password'); }
    finally { setPwdSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPwdModal(true)}
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm font-medium">
            Change My Password
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium">
            + New User
          </button>
        </div>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6 space-y-4">
          <h2 className="font-bold text-gray-900">{editingId ? 'Edit User' : 'New User'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingId ? '(leave blank to keep)' : '*'}</label>
              <input type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input type="text" value={form.displayName || ''} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={resetForm} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Display Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Email</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Active</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Last Login</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{u.displayName || '-'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{u.email || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(u)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(u.id, u.username)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No users found.</p>}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">{totalElements} users total</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-30 hover:bg-gray-50">←</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 3, totalPages - 7));
              const p = start + i;
              if (p >= totalPages) return null;
              return <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium ${page === p ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p + 1}</button>;
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-30 hover:bg-gray-50">→</button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowPwdModal(false); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
            <h2 className="font-bold text-gray-900 text-lg">Change Password</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={pwdForm.oldPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={pwdForm.newPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} className="input-field" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} className="input-field" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowPwdModal(false)} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button onClick={handleChangePwd} disabled={pwdSaving}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50">
                {pwdSaving ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
