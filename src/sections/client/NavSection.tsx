import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo2 from '../../assets/logo2.svg';
import UserNav from '../../components/client/UserNav';

type SearchType = 'exhibition' | 'company';

const NavSection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<SearchType>('exhibition');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (location.pathname !== '/search') {
      return;
    }

    const params = new URLSearchParams(location.search);
    setSearchType(params.get('type') === 'company' ? 'company' : 'exhibition');
    setKeyword(params.get('q') || '');
  }, [location.pathname, location.search]);

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    const params = new URLSearchParams();
    params.set('type', searchType);

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

  const placeholder =
    searchType === 'exhibition' ? '搜索国际展会名称、主办方、地点...' : '搜索参展企业名称、曾用名、简介...';

  return (
    <nav className="bg-white border-b border-gray-200 p-2 sticky top-0 z-50 shadow-sm">
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
            <select
              value={searchType}
              onChange={(event) => setSearchType(event.target.value as SearchType)}
              className="w-32 shrink-0 border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition focus:bg-white"
            >
              <option value="exhibition">国际展会</option>
              <option value="company">参展企业</option>
            </select>

            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-w-0 flex-1 px-4 text-sm text-gray-700 outline-none"
            />

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
