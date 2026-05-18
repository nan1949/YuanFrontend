import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo2 from '../../assets/logo2.svg';
import UserNav from '../../components/client/UserNav';
import {
  clearSearchHistory,
  getSearchHistory,
  saveSearchHistory,
} from '../../services/searchHistoryService';

type SearchType = 'exhibition' | 'company';

const NavSection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [keyword, setKeyword] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSearchHighlighted, setIsSearchHighlighted] = useState(false);

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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    const handleNavbarSearchFocus = (event: Event) => {
      const detail = (event as CustomEvent<{ keyword?: string; type?: SearchType }>).detail;
      const nextKeyword = detail?.keyword?.trim() || '';
      const nextType = detail?.type || 'company';
      const params = new URLSearchParams();

      params.set('type', nextType);

      if (nextKeyword) {
        params.set('q', nextKeyword);
      }

      setKeyword(nextKeyword);
      setIsHistoryOpen(false);
      setIsSearchHighlighted(true);
      navigate(`/search?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 120);

      window.setTimeout(() => {
        setIsSearchHighlighted(false);
      }, 1400);
    };

    window.addEventListener('client:navbar-search-focus', handleNavbarSearchFocus);
    return () => window.removeEventListener('client:navbar-search-focus', handleNavbarSearchFocus);
  }, [navigate]);

  const activeSearchType: SearchType =
    location.pathname === '/search' && new URLSearchParams(location.search).get('type') === 'company'
      ? 'company'
      : 'exhibition';

  const loadHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await getSearchHistory();
      setHistory(data);
    } catch (error) {
      console.error('加载搜索历史失败', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const openHistory = () => {
    setIsHistoryOpen(true);
    loadHistory();
  };

  const handleSearch = async (nextKeyword: string = keyword) => {
    const trimmedKeyword = nextKeyword.trim();
    setKeyword(nextKeyword);
    setIsHistoryOpen(false);

    if (trimmedKeyword) {
      try {
        await saveSearchHistory(trimmedKeyword);
        setHistory(prev => {
          const filtered = prev.filter(item => item !== trimmedKeyword);
          return [trimmedKeyword, ...filtered].slice(0, 10);
        });
      } catch (error) {
        console.error('保存搜索历史失败', error);
      }
    }

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

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
      setIsHistoryOpen(false);
    } catch (error) {
      console.error('清空搜索历史失败', error);
    }
  };

  const handleHistorySelect = (historyKeyword: string) => {
    handleSearch(historyKeyword);
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
              onChange={(event) => setKeyword(event.target.value)}
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

          {isHistoryOpen && (
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

              {isHistoryLoading ? (
                <div className="px-4 py-3 text-sm text-gray-400">加载中...</div>
              ) : history.length > 0 ? (
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
              ) : (
                <div className="px-4 py-3 text-sm text-gray-400">暂无搜索历史</div>
              )}
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
