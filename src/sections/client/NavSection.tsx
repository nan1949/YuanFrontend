import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo2 from '../../assets/logo2.svg';
import UserNav from '../../components/client/UserNav';
import { useNavbarSearch } from '../../hooks/useNavbarSearch';

const NavSection: React.FC = () => {
  const navRef = useRef<HTMLElement | null>(null);
  const {
    handleClear,
    handleClearHistory,
    handleHistorySelect,
    handleKeyDown,
    handleKeywordChange,
    handleSearch,
    history,
    inputRef,
    isHistoryOpen,
    isSearchHighlighted,
    keyword,
    openHistory,
    placeholder,
    searchBoxRef,
  } = useNavbarSearch();

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

        <div ref={searchBoxRef} className="relative order-3 w-full md:order-none md:flex-1 md:max-w-3xl">
          <div className={`flex h-11 w-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
            isSearchHighlighted
              ? 'border-blue-400 ring-4 ring-blue-100'
              : 'border-gray-300'
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              onClick={openHistory}
              onFocus={openHistory}
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
              onClick={() => handleSearch()}
              className="shrink-0 bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              搜索
            </button>
          </div>

          {isHistoryOpen && history.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                <span className="text-xs font-medium text-gray-500">历史搜索</span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs text-gray-400 transition hover:text-red-500"
                  >
                    一键清空
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {history.map(item => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleHistorySelect(item)}
                    className="block w-full truncate px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto">
          <UserNav />
        </div>
      </div>
    </nav>
  );
};

export default NavSection;
