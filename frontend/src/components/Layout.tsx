import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getAllCategories } from '@/api/category';
import type { Category } from '@/types';

export default function Layout() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCategories()
      .then((res) => { if (res.code === 200) setCategories(res.data); })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/news?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-news mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WN</span>
            </div>
            <span className="text-xl font-bold text-gray-900">WhatIsNews</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/news" className="text-gray-600 hover:text-primary-600 transition-colors">News</Link>
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Search + Mobile toggle */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search news..."
                className="w-48 px-3 py-1.5 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="bg-primary-600 text-white px-3 py-1.5 rounded-r-lg text-sm hover:bg-primary-700">
                Search
              </button>
            </form>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/news" className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>News</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="block py-2 text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="flex pt-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search news..."
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-l-lg text-sm"
              />
              <button type="submit" className="bg-primary-600 text-white px-3 py-1.5 rounded-r-lg text-sm">Search</button>
            </form>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-news mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">WN</span>
                </div>
                <span className="text-white font-bold">WhatIsNews</span>
              </div>
              <p className="text-sm">Your trusted source for technology and AI news.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Categories</h4>
              <ul className="space-y-1 text-sm">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`} className="hover:text-white transition-colors">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Links</h4>
              <ul className="space-y-1 text-sm">
                <li><Link to="/news" className="hover:text-white transition-colors">All News</Link></li>
                <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} WhatIsNews. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
