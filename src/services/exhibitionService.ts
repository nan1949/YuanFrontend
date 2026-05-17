import api from './api';
import { ExhibitionData, EventFormat, FrequencyType} from '../types';


export interface PaginatedExhibitionsResponse {
    total_count: number;
    results: ExhibitionData[];
}

export interface HomepageFeatureExhibition {
    id: number;
    target_type: string;
    target_id: number;
    sort_order: number;
    status: number;
    created_at: string;
    updated_at: string;
    exhibition: ExhibitionData;
}

export interface ExhibitionSearchParams {
    page: number;
    size: number;
    search_name?: string | null;
    organizer_id?: number | null;
    date_status?: 'expired' | 'ongoing' | 'none' | null;
    fair_status?: 'active' | 'draft' | 'postponed' | 'cancelled' | 'ceased' | null;
    sort_by?: 'country' | 'fair_start_date' | null;
    sort_order?: 'asc' | 'desc' | null;
}


export const searchExhibitions = async (
    params: ExhibitionSearchParams
): Promise<PaginatedExhibitionsResponse> => {
  try {
    const response = await api.post<PaginatedExhibitionsResponse>(`/exhibitions/search`, params);
    return response.data;

  } catch (error) {
    console.error("Failed to search exhibitions:", error);
    throw error;
  }
};

export const getHomepageFeatureExhibitions = async (): Promise<HomepageFeatureExhibition[]> => {
    try {
        const response = await api.get<HomepageFeatureExhibition[]>(`/homepage-features/exhibitions`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch homepage feature exhibitions:", error);
        throw error;
    }
};


export const getExhibitionDetail = async (slug: string): Promise<ExhibitionData> => {
    try {
        const url = `/exhibitions/${slug}`;
        const response = await api.get<ExhibitionData>(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch exhibition detail for ID ${slug}:`, error);
        throw new Error('无法获取展会详情数据。');
    }
};

export const createExhibition = async (data: Partial<ExhibitionData>): Promise<any> => {
    const response = await api.post(`/exhibitions`, data);
    return response.data;
};


export const updateExhibition = async (slug: string, data: Partial<ExhibitionData>): Promise<ExhibitionData> => {
    const response = await api.put(`/exhibitions/${slug}`, data);
    return response.data;
};



export const deleteExhibition = async (slug: string): Promise<void> => {
    await api.delete(`/exhibitions/${slug}`);
};


export const mergeExhibitions = async (keepId: number, duplicateIds: number[]): Promise<any> => {
    const response = await api.post(`/exhibitions/merge`, {
        keep_id: keepId,
        duplicate_ids_to_delete: duplicateIds
    });
    return response.data;
};


export const localizeExhibitionImage = async (
    slug: string, 
    externalUrl: string, 
    targetType: 'logo_url' | 'banner_url'
): Promise<ExhibitionData> => {
    const response = await api.post(`/exhibitions/${slug}/localize-image`, {
        external_url: externalUrl,
        target_type: targetType
    });
    return response.data;
};


export const getEventFormats = async (): Promise<EventFormat[]> => {
    const res = await api.get('/event-formats');
    return res.data;
};

export const getFrequencyTypes = async (): Promise<FrequencyType[]> => {
    const res = await api.get('/frequency-types');
    return res.data;
};
