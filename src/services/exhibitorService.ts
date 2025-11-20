import axios from 'axios';
import { ExhibitorData } from '../types'; // 假设导入展商数据类型

// 假设 API 基础 URL 已经定义
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 定义分页响应结构
export interface PaginatedExhibitorsResponse {
    total_count: number;
    results: ExhibitorData[];
}


export const getExhibitors = async (
  search_name?: string | null, 
  page: number = 1,
  size: number = 10 
): Promise<PaginatedExhibitorsResponse> => {
  try {

    let url = `${API_BASE_URL}/exhibitors?page=${page}&size=${size}`;

    if (search_name && search_name.trim() !== '') {
        url += `&search_name=${encodeURIComponent(search_name.trim())}`;
    }

    const response = await axios.get<PaginatedExhibitorsResponse>(url);

    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
 
        if (error.response?.status === 404) {
            console.warn("No exhibitors found for current criteria.");

            return { total_count: 0, results: [] };
        }
    }
    
    console.error("Failed to fetch exhibitors:", error);
    throw new Error('无法获取展商数据。');
  }
};