export type SearchType = 'exhibition' | 'company';

export const getSearchPath = (type: SearchType): string => {
    return type === 'company' ? '/companies/search' : '/exhibitions/search';
};

export const getSearchTypeFromPath = (pathname: string, search: string = ''): SearchType => {
    if (pathname.startsWith('/companies') || pathname.startsWith('/exhibitors')) {
        return 'company';
    }

    if (pathname === '/search') {
        const params = new URLSearchParams(search);
        return params.get('type') === 'company' ? 'company' : 'exhibition';
    }

    return 'exhibition';
};

export const isSearchResultsPath = (pathname: string): boolean => {
    return pathname === '/search' || pathname === '/exhibitions/search' || pathname === '/companies/search';
};
