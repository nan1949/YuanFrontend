import api from './api';

export const getSearchHistory = async (): Promise<string[]> => {
    const res = await api.get<string[]>('/search-history');
    return res.data;
};

export const saveSearchHistory = async (keyword: string): Promise<void> => {
    await api.post(`/search-history?keyword=${encodeURIComponent(keyword)}`);
};

export const clearSearchHistory = async (): Promise<void> => {
    await api.delete('/search-history');
};
