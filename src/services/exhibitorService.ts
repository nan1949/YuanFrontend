import axios from 'axios';
import { ExhibitorData, CompanyData } from '../types'; // 假设导入展商数据类型

// 假设 API 基础 URL 已经定义
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 定义分页响应结构
export interface PaginatedExhibitorsResponse {
    total_count: number;
    results: CompanyData[];
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


interface ExhibitorListResponse<T> {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  data: T[]; // 这里的 T 是 ExhibitorData
  available_countries: string[];
  // 注意：后端返回的是 date 对象，前端接收为 ISO 字符串
  available_dates: string[]; 
}

interface GetExhibitorsParams {
  fair_id: number;
  fair_date?: string; // YYYY-MM-DD 格式
  country?: string;
  page: number;
  page_size: number;
}


export async function getExhibitorsByFair(
  params: GetExhibitorsParams
): Promise<ExhibitorListResponse<ExhibitorData>> {
  
  const { fair_id, fair_date, country, page, page_size } = params;

  // 构造查询参数
  const queryParams = new URLSearchParams({
    page: page.toString(),
    page_size: page_size.toString(),
  });

  if (fair_date) {
    queryParams.append('fair_date', fair_date);
  }

  if (country) {
    queryParams.append('country', country);
  }

  // 构造完整的 URL
  const url = `${API_BASE_URL}/fair/${fair_id}/exhibitors?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 抛出错误，以便调用 useEffect 中的 catch 块捕获
      throw new Error(`Failed to fetch exhibitors: ${response.statusText}`);
    }

    const data: ExhibitorListResponse<ExhibitorData> = await response.json();
    return data;

  } catch (error) {
    console.error('Error in getExhibitorsByFair:', error);
    // 返回一个默认的空结构，避免调用方崩溃
    return {
      total_count: 0,
      total_pages: 0,
      current_page: 1,
      page_size: params.page_size,
      data: [],
      available_countries: [],
      available_dates: [],
    };
  }
}