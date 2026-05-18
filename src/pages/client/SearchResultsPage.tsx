import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../../components/client/Container';
import CompanyCard from '../../components/client/CompanyCard';
import ExhibitionCard from '../../components/client/ExhibitionCard';
import PaginationControls from '../../components/client/PaginationControls';
import SearchResultCount from '../../components/client/SearchResultCount';
import { searchCompanies } from '../../services/companyService';
import { searchExhibitions } from '../../services/exhibitionService';
import { ExhibitionData } from '../../types';
import { getSearchPath, getSearchTypeFromPath, SearchType } from '../../utils/searchRouting';

const DEFAULT_PAGE_SIZE = 10;

interface CompanySearchItem {
    id: string;
    slug?: string;
    company_name: string;
    company_name_trans?: string;
    country?: string;
    province?: string;
    city?: string;
    website?: string;
    exhibitor_count?: number;
    exhibitor_countries?: string[];
    introduction?: string;
}

const parsePositiveNumber = (value: string | null, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const SearchResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const searchType: SearchType = getSearchTypeFromPath(location.pathname, location.search);
    const searchTerm = (searchParams.get('q') || '').trim();
    const currentPage = parsePositiveNumber(searchParams.get('page'), 1);
    const pageSize = parsePositiveNumber(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [exhibitions, setExhibitions] = useState<ExhibitionData[]>([]);
    const [companies, setCompanies] = useState<CompanySearchItem[]>([]);

    const headingLabel = searchType === 'exhibition' ? '国际展会' : '参展企业';
    const countLabel = searchType === 'exhibition' ? '展会' : '企业';
    const pageTitle = `${headingLabel}搜索结果 - 展外展`;

    const updateSearchParams = (updates: {
        page?: number;
        pageSize?: number;
        type?: SearchType;
        q?: string;
    }) => {
        const nextType = updates.type ?? searchType;
        const nextQuery = updates.q ?? searchTerm;
        const nextPage = updates.page ?? currentPage;
        const nextPageSize = updates.pageSize ?? pageSize;

        const nextParams = new URLSearchParams();

        if (nextQuery) {
            nextParams.set('q', nextQuery);
        }

        if (nextPage > 1) {
            nextParams.set('page', String(nextPage));
        }

        if (nextPageSize !== DEFAULT_PAGE_SIZE) {
            nextParams.set('pageSize', String(nextPageSize));
        }

        const nextPath = getSearchPath(nextType);
        const nextSearch = nextParams.toString();

        if (location.pathname === nextPath) {
            setSearchParams(nextParams, { replace: true });
            return;
        }

        navigate(`${nextPath}${nextSearch ? `?${nextSearch}` : ''}`);
    };

    useEffect(() => {
        let cancelled = false;

        const fetchResults = async () => {
            setLoading(true);
            setError(null);

            try {
                if (searchType === 'exhibition') {
                    const response = await searchExhibitions({
                        page: currentPage,
                        size: pageSize,
                        search_name: searchTerm || undefined,
                    });

                    if (cancelled) return;

                    setExhibitions(response.results);
                    setCompanies([]);
                    setTotalCount(response.total_count);
                    return;
                }

                const response = await searchCompanies({
                    page: currentPage,
                    page_size: pageSize,
                    search_name: searchTerm || undefined,
                });

                if (cancelled) return;

                setCompanies(response.data);
                setExhibitions([]);
                setTotalCount(response.total);
            } catch (err: any) {
                if (cancelled) return;

                console.error('Search failed:', err);
                setError(err.message || '搜索失败，请稍后重试。');
                setExhibitions([]);
                setCompanies([]);
                setTotalCount(0);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            cancelled = true;
        };
    }, [currentPage, pageSize, searchTerm, searchType]);

    const totalPages = useMemo(() => {
        return Math.ceil(totalCount / pageSize);
    }, [pageSize, totalCount]);

    const handleTypeChange = (nextType: SearchType) => {
        if (nextType === searchType) {
            return;
        }

        updateSearchParams({ type: nextType, page: 1 });
    };

    const renderResults = () => {
        if (loading) {
            return (
                <div className="p-10 text-center text-blue-600 bg-white shadow-md rounded-xl border border-gray-200">
                    正在加载搜索结果...
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-10 text-center text-red-600 bg-white shadow-md rounded-xl border border-red-100">
                    {error}
                </div>
            );
        }

        const isEmpty = searchType === 'exhibition' ? exhibitions.length === 0 : companies.length === 0;

        if (isEmpty) {
            return (
                <div className="p-10 text-center text-gray-500 bg-white shadow-md rounded-xl border border-gray-200">
                    {searchTerm ? `未找到与“${searchTerm}”相关的${headingLabel}。` : `暂无${headingLabel}数据。`}
                </div>
            );
        }

        return (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="px-4 pt-4">
                    <SearchResultCount totalCount={totalCount} itemLabel={countLabel} />
                </div>

                <div className="px-4 pb-6 divide-y divide-gray-200">
                    {searchType === 'exhibition'
                        ? exhibitions.map((item) => <ExhibitionCard key={item.id} data={item} />)
                        : companies.map((item) => <CompanyCard key={item.id} data={item} />)}
                </div>

                {totalPages > 1 && (
                    <PaginationControls
                        totalCount={totalCount}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalPages={totalPages}
                        baseUrl={getSearchPath(searchType)}
                        searchQuery={searchTerm}
                        defaultPageSize={DEFAULT_PAGE_SIZE}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="pb-8">
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>

            <div
                className="sticky z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur"
                style={{ top: 'var(--client-nav-height, 60px)' }}
            >
                <Container className="flex items-end gap-8">
                    <button
                        type="button"
                        onClick={() => handleTypeChange('exhibition')}
                        className={`relative py-4 text-sm font-medium transition-colors ${
                            searchType === 'exhibition' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        国际展会
                        {searchType === 'exhibition' && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTypeChange('company')}
                        className={`relative py-4 text-sm font-medium transition-colors ${
                            searchType === 'company' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        参展企业
                        {searchType === 'company' && (
                            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
                        )}
                    </button>
                </Container>
            </div>

            <Container className="pt-6">
                {renderResults()}
            </Container>
        </div>
    );
};

export default SearchResultsPage;
