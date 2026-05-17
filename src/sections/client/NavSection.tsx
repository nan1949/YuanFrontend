import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo2 from '../../assets/logo2.svg';
import UserNav from '../../components/client/UserNav';

type SearchType = 'exhibition' | 'company';

const NavSection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      setKeyword(params.get('q') || '');
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const updateNavHeight = () => {
      const navHeight = navRef.current?.offsetHeight ?? 60;
      document.documentElement.style.setProperty('--client-nav-height', `${navHeight}px`);
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);

    return () => {
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  const activeSearchType: SearchType =
    location.pathname === '/search' && new URLSearchParams(location.search).get('type') === 'company'
      ? 'company'
      : 'exhibition';

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    const params = new URLSearchParams();
    params.set('type', activeSearchType);

    if (trimmedKeyword) {
      params.set('q', trimmedKeyword);
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setKeyword('');
    inputRef.current?.focus();
  };

  const placeholder =
    activeSearchType === 'company' ? '搜索参展企业名称、曾用名、简介...' : '搜索国际展会名称、主办方、地点...';

  return (
    <nav ref={navRef} className="bg-white border-b border-gray-200 p-2 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 flex items-center">
          <img
            src={logo2}
            alt="ExpoAgain Logo"
            className="h-10 w-auto"
          />
        </Link>

        <div className="order-3 w-full md:order-none md:flex-1 md:max-w-3xl">
          <div className="flex h-11 w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-w-0 flex-1 px-4 text-sm text-gray-700 outline-none"
            />

            {keyword && (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 px-3 text-gray-400 transition hover:text-gray-700"
                aria-label="清空搜索内容"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L14 14M14 6L6 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={handleSearch}
              className="shrink-0 bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              搜索
            </button>
          </div>
        </div>

        <div className="ml-auto">
          <UserNav />
        </div>
      </div>
    </nav>
  );
};

export default NavSection;
