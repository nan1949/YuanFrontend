import axios from 'axios';
import { ExhibitionData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface PaginatedExhibitionsResponse {
    total_count: number;
    results: ExhibitionData[];
}


export const getExhibitions = async (
  search_name?: string | null, 
  page: number = 1,
  size: number = 10 
): Promise<PaginatedExhibitionsResponse> => {
  try {
    let url = `${API_BASE_URL}/exhibitions?page=${page}&size=${size}`;

    if (search_name && search_name.trim() !== '') {
            url += `&search_name=${encodeURIComponent(search_name.trim())}`;
        }

    const response= await axios.get<PaginatedExhibitionsResponse>(url);

    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
            console.warn("No exhibitions found for current criteria.");
            // ⚠️ 4. 如果 404，返回一个空的分页结构对象
            return { total_count: 0, results: [] };
        }
    }
        console.error("Failed to fetch exhibitions:", error);
        throw new Error('无法获取展会数据。');
  }
};


export const getExhibitionDetail = async (id: string): Promise<ExhibitionData> => {
    try {
        const url = `${API_BASE_URL}/exhibitions/${id}`;
        const response = await axios.get<ExhibitionData>(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch exhibition detail for ID ${id}:`, error);
        throw new Error('无法获取展会详情数据。');
    }
};


export const updateExhibition = async (id: number, data: Partial<ExhibitionData>): Promise<ExhibitionData> => {
    const response = await axios.put(`${API_BASE_URL}/exhibitions/${id}`, data);
    return response.data;
};


export const deleteExhibition = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/exhibitions/${id}`);
};


export const mergeExhibitions = async (keepId: number, duplicateIds: number[]): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/exhibitions/merge`, {
        keep_id: keepId,
        duplicate_ids_to_delete: duplicateIds
    });
    return response.data;
};


export const categorizeExhibitionSeries = async (payload: {
    fair_ids: number[],
    custom_series_name?: string,
    existing_series_id?: number
}): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/exhibitions/categorize-series`, payload);
    return response.data;
};