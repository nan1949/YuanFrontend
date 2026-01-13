import api from './api';
import { ExhibitionData, EventFormat, FrequencyType} from '../types';


export interface PaginatedExhibitionsResponse {
    total_count: number;
    results: ExhibitionData[];
}

export interface ExhibitionSearchParams {
    page: number;
    size: number;
    search_name?: string | null;
    organizer_id?: number | null;
    date_status?: 'expired' | 'ongoing' | null;
    sort_by?: 'country' | 'fair_start_date' | null;
    sort_order?: 'asc' | 'desc' | null;
}


export const getExhibitions = async (
    params: ExhibitionSearchParams
): Promise<PaginatedExhibitionsResponse> => {
  try {
    const response = await api.post<PaginatedExhibitionsResponse>(`/exhibitions/search`, params);
    return response.data;

  } catch (error) {
    console.error("Failed to fetch exhibitions:", error);
    throw error;
  }
};


export const getExhibitionDetail = async (id: string): Promise<ExhibitionData> => {
    try {
        const url = `/exhibitions/${id}`;
        const response = await api.get<ExhibitionData>(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch exhibition detail for ID ${id}:`, error);
        throw new Error('无法获取展会详情数据。');
    }
};

export const createExhibition = async (data: Partial<ExhibitionData>): Promise<any> => {
    const response = await api.post(`/exhibitions`, data);
    return response.data;
};


export const updateExhibition = async (id: number, data: Partial<ExhibitionData>): Promise<ExhibitionData> => {
    const response = await api.put(`/exhibitions/${id}`, data);
    return response.data;
};


export const deleteExhibition = async (id: number): Promise<void> => {
    await api.delete(`/exhibitions/${id}`);
};


export const mergeExhibitions = async (keepId: number, duplicateIds: number[]): Promise<any> => {
    const response = await api.post(`/exhibitions/merge`, {
        keep_id: keepId,
        duplicate_ids_to_delete: duplicateIds
    });
    return response.data;
};


export const categorizeExhibitionSeries = async (fairIds: number[], seriesName: string) => {
    const response = await api.post(`/exhibitions/categorize-series`, {
        fair_ids: fairIds,
        custom_series_name: seriesName
    });
    return response.data;
};


export const getSearchHistory = async (): Promise<string[]> => {
    const res = await api.get('/search-history');
    return res.data;
};

export const saveSearchHistory = async (keyword: string): Promise<void> => {
    await api.post(`/search-history?keyword=${encodeURIComponent(keyword)}`);
};

export const getEventFormats = async (): Promise<EventFormat[]> => {
    const res = await api.get('/event-formats');
    return res.data;
};

export const getFrequencyTypes = async (): Promise<FrequencyType[]> => {
    const res = await api.get('/frequency-types');
    return res.data;
};