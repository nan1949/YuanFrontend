import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../../components/client/Container';
import CompanyCard from '../../components/client/CompanyCard';
import ExhibitionCard from '../../components/client/ExhibitionCard';
import PaginationControls from '../../components/client/PaginationControls';
import SearchResultCount from '../../components/client/SearchResultCount';
import useTitle from '../../hooks/useTitle';
import { searchCompanies } from '../../services/companyService';
import { searchExhibitions } from '../../services/exhibitionService';
import { ExhibitionData } from '../../types';

const DEFAULT_PAGE_SIZE = 10;

type SearchType = 'exhibition' | 'company';

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
    const [searchParams, setSearchParams] = useSearchParams();

    const searchType: SearchType = searchParams.get('type') === 'company' ? 'company' : 'exhibition';
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

    useTitle(`${headingLabel}搜索结果 - 展外展`);

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
        nextParams.set('type', nextType);

        if (nextQuery) {
            nextParams.set('q', nextQuery);
        }

        if (nextPage > 1) {
            nextParams.set('page', String(nextPage));
        }

        if (nextPageSize !== DEFAULT_PAGE_SIZE) {
            nextParams.set('pageSize', String(nextPageSize));
        }

        setSearchParams(nextParams);
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

    const handlePageChange = (newPage: number) => {
        updateSearchParams({ page: newPage });
    };

    const handlePageSizeChange = (newSize: number) => {
        updateSearchParams({ page: 1, pageSize: newSize });
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
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>
        );
    };

    return (
        <Container className="py-8">
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                <p className="text-sm font-medium text-blue-600">统一搜索结果</p>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">{headingLabel}</h1>
                <p className="mt-2 text-sm text-gray-500">
                    {searchTerm ? `当前关键词：${searchTerm}` : `当前展示全部${headingLabel}结果。`}
                </p>
            </div>

            {renderResults()}
        </Container>
    );
};

export default SearchResultsPage;
