import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    clearSearchHistory,
    getSearchHistory,
    saveSearchHistory,
} from '../services/searchHistoryService';
import {
    getSearchPath,
    getSearchTypeFromPath,
    isSearchResultsPath,
    SearchType,
} from '../utils/searchRouting';

export const useNavbarSearch = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const searchBoxRef = useRef<HTMLDivElement | null>(null);
    const historyRequestRef = useRef<Promise<string[]> | null>(null);
    const shouldOpenHistoryRef = useRef(false);
    const focusTimeoutRef = useRef<number | null>(null);
    const highlightTimeoutRef = useRef<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isSearchHighlighted, setIsSearchHighlighted] = useState(false);
    const activeSearchType = getSearchTypeFromPath(location.pathname, location.search);

    useEffect(() => {
        if (isSearchResultsPath(location.pathname)) {
            const params = new URLSearchParams(location.search);
            setKeyword(params.get('q') || '');
            return;
        }

        setKeyword('');
    }, [location.pathname, location.search]);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!searchBoxRef.current?.contains(event.target as Node)) {
                shouldOpenHistoryRef.current = false;
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

            if (nextKeyword) {
                params.set('q', nextKeyword);
            }

            shouldOpenHistoryRef.current = false;
            setKeyword(nextKeyword);
            setIsHistoryOpen(false);
            setIsSearchHighlighted(true);
            navigate(`${getSearchPath(nextType)}${params.toString() ? `?${params.toString()}` : ''}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (focusTimeoutRef.current !== null) {
                window.clearTimeout(focusTimeoutRef.current);
            }

            if (highlightTimeoutRef.current !== null) {
                window.clearTimeout(highlightTimeoutRef.current);
            }

            focusTimeoutRef.current = window.setTimeout(() => {
                inputRef.current?.focus();
            }, 120);

            highlightTimeoutRef.current = window.setTimeout(() => {
                setIsSearchHighlighted(false);
            }, 1400);
        };

        window.addEventListener('client:navbar-search-focus', handleNavbarSearchFocus);
        return () => window.removeEventListener('client:navbar-search-focus', handleNavbarSearchFocus);
    }, [navigate]);

    useEffect(() => {
        return () => {
            if (focusTimeoutRef.current !== null) {
                window.clearTimeout(focusTimeoutRef.current);
            }

            if (highlightTimeoutRef.current !== null) {
                window.clearTimeout(highlightTimeoutRef.current);
            }
        };
    }, []);

    const loadHistory = async (): Promise<string[]> => {
        if (historyRequestRef.current) {
            return historyRequestRef.current;
        }

        setIsHistoryLoading(true);

        const request = getSearchHistory()
            .then(data => {
                setHistory(data);
                return data;
            })
            .catch(error => {
                console.error('加载搜索历史失败', error);
                return [];
            })
            .finally(() => {
                setIsHistoryLoading(false);
                historyRequestRef.current = null;
            });

        historyRequestRef.current = request;
        return request;
    };

    const openHistory = async () => {
        shouldOpenHistoryRef.current = true;

        if (history.length > 0) {
            setIsHistoryOpen(true);
        }

        const data = await loadHistory();
        setIsHistoryOpen(shouldOpenHistoryRef.current && data.length > 0);
    };

    const handleSearch = async (nextKeyword: string = keyword) => {
        const trimmedKeyword = nextKeyword.trim();
        setKeyword(nextKeyword);
        shouldOpenHistoryRef.current = false;
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

        if (trimmedKeyword) {
            params.set('q', trimmedKeyword);
        }

        navigate(`${getSearchPath(activeSearchType)}${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setKeyword(event.target.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
            shouldOpenHistoryRef.current = false;
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

    return {
        handleClear,
        handleClearHistory,
        handleHistorySelect,
        handleKeyDown,
        handleKeywordChange,
        handleSearch,
        history,
        inputRef,
        isHistoryLoading,
        isHistoryOpen,
        isSearchHighlighted,
        keyword,
        openHistory,
        placeholder,
        searchBoxRef,
    };
};
